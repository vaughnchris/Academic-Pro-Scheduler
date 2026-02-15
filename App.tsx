
import React, { useState, useMemo, useEffect } from 'react';
import { INITIAL_SCHEDULE, MOCK_REQUESTS, INITIAL_COURSES, INITIAL_MODALITIES, INITIAL_CAMPUSES, INITIAL_ROOMS, INITIAL_INSTRUCTORS, TIME_BLOCKS, DEPARTMENTS, MOCK_ARCHIVED_SCHEDULES, INITIAL_TEXTBOOK_COSTS } from './services/mockData';
import { ClassSection, FacultyRequest, CourseOption, Instructor, EmailSettings, Department, PartitionedItem, SchoolConfig, GlobalOption, ArchivedSchedule, SectionStatus } from './types';
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
import ProductPage from './components/ProductPage';
import { sortSchedule, generateFacultyEmail } from './utils/schedulerUtils';
import { Calendar, FileText, Settings, Users, ChevronLeft, ChevronRight, LogOut, CheckSquare, ShieldCheck, HelpCircle, Database, AlertTriangle, Info, ChevronDown, ChevronUp } from 'lucide-react';

// Firebase Services
import { 
  subscribeToCollection, 
  subscribeToDoc, 
  addDocument, 
  updateDocument, 
  deleteDocument, 
  batchAddDocuments 
} from './services/firebase';

const App: React.FC = () => {
  // State for Navigation and Role
  const [userRole, setUserRole] = useState<'admin' | 'faculty' | null>(null);
  const [currentView, setCurrentView] = useState<'dashboard' | 'form' | 'settings' | 'requests' | 'instructions' | 'verification' | 'mySchedule' | 'masterSettings' | 'help'>('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [viewingProduct, setViewingProduct] = useState(false);
  const [sortCriterion, setSortCriterion] = useState<'course' | 'time' | 'room' | 'faculty' | 'status'>('course');
  
  // Faculty specific state for demo purposes (impersonation)
  const [currentFacultyId, setCurrentFacultyId] = useState<string>('');

  // --- Data State (Synced via Firebase) ---
  const [schoolConfig, setSchoolConfigState] = useState<SchoolConfig>({
      schoolName: 'AcademicPro University',
      scheduleTitle: 'Fall 2026',
      helpContactName: 'IT Support',
      helpContactEmail: 'help@academicpro.edu'
  });

  const [departments, setDepartments] = useState<Department[]>([]);
  const [allSchedule, setAllSchedule] = useState<ClassSection[]>([]);
  const [allRequests, setAllRequests] = useState<FacultyRequest[]>([]);
  const [allCourses, setAllCourses] = useState<CourseOption[]>([]);
  const [allInstructors, setAllInstructors] = useState<Instructor[]>([]);
  const [allArchivedSchedules, setAllArchivedSchedules] = useState<ArchivedSchedule[]>([]);
  const [globalModalities, setGlobalModalities] = useState<GlobalOption[]>([]);
  const [globalCampuses, setGlobalCampuses] = useState<GlobalOption[]>([]);
  const [globalTextbookCosts, setGlobalTextbookCosts] = useState<GlobalOption[]>([]);
  const [allRooms, setAllRooms] = useState<PartitionedItem[]>([]);
  const [allTimeBlocks, setAllTimeBlocks] = useState<PartitionedItem[]>([]);
  const [emailSettings, setEmailSettingsState] = useState<EmailSettings>({
    individualSubject: '', individualBody: '', bulkSubject: '', bulkBody: ''
  });

  const [activeDeptId, setActiveDeptId] = useState<string | null>(null);

  // --- Firebase Subscriptions ---
  useEffect(() => {
    // Collections
    const unsubDepts = subscribeToCollection('departments', setDepartments);
    const unsubSched = subscribeToCollection('schedule', setAllSchedule);
    const unsubReqs = subscribeToCollection('requests', setAllRequests);
    const unsubCourses = subscribeToCollection('courses', setAllCourses);
    const unsubInsts = subscribeToCollection('instructors', setAllInstructors);
    const unsubArchives = subscribeToCollection('archives', setAllArchivedSchedules);
    
    // Global Configs
    const unsubMods = subscribeToCollection('globalModalities', setGlobalModalities);
    const unsubCamps = subscribeToCollection('globalCampuses', setGlobalCampuses);
    const unsubCosts = subscribeToCollection('globalTextbookCosts', setGlobalTextbookCosts);
    const unsubRooms = subscribeToCollection('rooms', setAllRooms);
    const unsubTimes = subscribeToCollection('timeBlocks', setAllTimeBlocks);

    // Single Documents
    const unsubConfig = subscribeToDoc('settings', 'schoolConfig', (data) => {
        if (data) setSchoolConfigState(data);
        // Initialize defaults if missing in DB handled by form saves mostly
    });
    
    const unsubEmail = subscribeToDoc('settings', 'emailSettings', (data) => {
        if (data) setEmailSettingsState(data);
        else {
             // Set default email settings if not in DB yet
             const defaults = {
                individualSubject: `Action Required: Schedule Request`,
                individualBody: `Dear {name},\n\nWe have not yet received your schedule preferences. Please visit the portal.\n\nThank you.`,
                bulkSubject: `Reminder: Schedule Requests Due`,
                bulkBody: `Faculty,\n\nThis is a friendly reminder to please submit your schedule preferences.\n\nThank you.`
             };
             setEmailSettingsState(defaults);
        }
    });

    return () => {
        unsubDepts(); unsubSched(); unsubReqs(); unsubCourses(); unsubInsts();
        unsubArchives(); unsubMods(); unsubCamps(); unsubCosts(); unsubRooms(); unsubTimes();
        unsubConfig(); unsubEmail();
    };
  }, []);

  // Filtered Data based on Active Department
  const activeDept = useMemo(() => departments.find(d => d.id === activeDeptId), [departments, activeDeptId]);
  
  // Sorted Schedule Logic
  const schedule = useMemo(() => {
      const filtered = allSchedule.filter(s => s.departmentId === activeDeptId);
      return sortSchedule(filtered, sortCriterion);
  }, [allSchedule, activeDeptId, sortCriterion]);

  const requests = useMemo(() => allRequests.filter(r => r.departmentId === activeDeptId), [allRequests, activeDeptId]);
  const courses = useMemo(() => allCourses.filter(c => c.departmentId === activeDeptId), [allCourses, activeDeptId]);
  const instructors = useMemo(() => allInstructors.filter(i => i.departmentId === activeDeptId), [allInstructors, activeDeptId]);
  const archivedSchedules = useMemo(() => allArchivedSchedules.filter(a => a.departmentId === activeDeptId), [allArchivedSchedules, activeDeptId]);
  
  const rooms = useMemo(() => allRooms.filter(r => r.departmentId === activeDeptId).map(r => r.value), [allRooms, activeDeptId]);
  const timeBlocks = useMemo(() => allTimeBlocks.filter(t => t.departmentId === activeDeptId).map(t => t.value), [allTimeBlocks, activeDeptId]);
  
  const modalities = useMemo(() => globalModalities.map(m => m.value), [globalModalities]);
  const campuses = useMemo(() => globalCampuses.map(c => c.value), [globalCampuses]);
  const textbookCosts = useMemo(() => globalTextbookCosts.map(t => t.value), [globalTextbookCosts]);

  const currentInstructor = useMemo(() => instructors.find(i => i.id === currentFacultyId), [instructors, currentFacultyId]);

  const validInstructors = useMemo(() => instructors.filter(i => i.name !== 'Staff'), [instructors]);

  const areRequestsComplete = useMemo(() => {
      if (validInstructors.length === 0) return false;
      return validInstructors.every(i => requests.some(r => r.name === i.name));
  }, [validInstructors, requests]);

  const isVerificationComplete = useMemo(() => {
      if (validInstructors.length === 0) return false;
      return validInstructors.every(i => i.approvalStatus === 'Approved' || i.approvalStatus === 'Rejected');
  }, [validInstructors]);

  // --- Handlers for Data Updates (Writing to Firebase) ---

  const handleUpdateSection = (id: string, updates: Partial<ClassSection>) => {
    updateDocument('schedule', id, updates);
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
    addDocument('schedule', section);
  };

  const handleImportSchedule = (importedSections: ClassSection[]) => {
      if (!activeDeptId) return;
      
      const localizedSections = importedSections.map(s => ({
          ...s,
          departmentId: activeDeptId!
      }));

      // 1. New Time Blocks
      const existingTimeBlocks = new Set(allTimeBlocks.filter(tb => tb.departmentId === activeDeptId).map(tb => tb.value));
      const newTimeBlocksToAdd: PartitionedItem[] = [];
      localizedSections.forEach(section => {
        if (section.beginTime && section.endTime) {
            const block = `${section.beginTime} - ${section.endTime}`;
            if (!existingTimeBlocks.has(block)) {
                existingTimeBlocks.add(block);
                newTimeBlocksToAdd.push({ id: crypto.randomUUID(), departmentId: activeDeptId!, value: block });
            }
        }
      });
      if (newTimeBlocksToAdd.length > 0) batchAddDocuments('timeBlocks', newTimeBlocksToAdd);

      // 2. New Instructors
      const existingInstructors = new Set(allInstructors.filter(i => i.departmentId === activeDeptId).map(i => i.name));
      const newInstructorsToAdd: Instructor[] = [];
      localizedSections.forEach(section => {
          if (section.faculty && section.faculty !== 'Staff' && !existingInstructors.has(section.faculty)) {
              existingInstructors.add(section.faculty);
              newInstructorsToAdd.push({
                  id: crypto.randomUUID(),
                  departmentId: activeDeptId!,
                  name: section.faculty,
                  email: generateFacultyEmail(section.faculty),
                  type: 'Part-Time',
                  seniority: 99,
                  reminderCount: 0,
                  approvalStatus: 'Pending',
                  isScheduler: false
              });
          }
      });
      if (newInstructorsToAdd.length > 0) batchAddDocuments('instructors', newInstructorsToAdd);

      // 3. New Rooms
      const existingRooms = new Set(allRooms.filter(r => r.departmentId === activeDeptId).map(r => r.value));
      const newRoomsToAdd: PartitionedItem[] = [];
      localizedSections.forEach(section => {
        if (section.room && section.room !== 'ONLINE' && section.room !== 'TBA' && !existingRooms.has(section.room)) {
            existingRooms.add(section.room);
            newRoomsToAdd.push({ id: crypto.randomUUID(), departmentId: activeDeptId!, value: section.room });
        }
      });
      if (newRoomsToAdd.length > 0) batchAddDocuments('rooms', newRoomsToAdd);

      // 4. New Courses
      const existingCourses = new Set(allCourses.filter(c => c.departmentId === activeDeptId).map(c => c.code));
      const newCoursesToAdd: CourseOption[] = [];
      localizedSections.forEach(section => {
          if (section.subject && section.courseNumber) {
              const code = `${section.subject} ${section.courseNumber}`;
              if (!existingCourses.has(code)) {
                  existingCourses.add(code);
                  newCoursesToAdd.push({ id: crypto.randomUUID(), departmentId: activeDeptId!, code: code, title: section.title });
              }
          }
      });
      if (newCoursesToAdd.length > 0) batchAddDocuments('courses', newCoursesToAdd);

      // 5. Add Schedule Items
      batchAddDocuments('schedule', localizedSections);
  };

  const handleLoadArchivedSchedule = (archiveId: string) => {
      if (!activeDeptId) return;
      const archive = allArchivedSchedules.find(a => a.id === archiveId);
      if (!archive) return;

      const newSections = archive.sections.map(s => ({
          ...s,
          id: crypto.randomUUID(),
          departmentId: activeDeptId!,
          status: SectionStatus.IMPORTED
      }));

      handleImportSchedule(newSections);
  };

  const handleSort = (criterion: 'course' | 'time' | 'room' | 'faculty' | 'status') => {
    setSortCriterion(criterion);
  };

  const handleUpdateInstructor = (id: string, updates: Partial<Instructor>) => {
    updateDocument('instructors', id, updates);
  };

  const handleRequestSubmit = (request: FacultyRequest) => {
    if (!activeDeptId) return;
    const taggedRequest = { ...request, departmentId: activeDeptId };
    
    // Check if updating existing
    const existing = allRequests.find(r => r.id === request.id || (r.name === request.name && r.departmentId === activeDeptId));
    
    if (existing) {
        updateDocument('requests', existing.id, taggedRequest);
    } else {
        addDocument('requests', taggedRequest);
    }

    if (userRole === 'admin') {
      setCurrentView('dashboard'); 
    }
  };

  const handleAdminRequestDelete = (id: string) => {
    deleteDocument('requests', id);
  };

  const handleAddCourse = (code: string, title: string) => {
    if (!activeDeptId) return;
    addDocument('courses', { id: crypto.randomUUID(), departmentId: activeDeptId, code, title });
  };
  const handleRemoveCourse = (id: string) => {
    deleteDocument('courses', id);
  };

  const handleAddInstructor = (inst: Partial<Instructor>) => {
      if (!activeDeptId) return;
      addDocument('instructors', {
          id: crypto.randomUUID(),
          departmentId: activeDeptId,
          name: inst.name || '',
          email: inst.email || '',
          type: inst.type || 'Full-Time',
          seniority: inst.seniority,
          reminderCount: 0,
          approvalStatus: 'Pending',
          isScheduler: inst.isScheduler || false
      });
  };
  const handleRemoveInstructor = (id: string) => deleteDocument('instructors', id);

  // Partitioned Items
  const handleAddTimeBlock = (val: string) => {
    if (!activeDeptId) return;
    addDocument('timeBlocks', { id: crypto.randomUUID(), departmentId: activeDeptId, value: val });
  };
  
  const handleRemoveTimeBlock = (val: string) => {
      const item = allTimeBlocks.find(t => t.departmentId === activeDeptId && t.value === val);
      if (item) deleteDocument('timeBlocks', item.id);
  };

  const handleAddRoom = (val: string) => {
      if (!activeDeptId) return;
      addDocument('rooms', { id: crypto.randomUUID(), departmentId: activeDeptId, value: val });
  };

  const handleRemoveRoom = (val: string) => {
      const item = allRooms.find(r => r.departmentId === activeDeptId && r.value === val);
      if (item) deleteDocument('rooms', item.id);
  };

  const handleUpdateRoom = (oldVal: string, newVal: string) => {
      if (!activeDeptId) return;
      // Update room list
      const roomItem = allRooms.find(r => r.departmentId === activeDeptId && r.value === oldVal);
      if (roomItem) updateDocument('rooms', roomItem.id, { value: newVal });
      
      // Update schedule references
      // Note: This is potentially expensive if done one by one on large schedule
      // but fine for typical department size
      const affectedSections = allSchedule.filter(s => s.departmentId === activeDeptId && s.room === oldVal);
      affectedSections.forEach(s => updateDocument('schedule', s.id, { room: newVal }));
  };

  // Global Config Handlers
  const handleAddGlobalModality = (val: string) => addDocument('globalModalities', { id: crypto.randomUUID(), value: val });
  const handleRemoveGlobalModality = (id: string) => deleteDocument('globalModalities', id);

  const handleAddGlobalCampus = (val: string) => addDocument('globalCampuses', { id: crypto.randomUUID(), value: val });
  const handleRemoveGlobalCampus = (id: string) => deleteDocument('globalCampuses', id);

  const handleAddGlobalTextbookCost = (val: string) => addDocument('globalTextbookCosts', { id: crypto.randomUUID(), value: val });
  const handleRemoveGlobalTextbookCost = (id: string) => deleteDocument('globalTextbookCosts', id);
  
  const handleCreateDepartment = (name: string) => {
    addDocument('departments', { id: `dept_${Date.now()}`, name });
  };

  // Config Object Updates
  const handleUpdateSchoolConfig = (newConfig: SchoolConfig) => {
      updateDocument('settings', 'schoolConfig', newConfig);
      setSchoolConfigState(newConfig); // Optimistic Update for UI responsiveness
  };
  
  const handleUpdateEmailSettings = (newSettings: React.SetStateAction<EmailSettings>) => {
      // Handle the functional update if passed from component
      const value = newSettings instanceof Function ? newSettings(emailSettings) : newSettings;
      updateDocument('settings', 'emailSettings', value);
      setEmailSettingsState(value);
  };

  const handleLogout = () => {
    setUserRole(null);
    setActiveDeptId(null);
    setCurrentView('dashboard');
    setCurrentFacultyId('');
  };

  const handleRoleSelect = (role: 'admin' | 'faculty', deptId: string) => {
    setUserRole(role);
    setActiveDeptId(deptId);
    if (role === 'admin') {
      setCurrentView('dashboard');
    } else {
      setCurrentView('instructions');
      setCurrentFacultyId('');
    }
  };

  // 0. Advertising Page
  if (viewingProduct) {
    return <ProductPage onBack={() => setViewingProduct(false)} />;
  }

  // 1. No Role Selected -> Landing Page
  if (!userRole) {
    return <LandingPage 
        scheduleTitle={schoolConfig.scheduleTitle}
        schoolConfig={schoolConfig}
        departments={departments} 
        onSelectRole={handleRoleSelect} 
        onCreateDepartment={handleCreateDepartment}
        onShowProduct={() => setViewingProduct(true)}
    />;
  }

  // 2. Faculty Role
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
                        departmentName={activeDept?.name}
                        scheduleTitle={schoolConfig.scheduleTitle}
                        onSubmit={handleRequestSubmit} 
                        availableCourses={courses}
                        availableModalities={modalities}
                        availableCampuses={campuses}
                        availableTextbookCosts={textbookCosts}
                        instructors={instructors}
                        availableTimes={timeBlocks}
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

  // 3. Admin Role
  return (
    <div className="flex h-screen bg-gray-100 font-sans">
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
          </button>

          <button 
             onClick={() => setCurrentView('requests')}
             title="Faculty Requests"
             className={`flex items-center w-full px-3 py-3 rounded-lg transition-colors group ${
                currentView === 'requests' 
                    ? 'bg-blue-600 text-white' 
                    : areRequestsComplete 
                        ? 'text-emerald-400 hover:bg-slate-800 hover:text-emerald-300' 
                        : 'text-gray-400 hover:bg-slate-800'
             }`}
          >
            <div className={`flex items-center justify-center ${isSidebarCollapsed ? 'w-full' : ''}`}>
                <Users className="w-6 h-6 flex-shrink-0" />
            </div>
            {!isSidebarCollapsed && <span className="ml-3 whitespace-nowrap overflow-hidden">Faculty Requests</span>}
          </button>
          
          <button 
             onClick={() => setCurrentView('verification')}
             title="Verification"
             className={`flex items-center w-full px-3 py-3 rounded-lg transition-colors group ${
                currentView === 'verification' 
                    ? 'bg-blue-600 text-white' 
                    : isVerificationComplete 
                        ? 'text-emerald-400 hover:bg-slate-800 hover:text-emerald-300' 
                        : 'text-gray-400 hover:bg-slate-800'
             }`}
          >
            <div className={`flex items-center justify-center ${isSidebarCollapsed ? 'w-full' : ''}`}>
                <CheckSquare className="w-6 h-6 flex-shrink-0" />
            </div>
            {!isSidebarCollapsed && <span className="ml-3 whitespace-nowrap overflow-hidden">Verification</span>}
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
          </button>
        </nav>
        
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

      <main className="flex-1 overflow-auto transition-all duration-300">
        {currentView === 'dashboard' && (
          <Dashboard 
            scheduleTitle={schoolConfig.scheduleTitle}
            departmentName={activeDept?.name || 'Department'}
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
            archivedSchedules={archivedSchedules}
            onLoadArchivedSchedule={handleLoadArchivedSchedule}
          />
        )}

        {currentView === 'requests' && (
           <FacultyRequestsList 
              requests={requests} 
              instructors={instructors}
              courses={courses}
              modalities={modalities}
              campuses={campuses}
              textbookCosts={textbookCosts}
              timeBlocks={timeBlocks}
              departmentId={activeDeptId || ''}
              departmentName={activeDept?.name || 'Department'}
              scheduleTitle={schoolConfig.scheduleTitle}
              onAdd={handleRequestSubmit}
              onUpdate={handleRequestSubmit}
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
              departmentName={activeDept?.name}
              scheduleTitle={schoolConfig.scheduleTitle}
              onSubmit={handleRequestSubmit} 
              availableCourses={courses}
              availableModalities={modalities}
              availableCampuses={campuses}
              availableTextbookCosts={textbookCosts}
              instructors={instructors}
              availableTimes={timeBlocks}
            />
          </div>
        )}

        {currentView === 'settings' && (
          <div className="p-8">
             <AdminSettings 
                courses={courses} 
                onAddCourse={handleAddCourse}
                onRemoveCourse={handleRemoveCourse}
                rooms={rooms} 
                onAddRoom={handleAddRoom}
                onRemoveRoom={handleRemoveRoom}
                onUpdateRoom={handleUpdateRoom}
                instructors={instructors} 
                onAddInstructor={handleAddInstructor}
                onUpdateInstructor={handleUpdateInstructor}
                onRemoveInstructor={handleRemoveInstructor}
                timeBlocks={timeBlocks} 
                onAddTimeBlock={handleAddTimeBlock}
                onRemoveTimeBlock={handleRemoveTimeBlock}
                schedule={schedule} 
                emailSettings={emailSettings} 
                setEmailSettings={handleUpdateEmailSettings}
             />
          </div>
        )}
        
        {currentView === 'masterSettings' && (
            <MasterAdminSettings 
                config={schoolConfig}
                onUpdate={handleUpdateSchoolConfig}
                modalities={globalModalities}
                onAddModality={handleAddGlobalModality}
                onRemoveModality={handleRemoveGlobalModality}
                campuses={globalCampuses}
                onAddCampus={handleAddGlobalCampus}
                onRemoveCampus={handleRemoveGlobalCampus}
                textbookCosts={globalTextbookCosts}
                onAddTextbookCost={handleAddGlobalTextbookCost}
                onRemoveTextbookCost={handleRemoveGlobalTextbookCost}
                departments={departments}
                allInstructors={allInstructors}
                onUpdateInstructor={handleUpdateInstructor}
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
