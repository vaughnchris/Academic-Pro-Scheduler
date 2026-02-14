
import React, { useState, useMemo } from 'react';
import { INITIAL_SCHEDULE, MOCK_REQUESTS, INITIAL_COURSES, INITIAL_MODALITIES, INITIAL_CAMPUSES, INITIAL_ROOMS, INITIAL_INSTRUCTORS, TIME_BLOCKS, DEPARTMENTS } from './services/mockData';
import { ClassSection, FacultyRequest, CourseOption, Instructor, EmailSettings, Department, PartitionedItem, SchoolConfig } from './types';
import Dashboard from './components/Dashboard';
import FacultyForm from './components/FacultyForm';
import AdminSettings from './components/AdminSettings';
import FacultyRequestsList from './components/FacultyRequestsList';
import LandingPage from './components/LandingPage';
import FacultyInstructions from './components/FacultyInstructions';
import FacultyVerificationDashboard from './components/FacultyVerificationDashboard';
import FacultyScheduleView from './components/FacultyScheduleView';
import MasterAdminSettings from './components/MasterAdminSettings';
import AdminHelpPage from './components/AdminHelpPage';
import { sortSchedule, generateFacultyEmail } from './utils/schedulerUtils';
import { Calendar, FileText, Settings, Users, ChevronLeft, ChevronRight, LogOut, CheckSquare, LayoutDashboard, ShieldCheck, HelpCircle } from 'lucide-react';

const App: React.FC = () => {
  // State for Navigation and Role
  const [userRole, setUserRole] = useState<'admin' | 'faculty' | null>(null);
  const [currentView, setCurrentView] = useState<'dashboard' | 'form' | 'settings' | 'requests' | 'instructions' | 'verification' | 'mySchedule' | 'masterSettings' | 'help'>('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  
  // Faculty specific state for demo purposes (impersonation)
  const [currentFacultyId, setCurrentFacultyId] = useState<string>('');

  // Global Configuration State (Master Admin)
  const [schoolConfig, setSchoolConfig] = useState<SchoolConfig>({
      schoolName: 'AcademicPro University',
      scheduleTitle: 'Fall 2026',
      helpContactName: 'IT Support',
      helpContactEmail: 'help@academicpro.edu'
  });

  // Department State
  const [departments, setDepartments] = useState<Department[]>(DEPARTMENTS);
  const [activeDeptId, setActiveDeptId] = useState<string | null>(null);

  // Global Lists State (All items with departmentId tag)
  const [allSchedule, setAllSchedule] = useState<ClassSection[]>(INITIAL_SCHEDULE);
  const [allRequests, setAllRequests] = useState<FacultyRequest[]>(MOCK_REQUESTS);
  const [allCourses, setAllCourses] = useState<CourseOption[]>(INITIAL_COURSES);
  const [allInstructors, setAllInstructors] = useState<Instructor[]>(INITIAL_INSTRUCTORS);
  
  // Partitioned items (Rooms, Modalities, TimeBlocks, Campuses)
  const [allModalities, setAllModalities] = useState<PartitionedItem[]>(INITIAL_MODALITIES);
  const [allCampuses, setAllCampuses] = useState<PartitionedItem[]>(INITIAL_CAMPUSES);
  const [allRooms, setAllRooms] = useState<PartitionedItem[]>(INITIAL_ROOMS);
  const [allTimeBlocks, setAllTimeBlocks] = useState<PartitionedItem[]>(TIME_BLOCKS);

  // Filtered Data based on Active Department
  const activeDept = useMemo(() => departments.find(d => d.id === activeDeptId), [departments, activeDeptId]);
  
  const schedule = useMemo(() => allSchedule.filter(s => s.departmentId === activeDeptId), [allSchedule, activeDeptId]);
  const requests = useMemo(() => allRequests.filter(r => r.departmentId === activeDeptId), [allRequests, activeDeptId]);
  const courses = useMemo(() => allCourses.filter(c => c.departmentId === activeDeptId), [allCourses, activeDeptId]);
  const instructors = useMemo(() => allInstructors.filter(i => i.departmentId === activeDeptId), [allInstructors, activeDeptId]);
  
  // Derived simple arrays for child components that expect string[]
  const rooms = useMemo(() => allRooms.filter(r => r.departmentId === activeDeptId).map(r => r.value), [allRooms, activeDeptId]);
  const timeBlocks = useMemo(() => allTimeBlocks.filter(t => t.departmentId === activeDeptId).map(t => t.value), [allTimeBlocks, activeDeptId]);
  const modalities = useMemo(() => allModalities.filter(m => m.departmentId === activeDeptId).map(m => m.value), [allModalities, activeDeptId]);
  const campuses = useMemo(() => allCampuses.filter(c => c.departmentId === activeDeptId).map(c => c.value), [allCampuses, activeDeptId]);

  // Current logged in instructor object
  const currentInstructor = useMemo(() => instructors.find(i => i.id === currentFacultyId), [instructors, currentFacultyId]);

  // Email Settings State
  const [emailSettings, setEmailSettings] = useState<EmailSettings>({
    individualSubject: `Action Required: ${schoolConfig.scheduleTitle} Schedule Request`,
    individualBody: `Dear {name},\n\nWe have not yet received your schedule preferences for the ${schoolConfig.scheduleTitle} semester. Please visit the portal and submit your requests as soon as possible to ensure your preferences are considered.\n\nThank you,\nDepartment Schedule Developer`,
    bulkSubject: `Reminder: ${schoolConfig.scheduleTitle} Schedule Requests Due`,
    bulkBody: `Faculty,\n\nThis is a friendly reminder to please submit your schedule preferences for the ${schoolConfig.scheduleTitle} semester.\n\nThank you,\nDepartment Schedule Developer`
  });

  // --- Handlers for Data Updates ---

  const handleUpdateSection = (id: string, updates: Partial<ClassSection>) => {
    setAllSchedule(prev => prev.map(section => 
      section.id === id ? { ...section, ...updates } : section
    ));
  };

  const handleAddSection = (newSection: Partial<ClassSection>) => {
    if (!activeDeptId) return;
    const section: ClassSection = {
        id: crypto.randomUUID(),
        departmentId: activeDeptId,
        term: '2026MFA',
        subject: '',
        courseNumber: '',
        section: '',
        title: '',
        endDate: '',
        method: '',
        meetingDays: '',
        beginTime: '',
        endTime: '',
        room: '',
        faculty: 'Staff',
        status: 'New', 
        ...newSection
    } as ClassSection;
    
    // Add to main array
    setAllSchedule(prev => [...prev, section]);
  };

  const handleImportSchedule = (importedSections: ClassSection[]) => {
      if (!activeDeptId) return;
      
      const localizedSections = importedSections.map(s => ({
          ...s,
          departmentId: activeDeptId
      }));

      // 1. Process for New Time Blocks
      const existingTimeBlocks = new Set(allTimeBlocks.filter(tb => tb.departmentId === activeDeptId).map(tb => tb.value));
      const newTimeBlocksToAdd: PartitionedItem[] = [];

      localizedSections.forEach(section => {
        if (section.beginTime && section.endTime) {
            const block = `${section.beginTime} - ${section.endTime}`;
            if (!existingTimeBlocks.has(block)) {
                existingTimeBlocks.add(block);
                newTimeBlocksToAdd.push({
                    id: crypto.randomUUID(),
                    departmentId: activeDeptId,
                    value: block
                });
            }
        }
      });

      if (newTimeBlocksToAdd.length > 0) {
          setAllTimeBlocks(prev => [...prev, ...newTimeBlocksToAdd]);
      }

      // 2. Process for New Instructors
      const existingInstructors = new Set(allInstructors.filter(i => i.departmentId === activeDeptId).map(i => i.name));
      const newInstructorsToAdd: Instructor[] = [];

      localizedSections.forEach(section => {
          if (section.faculty && section.faculty !== 'Staff' && !existingInstructors.has(section.faculty)) {
              existingInstructors.add(section.faculty);
              newInstructorsToAdd.push({
                  id: crypto.randomUUID(),
                  departmentId: activeDeptId,
                  name: section.faculty,
                  email: generateFacultyEmail(section.faculty), // Generate email pattern
                  type: 'Part-Time', // Default to part-time if unknown
                  seniority: 99,
                  reminderCount: 0,
                  approvalStatus: 'Pending'
              });
          }
      });

      if (newInstructorsToAdd.length > 0) {
          setAllInstructors(prev => [...prev, ...newInstructorsToAdd]);
      }

      // 3. Process for New Rooms (Auto-populate from import)
      const existingRooms = new Set(allRooms.filter(r => r.departmentId === activeDeptId).map(r => r.value));
      const newRoomsToAdd: PartitionedItem[] = [];

      localizedSections.forEach(section => {
        if (section.room && section.room !== 'ONLINE' && section.room !== 'TBA' && !existingRooms.has(section.room)) {
            existingRooms.add(section.room);
            newRoomsToAdd.push({
                id: crypto.randomUUID(),
                departmentId: activeDeptId,
                value: section.room
            });
        }
      });

      if (newRoomsToAdd.length > 0) {
          setAllRooms(prev => [...prev, ...newRoomsToAdd]);
      }

      // 4. Process for New Courses (Auto-populate from import)
      const existingCourses = new Set(allCourses.filter(c => c.departmentId === activeDeptId).map(c => c.code));
      const newCoursesToAdd: CourseOption[] = [];

      localizedSections.forEach(section => {
          if (section.subject && section.courseNumber) {
              const code = `${section.subject} ${section.courseNumber}`;
              if (!existingCourses.has(code)) {
                  existingCourses.add(code);
                  newCoursesToAdd.push({
                      id: crypto.randomUUID(),
                      departmentId: activeDeptId,
                      code: code,
                      title: section.title
                  });
              }
          }
      });

      if (newCoursesToAdd.length > 0) {
          setAllCourses(prev => [...prev, ...newCoursesToAdd]);
      }

      // 5. Replace Schedule
      setAllSchedule(prev => {
          const otherDepts = prev.filter(s => s.departmentId !== activeDeptId);
          return [...otherDepts, ...localizedSections];
      });
  };

  const handleSort = (criterion: 'course' | 'time' | 'room' | 'faculty' | 'status') => {
    setAllSchedule(prev => sortSchedule(prev, criterion));
  };

  const handleUpdateInstructor = (id: string, updates: Partial<Instructor>) => {
    setAllInstructors(prev => prev.map(inst => 
      inst.id === id ? { ...inst, ...updates } : inst
    ));
  };

  // Used for NEW submissions (Faculty Form View). Enforces one request per faculty.
  const handleRequestSubmit = (request: FacultyRequest) => {
    if (!activeDeptId) return;
    const taggedRequest = { ...request, departmentId: activeDeptId };
    
    setAllRequests(prev => {
        const filtered = prev.filter(r => r.name !== request.name); // Remove old request from same person (assuming name is unique key for now)
        return [...filtered, taggedRequest];
    });
    
    if (userRole === 'admin') {
      setCurrentView('dashboard'); 
    } else {
        // Stay on form but show success? Already handled in form component alert.
    }
  };

  // Used for Admin updates (Edit Mode). Updates by ID.
  const handleAdminRequestUpdate = (updatedReq: FacultyRequest) => {
      setAllRequests(prev => prev.map(r => r.id === updatedReq.id ? updatedReq : r));
  };
  
  const handleAdminRequestDelete = (id: string) => {
      setAllRequests(prev => prev.filter(r => r.id !== id));
  };

  // --- Admin Settings Handlers (Partition Aware) ---
  
  const handleAddCourse = (code: string, title: string) => {
    if (!activeDeptId) return;
    setAllCourses(prev => [...prev, { id: crypto.randomUUID(), departmentId: activeDeptId, code, title }]);
  };
  const handleRemoveCourse = (id: string) => {
    setAllCourses(prev => prev.filter(c => c.id !== id));
  };

  const handleAddInstructor = (inst: Partial<Instructor>) => {
      if (!activeDeptId) return;
      setAllInstructors(prev => [...prev, {
          id: crypto.randomUUID(),
          departmentId: activeDeptId,
          name: inst.name || '',
          email: inst.email || '',
          type: inst.type || 'Full-Time',
          seniority: inst.seniority,
          reminderCount: 0,
          approvalStatus: 'Pending'
      }]);
  };
  const handleRemoveInstructor = (id: string) => setAllInstructors(prev => prev.filter(i => i.id !== id));

  // Helper for simple partitioned items
  const addPartitionedItem = (setter: React.Dispatch<React.SetStateAction<PartitionedItem[]>>, value: string) => {
    if (!activeDeptId) return;
    setter(prev => [...prev, { id: crypto.randomUUID(), departmentId: activeDeptId, value }]);
  };
  const removePartitionedItem = (setter: React.Dispatch<React.SetStateAction<PartitionedItem[]>>, value: string) => {
    if (!activeDeptId) return;
    setter(prev => prev.filter(item => !(item.departmentId === activeDeptId && item.value === value)));
  };
  
  // Specific handler to pass down
  const handleAddTimeBlock = (val: string) => {
      addPartitionedItem(setAllTimeBlocks, val);
  };

  const handleUpdateRoom = (oldVal: string, newVal: string) => {
      if (!activeDeptId) return;
      // 1. Update Room List
      setAllRooms(prev => prev.map(r => (r.departmentId === activeDeptId && r.value === oldVal) ? { ...r, value: newVal } : r));
      // 2. Update Schedule references
      setAllSchedule(prev => prev.map(s => (s.departmentId === activeDeptId && s.room === oldVal) ? { ...s, room: newVal } : s));
  };


  // Role Selection Handler
  const handleRoleSelect = (role: 'admin' | 'faculty', deptId: string) => {
    setActiveDeptId(deptId);
    setUserRole(role);
    if (role === 'admin') {
      setCurrentView('dashboard');
    } else {
      // Logic for faculty view selection needs to know WHO they are.
      // For demo, we default to instructions, but UI will let them impersonate
      setCurrentView('instructions');
    }
  };

  const handleCreateDepartment = (name: string) => {
    const newDept: Department = { id: `dept_${Date.now()}`, name };
    setDepartments([...departments, newDept]);
  };

  const handleLogout = () => {
    setUserRole(null);
    setActiveDeptId(null);
    setCurrentView('dashboard');
    setCurrentFacultyId('');
  };

  // 1. No Role Selected -> Landing Page
  if (!userRole) {
    return <LandingPage 
        scheduleTitle={schoolConfig.scheduleTitle}
        schoolConfig={schoolConfig}
        departments={departments} 
        onSelectRole={handleRoleSelect} 
        onCreateDepartment={handleCreateDepartment}
    />;
  }

  // 2. Faculty Role -> Restricted View (No Sidebar)
  if (userRole === 'faculty') {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
        <header className="bg-white shadow-sm border-b border-gray-200 px-4 md:px-8 py-4 flex flex-col md:flex-row justify-between items-center sticky top-0 z-50">
          <div className="flex items-center mb-4 md:mb-0">
             <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold mr-3">
               AP
             </div>
             <div>
                <h1 className="text-xl font-bold text-gray-800">{schoolConfig.schoolName}</h1>
                <p className="text-xs text-gray-500">{activeDept?.name} • Faculty Portal</p>
             </div>
          </div>
          
          <div className="flex items-center space-x-4">
              {/* Impersonation Dropdown for Demo purposes */}
              <select 
                value={currentFacultyId}
                onChange={e => setCurrentFacultyId(e.target.value)}
                className="bg-gray-100 border border-gray-300 text-gray-700 text-sm rounded p-2 focus:ring-2 focus:ring-blue-500"
              >
                  <option value="">-- Demo: Select Faculty --</option>
                  {instructors.map(i => (
                      <option key={i.id} value={i.id}>{i.name}</option>
                  ))}
              </select>

              {currentFacultyId && (
                  <div className="flex space-x-2">
                       <button 
                         onClick={() => setCurrentView('instructions')} 
                         className={`px-3 py-2 text-sm rounded font-medium ${currentView === 'instructions' || currentView === 'form' ? 'bg-blue-100 text-blue-800' : 'text-gray-600 hover:bg-gray-100'}`}
                       >
                           Requests
                       </button>
                       <button 
                         onClick={() => setCurrentView('mySchedule')} 
                         className={`px-3 py-2 text-sm rounded font-medium ${currentView === 'mySchedule' ? 'bg-blue-100 text-blue-800' : 'text-gray-600 hover:bg-gray-100'}`}
                       >
                           My Schedule
                       </button>
                  </div>
              )}

              <div className="h-6 w-px bg-gray-300 mx-2"></div>

              <button 
                onClick={handleLogout} 
                className="text-sm text-gray-500 hover:text-red-600 flex items-center px-3 py-2 rounded hover:bg-red-50 transition-colors"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Exit
              </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          {!currentFacultyId ? (
               <div className="flex flex-col items-center justify-center h-full text-gray-500">
                    <Users className="w-16 h-16 mb-4 text-gray-300" />
                    <p className="text-lg">Please select a faculty member from the dropdown above to continue.</p>
               </div>
          ) : (
            <>
                {currentView === 'instructions' && (
                    <FacultyInstructions 
                    scheduleTitle={schoolConfig.scheduleTitle}
                    onStart={() => setCurrentView('form')} 
                    onBack={handleLogout}
                    />
                )}

                {currentView === 'form' && (
                    <div className="w-full max-w-[95%] mx-auto p-4 md:p-8">
                    <button 
                        onClick={() => setCurrentView('instructions')} 
                        className="mb-4 text-sm text-blue-600 hover:underline flex items-center"
                    >
                        <ChevronLeft className="w-4 h-4 mr-1"/> Back to Instructions
                    </button>
                    <FacultyForm 
                        departmentId={activeDeptId || ''}
                        scheduleTitle={schoolConfig.scheduleTitle}
                        onSubmit={handleRequestSubmit} 
                        availableCourses={courses}
                        availableModalities={modalities}
                        availableCampuses={campuses}
                        instructors={instructors}
                        availableTimes={timeBlocks}
                        // Pre-fill if simulating a user (optional enhancement)
                        initialValues={currentInstructor ? {
                             id: '',
                             departmentId: activeDeptId || '',
                             name: currentInstructor.name,
                             email: currentInstructor.email,
                             contactNumber: '',
                             loadDesired: 0,
                             preferences: [],
                             certifiedOnline: false,
                             willingToTeach: { live: false, online: false, hybrid: false },
                             specialInstructions: '',
                             submittedAt: ''
                        } : undefined}
                    />
                    </div>
                )}

                {currentView === 'mySchedule' && currentInstructor && (
                    <FacultyScheduleView 
                        instructor={currentInstructor}
                        schedule={schedule}
                        scheduleTitle={schoolConfig.scheduleTitle}
                        onUpdateInstructor={handleUpdateInstructor}
                    />
                )}
            </>
          )}
        </main>
      </div>
    );
  }

  // 3. Admin Role -> Full Dashboard with Sidebar
  return (
    <div className="flex h-screen bg-gray-100 font-sans">
      {/* Sidebar Navigation */}
      <aside className={`${isSidebarCollapsed ? 'w-20' : 'w-64'} bg-slate-900 text-white flex flex-col hidden md:flex transition-all duration-300 relative`}>
        <button
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="absolute -right-3 top-8 bg-blue-600 text-white rounded-full p-1 shadow-lg hover:bg-blue-700 z-50 border-2 border-slate-900"
        >
            {isSidebarCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>

        <div className={`p-6 flex items-center ${isSidebarCollapsed ? 'justify-center' : ''} h-20`}>
          {isSidebarCollapsed ? (
             <span className="text-xl font-bold text-blue-400">AP</span>
          ) : (
             <div className="overflow-hidden">
                 <h1 className="text-lg font-bold tracking-wide whitespace-nowrap">ACADEMIC<span className="text-blue-400">PRO</span></h1>
                 <p className="text-[10px] text-gray-400 truncate">{schoolConfig.schoolName}</p>
             </div>
          )}
        </div>

        <nav className="flex-1 px-3 space-y-2 overflow-y-auto">
          <button 
            onClick={() => setCurrentView('dashboard')}
            title="Master Schedule"
            className={`flex items-center w-full px-3 py-3 rounded-lg transition-colors group ${currentView === 'dashboard' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-slate-800'}`}
          >
            <div className={`flex items-center justify-center ${isSidebarCollapsed ? 'w-full' : ''}`}>
                <Calendar className="w-6 h-6 flex-shrink-0" />
            </div>
            {!isSidebarCollapsed && <span className="ml-3 whitespace-nowrap overflow-hidden">Master Schedule</span>}
            {isSidebarCollapsed && (
                <div className="absolute left-16 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50">
                    Master Schedule
                </div>
            )}
          </button>

          <button 
             onClick={() => setCurrentView('requests')}
             title="Faculty Requests"
             className={`flex items-center w-full px-3 py-3 rounded-lg transition-colors group ${currentView === 'requests' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-slate-800'}`}
          >
            <div className={`flex items-center justify-center ${isSidebarCollapsed ? 'w-full' : ''}`}>
                <Users className="w-6 h-6 flex-shrink-0" />
            </div>
            {!isSidebarCollapsed && <span className="ml-3 whitespace-nowrap overflow-hidden">Faculty Requests</span>}
            {isSidebarCollapsed && (
                <div className="absolute left-16 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50">
                    Faculty Requests
                </div>
            )}
          </button>
          
          <button 
             onClick={() => setCurrentView('verification')}
             title="Verification"
             className={`flex items-center w-full px-3 py-3 rounded-lg transition-colors group ${currentView === 'verification' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-slate-800'}`}
          >
            <div className={`flex items-center justify-center ${isSidebarCollapsed ? 'w-full' : ''}`}>
                <CheckSquare className="w-6 h-6 flex-shrink-0" />
            </div>
            {!isSidebarCollapsed && <span className="ml-3 whitespace-nowrap overflow-hidden">Verification</span>}
            {isSidebarCollapsed && (
                <div className="absolute left-16 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50">
                    Verification
                </div>
            )}
          </button>

          <div className="my-2 border-t border-slate-700"></div>

          <button 
             onClick={() => setCurrentView('form')}
             title="Faculty Form"
             className={`flex items-center w-full px-3 py-3 rounded-lg transition-colors group ${currentView === 'form' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-slate-800'}`}
          >
            <div className={`flex items-center justify-center ${isSidebarCollapsed ? 'w-full' : ''}`}>
                <FileText className="w-6 h-6 flex-shrink-0" />
            </div>
            {!isSidebarCollapsed && <span className="ml-3 whitespace-nowrap overflow-hidden">Faculty Form</span>}
            {isSidebarCollapsed && (
                <div className="absolute left-16 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50">
                    Faculty Form
                </div>
            )}
          </button>

          <button 
             onClick={() => setCurrentView('settings')}
             title="Admin Settings"
             className={`flex items-center w-full px-3 py-3 rounded-lg transition-colors group ${currentView === 'settings' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-slate-800'}`}
          >
            <div className={`flex items-center justify-center ${isSidebarCollapsed ? 'w-full' : ''}`}>
                 <Settings className="w-6 h-6 flex-shrink-0" />
            </div>
            {!isSidebarCollapsed && <span className="ml-3 whitespace-nowrap overflow-hidden">Admin Settings</span>}
            {isSidebarCollapsed && (
                <div className="absolute left-16 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50">
                    Admin Settings
                </div>
            )}
          </button>
        </nav>
        
        {/* Bottom Area with Master Admin Links */}
        <div className="p-2 border-t border-slate-800 space-y-1">
             <button 
                onClick={() => setCurrentView('help')}
                className={`flex items-center w-full px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-slate-800 transition-colors ${isSidebarCollapsed ? 'justify-center' : ''}`}
                title="Admin Help"
            >
                <HelpCircle className="w-5 h-5 flex-shrink-0" />
                {!isSidebarCollapsed && <span className="ml-3">Help</span>}
            </button>
            <button 
                onClick={() => setCurrentView('masterSettings')}
                className={`flex items-center w-full px-3 py-2 rounded-lg text-sm text-emerald-400 hover:text-emerald-300 hover:bg-slate-800 transition-colors ${isSidebarCollapsed ? 'justify-center' : ''}`}
                title="Master Admin"
            >
                <ShieldCheck className="w-5 h-5 flex-shrink-0" />
                {!isSidebarCollapsed && <span className="ml-3">Master Admin</span>}
            </button>
        </div>

        <div className="p-4 border-t border-slate-800 bg-slate-950">
            {!isSidebarCollapsed && <div className="text-xs text-slate-500 mb-2 px-1 uppercase font-semibold">Active Department</div>}
            <div className={`px-1 text-sm text-white mb-3 truncate font-medium ${isSidebarCollapsed ? 'text-center text-[10px]' : ''}`} title={activeDept?.name}>
                {isSidebarCollapsed ? activeDept?.name.substring(0,3).toUpperCase() : activeDept?.name}
            </div>
            <button 
                onClick={handleLogout}
                className={`flex items-center w-full px-3 py-2 rounded text-red-400 hover:text-red-300 hover:bg-slate-800 transition-colors ${isSidebarCollapsed ? 'justify-center' : ''}`}
                title="Sign Out"
            >
                <LogOut className="w-5 h-5 flex-shrink-0" />
                {!isSidebarCollapsed && <span className="ml-3">Sign Out</span>}
            </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto transition-all duration-300">
        {currentView === 'dashboard' && (
          <Dashboard 
            scheduleTitle={schoolConfig.scheduleTitle}
            schedule={schedule} 
            requests={requests}
            rooms={rooms}
            instructors={instructors}
            emailSettings={emailSettings}
            onUpdateSection={handleUpdateSection}
            onAddSection={handleAddSection}
            onImportSchedule={handleImportSchedule}
            onSort={handleSort}
            onUpdateInstructor={handleUpdateInstructor}
            isSidebarCollapsed={isSidebarCollapsed}
            timeBlocks={timeBlocks}
            modalities={modalities}
            onAddTimeBlock={handleAddTimeBlock}
          />
        )}

        {currentView === 'requests' && (
           <FacultyRequestsList 
              requests={requests} 
              instructors={instructors}
              courses={courses}
              modalities={modalities}
              campuses={campuses}
              timeBlocks={timeBlocks}
              departmentId={activeDeptId || ''}
              scheduleTitle={schoolConfig.scheduleTitle}
              onAdd={handleRequestSubmit}
              onUpdate={handleAdminRequestUpdate}
              onDelete={handleAdminRequestDelete}
           />
        )}
        
        {currentView === 'verification' && (
            <FacultyVerificationDashboard
                instructors={instructors}
                schedule={schedule}
                scheduleTitle={schoolConfig.scheduleTitle}
                onUpdateInstructor={handleUpdateInstructor}
            />
        )}

        {currentView === 'form' && (
          <div className="p-8">
            <button 
                onClick={() => setCurrentView('dashboard')} 
                className="mb-4 text-sm text-blue-600 hover:underline"
            >
                &larr; Back to Dashboard
            </button>
            <FacultyForm 
              departmentId={activeDeptId || ''}
              scheduleTitle={schoolConfig.scheduleTitle}
              onSubmit={handleRequestSubmit} 
              availableCourses={courses}
              availableModalities={modalities}
              availableCampuses={campuses}
              instructors={instructors}
              availableTimes={timeBlocks}
            />
          </div>
        )}

        {currentView === 'settings' && (
          <div className="p-8">
             <AdminSettings 
                // Global Settings
                // scheduleTitle handled by Master Admin now

                // Courses
                courses={courses} 
                onAddCourse={handleAddCourse}
                onRemoveCourse={handleRemoveCourse}
                
                // Partitioned Items
                modalities={modalities} 
                onAddModality={(val) => addPartitionedItem(setAllModalities, val)}
                onRemoveModality={(val) => removePartitionedItem(setAllModalities, val)}
                
                campuses={campuses} 
                onAddCampus={(val) => addPartitionedItem(setAllCampuses, val)}
                onRemoveCampus={(val) => removePartitionedItem(setAllCampuses, val)}

                rooms={rooms} 
                onAddRoom={(val) => addPartitionedItem(setAllRooms, val)}
                onRemoveRoom={(val) => removePartitionedItem(setAllRooms, val)}
                onUpdateRoom={handleUpdateRoom}

                timeBlocks={timeBlocks} 
                onAddTimeBlock={(val) => addPartitionedItem(setAllTimeBlocks, val)}
                onRemoveTimeBlock={(val) => removePartitionedItem(setAllTimeBlocks, val)}

                // Instructors
                instructors={instructors} 
                onAddInstructor={handleAddInstructor}
                onUpdateInstructor={handleUpdateInstructor}
                onRemoveInstructor={handleRemoveInstructor}

                // Global Config
                schedule={schedule} 
                emailSettings={emailSettings} 
                setEmailSettings={setEmailSettings}
             />
          </div>
        )}
        
        {currentView === 'masterSettings' && (
            <MasterAdminSettings 
                config={schoolConfig}
                onUpdate={setSchoolConfig}
            />
        )}

        {currentView === 'help' && (
            <AdminHelpPage />
        )}
      </main>
    </div>
  );
};

export default App;
