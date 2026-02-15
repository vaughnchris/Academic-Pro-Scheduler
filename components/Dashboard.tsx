
// ... imports ...
import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { ClassSection, FacultyRequest, Instructor, EmailSettings, SectionStatus, ArchivedSchedule } from '../types';
import ScheduleTable from './ScheduleTable';
import SmartAssistant from './SmartAssistant';
import DraggableFacultyList from './DraggableFacultyList';
import { WeeklyVisualSchedule } from './WeeklyVisualSchedule'; // Import new component
import { Upload, ArrowUpDown, Clock, MapPin, CheckCircle2, Mail, Send, X, User, TrendingUp, TrendingDown, Minus, Download, AlertCircle, ToggleLeft, ToggleRight, Sparkles, ListFilter, History, FileUp, Building, List, Calendar as CalendarIcon } from 'lucide-react';
import { parseScheduleCSV, exportScheduleToExcel, parseTimeMinutes, getDaySortValue, exportRoomUtilizationReport } from '../utils/schedulerUtils';

interface Props {
  departmentName: string;
  scheduleTitle: string;
  schedule: ClassSection[];
  requests: FacultyRequest[];
  rooms: string[];
  instructors: Instructor[];
  onUpdateSection: (id: string, updates: Partial<ClassSection>) => void;
  onAddSection: (section: Partial<ClassSection>) => void;
  onImportSchedule?: (sections: ClassSection[]) => void;
  onSort: (criterion: 'course' | 'time' | 'room' | 'faculty' | 'status') => void;
  onUpdateInstructor: (id: string, updates: Partial<Instructor>) => void;
  isSidebarCollapsed: boolean;
  emailSettings: EmailSettings;
  timeBlocks: string[];
  modalities: string[];
  onAddTimeBlock: (newBlock: string) => void;
  // New props for archived schedules
  archivedSchedules: ArchivedSchedule[];
  onLoadArchivedSchedule: (scheduleId: string) => void;
  sortCriterion: 'course' | 'time' | 'room' | 'faculty' | 'status';
  onRemoveSection: (id: string) => void;
}

const Dashboard: React.FC<Props> = ({ 
    departmentName, scheduleTitle, schedule, requests, rooms, instructors, 
    onUpdateSection, onAddSection, onImportSchedule, onSort, onUpdateInstructor, 
    isSidebarCollapsed, emailSettings, timeBlocks, modalities, onAddTimeBlock,
    archivedSchedules, onLoadArchivedSchedule, sortCriterion, onRemoveSection
}) => {
  const [showAssistant, setShowAssistant] = useState(false);
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [showLoadModal, setShowLoadModal] = useState(false); 
  const [viewMode, setViewMode] = useState<'list' | 'visual'>('list'); // View Mode State
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Resize State
  const [sidebarWidth, setSidebarWidth] = useState(350);
  const [isResizing, setIsResizing] = useState(false);

  // Auto-Assign State
  const [isAutoAssignEnabled, setIsAutoAssignEnabled] = useState(false);

  // --- Statistics Calculations ---
  // ... (stats calc remains same) ...
  // 1. Total Sections (Active only, excluding Deleted)
  const activeSections = useMemo(() => schedule.filter(s => s.status !== 'Delete'), [schedule]);
  const totalActive = activeSections.length;
  
  // 2. Net Change (New - Deleted)
  const newSectionsCount = useMemo(() => schedule.filter(s => s.status === 'New').length, [schedule]);
  const deletedSectionsCount = useMemo(() => schedule.filter(s => s.status === 'Delete').length, [schedule]);
  const netChange = newSectionsCount - deletedSectionsCount;

  // 3. Sections Staffed %
  const staffedCount = useMemo(() => activeSections.filter(s => s.faculty !== 'Staff' && s.faculty !== '').length, [activeSections]);
  const sectionsStaffedPct = totalActive > 0 ? Math.round((staffedCount / totalActive) * 100) : 0;

  // 4. Requests Assigned % (Total Load Assigned / Total Load Desired)
  const { totalLoadDesired, totalLoadAssigned } = useMemo(() => {
      const desired = requests.reduce((acc, r) => acc + r.loadDesired, 0);
      const assigned = requests.reduce((acc, r) => {
          // Count active sections assigned to this faculty
          return acc + activeSections.filter(s => s.faculty === r.name && s.status !== SectionStatus.IMPORTED).length;
      }, 0);
      return { totalLoadDesired: desired, totalLoadAssigned: assigned };
  }, [requests, activeSections]);
  
  const requestsAssignedPct = totalLoadDesired > 0 ? Math.round((totalLoadAssigned / totalLoadDesired) * 100) : 0;
  
  const requestsReceived = requests.length;
  
  // Categorize Instructors
  const fullTime = instructors.filter(i => i.type === 'Full-Time');
  const partTime = instructors.filter(i => i.type === 'Part-Time');

  // Sort Requests by Seniority (Lower Number = Higher Rank)
  const sortedRequests = useMemo(() => {
    return [...requests].sort((a, b) => {
        const instA = instructors.find(i => i.name === a.name);
        const instB = instructors.find(i => i.name === b.name);
        const senA = instA?.seniority ?? 999;
        const senB = instB?.seniority ?? 999;
        return senA - senB;
    });
  }, [requests, instructors]);

  const hasSubmitted = (name: string) => requests.some(r => r.name === name);

  // Auto-Assign Logic
  const runAutoAssignment = useCallback(() => {
      if (!isAutoAssignEnabled) return;

      // Deep copy to track assignments within this run without mutating state directly yet
      // We will actually just fire onUpdateSection calls
      const sectionsToUpdate: {id: string, faculty: string, status: SectionStatus}[] = [];
      const usedSectionIds = new Set<string>();

      // Iterate through requests by seniority (sortedRequests)
      sortedRequests.forEach(req => {
          let assignedCount = activeSections.filter(s => s.faculty === req.name && s.status !== SectionStatus.IMPORTED).length;
          
          if (assignedCount >= req.loadDesired) return;

          // Try to fulfill preferences in rank order
          req.preferences.forEach(pref => {
               if (assignedCount >= req.loadDesired) return;

               // Find a candidate section
               const candidate = activeSections.find(sec => {
                   if (usedSectionIds.has(sec.id) || sectionsToUpdate.some(u => u.id === sec.id)) return false;
                   if (sec.faculty !== 'Staff' && sec.faculty !== '') return false; // Already staffed

                   // Check Title Match (Fuzzy)
                   const secTitle = sec.title.toLowerCase();
                   const prefTitle = pref.classTitle.toLowerCase();
                   const titleMatch = secTitle.includes(prefTitle) || prefTitle.includes(secTitle);
                   if (!titleMatch) return false;
                   
                   // Check Time/Day match if section has them
                   if (sec.beginTime && sec.meetingDays) {
                       // If preference has days, they must loosely match
                       if (pref.daysAvailable.length > 0) {
                           // Simple overlap check
                           // Convert pref days to codes
                           const map: Record<string, string> = { 'Mon': 'M', 'Tue': 'T', 'Wed': 'W', 'Thu': 'R', 'Fri': 'F', 'Sat': 'S', 'Sun': 'U' };
                           const prefCodes = pref.daysAvailable.map(d => map[d] || '').join('');
                           if (!sec.meetingDays.includes(prefCodes) && !prefCodes.includes(sec.meetingDays)) return false;
                       }
                   }

                   return true;
               });

               if (candidate) {
                   sectionsToUpdate.push({
                       id: candidate.id,
                       faculty: req.name,
                       status: SectionStatus.CHANGE
                   });
                   usedSectionIds.add(candidate.id);
                   assignedCount++;
               }
          });
      });

      // Batch apply updates (or individually)
      sectionsToUpdate.forEach(update => {
          onUpdateSection(update.id, { faculty: update.faculty, status: update.status });
      });

  }, [isAutoAssignEnabled, sortedRequests, activeSections, onUpdateSection]);

  // Effect to run assignment when toggle is turned ON
  useEffect(() => {
      if (isAutoAssignEnabled) {
          runAutoAssignment();
      }
  }, [isAutoAssignEnabled, runAutoAssignment]);


  // Resize Logic
  const startResizing = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  }, []);

  const stopResizing = useCallback(() => {
    setIsResizing(false);
  }, []);

  const resize = useCallback((mouseMoveEvent: MouseEvent) => {
    if (isResizing) {
      const newWidth = window.innerWidth - mouseMoveEvent.clientX;
      if (newWidth > 250 && newWidth < 800) {
        setSidebarWidth(newWidth);
      }
    }
  }, [isResizing]);

  useEffect(() => {
    if (isResizing) {
      window.addEventListener("mousemove", resize);
      window.addEventListener("mouseup", stopResizing);
    }
    return () => {
      window.removeEventListener("mousemove", resize);
      window.removeEventListener("mouseup", stopResizing);
    };
  }, [isResizing, resize, stopResizing]);

  // Import Handler
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onImportSchedule) {
        const reader = new FileReader();
        reader.onload = (evt) => {
            const text = evt.target?.result as string;
            const sections = parseScheduleCSV(text, 'temp_id');
            onImportSchedule(sections);
            setShowLoadModal(false); // Close modal on successful import
        };
        reader.readAsText(file);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleExportClick = () => {
    exportScheduleToExcel(schedule, scheduleTitle);
  };

  // Email Handlers
  const handleEmailReminder = (instructor: Instructor) => {
    if (!instructor.email) return;
    
    const subject = encodeURIComponent(emailSettings.individualSubject);
    const bodyRaw = emailSettings.individualBody.replace('{name}', instructor.name);
    const body = encodeURIComponent(bodyRaw);
    
    onUpdateInstructor(instructor.id, { reminderCount: (instructor.reminderCount || 0) + 1 });
    window.location.href = `mailto:${instructor.email}?subject=${subject}&body=${body}`;
  };

  const handleRemindAll = () => {
    const unsubmitted = instructors.filter(i => !hasSubmitted(i.name) && i.email);
    if (unsubmitted.length === 0) {
        alert("Everyone has submitted!");
        return;
    }
    
    const emails = unsubmitted.map(i => i.email).join(',');
    const subject = encodeURIComponent(emailSettings.bulkSubject);
    const body = encodeURIComponent(emailSettings.bulkBody);
    
    unsubmitted.forEach(inst => {
        onUpdateInstructor(inst.id, { reminderCount: (inst.reminderCount || 0) + 1 });
    });

    window.location.href = `mailto:${emails}?subject=${subject}&body=${body}`;
  };

  const FacultyChip: React.FC<{ instructor: Instructor }> = ({ instructor }) => {
      const submitted = hasSubmitted(instructor.name);
      const displayName = instructor.name.split(',')[0]; 
      
      return (
        <div className={`flex items-center space-x-2 px-3 py-2 rounded-md border text-xs transition-all shadow-sm ${
            submitted 
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
                : 'bg-white border-gray-200 text-gray-600 hover:border-red-300'
        }`}>
            <span className="font-semibold truncate max-w-[120px]" title={instructor.name}>
                {displayName}
            </span>
            {submitted ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
            ) : (
                <div className="flex items-center space-x-1 border-l border-gray-200 pl-2 ml-1">
                     {instructor.reminderCount && instructor.reminderCount > 0 ? (
                        <span className="text-[9px] font-bold text-gray-400" title={`${instructor.reminderCount} reminders sent`}>
                            {instructor.reminderCount}
                        </span>
                    ) : null}
                    <button 
                        onClick={() => handleEmailReminder(instructor)}
                        className="text-gray-400 hover:text-blue-600 transition-colors rounded-sm hover:bg-gray-100 p-0.5"
                        title={`Send Reminder to ${instructor.name}`}
                    >
                        <Mail className="w-3.5 h-3.5" />
                    </button>
                </div>
            )}
        </div>
      );
  };

  return (
    <div className="flex-1 p-6 relative flex flex-col h-full bg-gray-50/50 font-sans">
      <div className="mb-4 flex flex-col md:flex-row justify-between items-start md:items-center flex-shrink-0 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">{scheduleTitle} Schedule</h1>
          <p className="text-sm text-gray-500">{departmentName}</p>
        </div>
        <div className="flex flex-wrap gap-2 items-center">
             
             {/* View Toggle */}
             <div className="bg-white border border-gray-200 rounded-md shadow-sm p-0.5 flex mr-2">
                <button 
                    onClick={() => setViewMode('list')}
                    className={`flex items-center px-2 py-1.5 rounded text-xs font-medium transition-colors ${viewMode === 'list' ? 'bg-blue-100 text-blue-800' : 'text-gray-500 hover:bg-gray-50'}`}
                    title="List View"
                >
                    <List className="w-4 h-4 mr-1" /> List
                </button>
                <button 
                    onClick={() => setViewMode('visual')}
                    className={`flex items-center px-2 py-1.5 rounded text-xs font-medium transition-colors ${viewMode === 'visual' ? 'bg-blue-100 text-blue-800' : 'text-gray-500 hover:bg-gray-50'}`}
                    title="Visual Grid View"
                >
                    <CalendarIcon className="w-4 h-4 mr-1" /> Visual
                </button>
             </div>

             <div className="w-px h-8 bg-gray-300 mx-1 hidden md:block"></div>

             {/* Auto-Assign Toggle */}
             <button 
                onClick={() => setIsAutoAssignEnabled(!isAutoAssignEnabled)}
                className={`flex items-center px-3 py-2 rounded-md border text-xs font-medium transition-all ${
                    isAutoAssignEnabled 
                    ? 'bg-purple-100 border-purple-200 text-purple-700 hover:bg-purple-200' 
                    : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
                title={isAutoAssignEnabled ? "Auto-Assign Active: Requests are matched to sections" : "Enable Auto-Assign"}
             >
                {isAutoAssignEnabled ? <ToggleRight className="w-4 h-4 mr-2 text-purple-600" /> : <ToggleLeft className="w-4 h-4 mr-2 text-gray-400" />}
                {isAutoAssignEnabled ? 'Auto-Assign ON' : 'Auto-Assign OFF'}
                {isAutoAssignEnabled && <Sparkles className="w-3 h-3 ml-1.5 text-purple-500 animate-pulse" />}
             </button>
             
             <div className="w-px h-8 bg-gray-300 mx-1 hidden md:block"></div>

             {/* Improved Sort Control Group (Only show in List mode for now) */}
             {viewMode === 'list' && (
                 <div className="flex items-center bg-white rounded-md shadow-sm border border-gray-200 overflow-hidden">
                    <div className="px-3 py-2 bg-gray-50 border-r border-gray-200 flex items-center text-gray-500">
                        <ListFilter className="w-3.5 h-3.5 mr-1.5" />
                        <span className="text-[10px] font-bold uppercase tracking-wide">Sort By</span>
                    </div>
                    <button 
                      onClick={() => onSort('course')}
                      className={`px-3 py-2 text-xs font-medium border-r border-gray-200 transition-colors ${sortCriterion === 'course' ? 'bg-blue-100 text-blue-800 font-bold' : 'text-gray-600 hover:bg-gray-50 hover:text-blue-600'}`}
                    >
                       Course
                    </button>
                    <button 
                      onClick={() => onSort('time')}
                      className={`px-3 py-2 text-xs font-medium border-r border-gray-200 transition-colors ${sortCriterion === 'time' ? 'bg-blue-100 text-blue-800 font-bold' : 'text-gray-600 hover:bg-gray-50 hover:text-blue-600'}`}
                    >
                       Time
                    </button>
                    <button 
                      onClick={() => onSort('room')}
                      className={`px-3 py-2 text-xs font-medium border-r border-gray-200 transition-colors ${sortCriterion === 'room' ? 'bg-blue-100 text-blue-800 font-bold' : 'text-gray-600 hover:bg-gray-50 hover:text-blue-600'}`}
                    >
                       Room
                    </button>
                    <button 
                      onClick={() => onSort('faculty')}
                      className={`px-3 py-2 text-xs font-medium border-r border-gray-200 transition-colors ${sortCriterion === 'faculty' ? 'bg-blue-100 text-blue-800 font-bold' : 'text-gray-600 hover:bg-gray-50 hover:text-blue-600'}`}
                    >
                       Faculty
                    </button>
                    <button 
                      onClick={() => onSort('status')}
                      className={`px-3 py-2 text-xs font-medium transition-colors ${sortCriterion === 'status' ? 'bg-blue-100 text-blue-800 font-bold' : 'text-gray-600 hover:bg-gray-50 hover:text-blue-600'}`}
                    >
                       Status
                    </button>
                 </div>
             )}
             
             {/* Hidden Input for File Upload (Triggered via Modal) */}
             <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                className="hidden" 
                accept=".csv" 
             />
             
             {/* Load / Import Button */}
             <button 
                onClick={() => setShowLoadModal(true)}
                className="flex items-center px-3 py-2 bg-white border border-gray-200 rounded-md shadow-sm text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors ml-2"
                title="Load Previous Semester"
             >
                <History className="w-3.5 h-3.5 mr-2" />
                Load / Import
            </button>

            <button 
                onClick={() => exportRoomUtilizationReport(schedule, scheduleTitle)}
                className="flex items-center px-3 py-2 bg-slate-700 text-white border border-slate-800 rounded-md shadow-sm text-xs font-medium hover:bg-slate-800 transition-colors ml-2"
                title="Room Utilization Report"
            >
                <Building className="w-3.5 h-3.5 mr-2" />
                Room Report
            </button>

            <button 
                onClick={handleExportClick}
                className="flex items-center px-3 py-2 bg-green-600 text-white border border-green-700 rounded-md shadow-sm text-xs font-medium hover:bg-green-700 transition-colors"
                title="Export to Excel"
            >
                <Download className="w-3.5 h-3.5 mr-2" />
                Export
            </button>
            <button 
                onClick={() => setShowAssistant(!showAssistant)}
                className="flex items-center px-3 py-2 bg-indigo-600 text-white rounded-md shadow-sm text-xs font-medium hover:bg-indigo-700 transition-colors"
            >
                {showAssistant ? 'Hide AI' : 'AI Assist'}
            </button>
        </div>
      </div>

      {/* Metrics Row */}
      {/* ... (Metrics Row code unchanged) ... */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 flex-shrink-0">
         {/* Total Sections & Net Change */}
         <div className="bg-white px-4 py-3 rounded-lg border border-gray-200 shadow-sm flex items-center justify-between">
            <div>
               <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Total Sections</p>
               <div className="flex items-baseline mt-1">
                 <p className="text-2xl font-bold text-gray-800">{totalActive}</p>
                 <span className="text-xs text-gray-400 ml-2">active</span>
               </div>
            </div>
            <div className="text-right">
                <div className={`flex items-center text-sm font-bold ${netChange > 0 ? 'text-green-600' : netChange < 0 ? 'text-red-500' : 'text-gray-400'}`}>
                    {netChange > 0 ? <TrendingUp className="w-4 h-4 mr-1" /> : netChange < 0 ? <TrendingDown className="w-4 h-4 mr-1" /> : <Minus className="w-4 h-4 mr-1" />}
                    {netChange > 0 ? '+' : ''}{netChange}
                </div>
                <div className="text-[10px] text-gray-400 uppercase font-medium">Net Change</div>
            </div>
         </div>

         {/* Staffing Levels (Sections & Requests) */}
         <div className="bg-white px-4 py-3 rounded-lg border border-gray-200 shadow-sm flex flex-col justify-center space-y-3">
             {/* Section Staffing */}
             <div className="w-full">
                 <div className="flex justify-between items-end mb-1">
                     <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wide">Sections Staffed</p>
                     <span className="text-xs font-bold text-gray-700">{sectionsStaffedPct}%</span>
                 </div>
                 <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                    <div 
                        className={`h-full transition-all duration-500 ${sectionsStaffedPct === 100 ? 'bg-green-500' : 'bg-blue-600'}`} 
                        style={{ width: `${sectionsStaffedPct}%` }}
                    ></div>
                 </div>
             </div>

             {/* Request Fulfillment */}
             <div className="w-full">
                 <div className="flex justify-between items-end mb-1">
                     <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wide">Requests Assigned</p>
                     <span className="text-xs font-bold text-gray-700">{requestsAssignedPct}%</span>
                 </div>
                 <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                    <div 
                        className={`h-full transition-all duration-500 ${requestsAssignedPct >= 95 ? 'bg-green-500' : 'bg-indigo-500'}`} 
                        style={{ width: `${requestsAssignedPct}%` }}
                    ></div>
                 </div>
             </div>
         </div>

         {/* Faculty Requests Status Card */}
         <div className="bg-white px-4 py-3 rounded-lg border border-gray-200 shadow-sm flex items-center justify-between">
             <div>
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Faculty Requests</p>
                <div className="flex items-baseline mt-1 space-x-2">
                    <p className="text-2xl font-bold text-indigo-600">{requestsReceived}</p>
                    <span className="text-xs text-gray-400">of {instructors.length} Received</span>
                </div>
             </div>
             <button 
                onClick={() => setShowReminderModal(true)}
                className="flex items-center px-3 py-1.5 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-md hover:bg-indigo-100 transition-colors text-xs font-semibold"
             >
                <Mail className="w-3.5 h-3.5 mr-1.5" />
                Manage Status
             </button>
         </div>
      </div>

      {/* Main Workspace Area */}
      <div className="flex-1 flex overflow-hidden min-h-0">
          {/* Main Table/Grid Area */}
          <div className="flex-1 overflow-y-auto pr-2 rounded-lg border border-gray-200 bg-white shadow-sm">
             {viewMode === 'list' ? (
                 <ScheduleTable 
                    schedule={schedule} 
                    facultyRequests={requests}
                    availableRooms={rooms}
                    availableTimeBlocks={timeBlocks}
                    availableMethods={modalities}
                    onAddTimeBlock={onAddTimeBlock}
                    onUpdateSection={onUpdateSection}
                    onAddSection={onAddSection}
                    onRemoveSection={onRemoveSection}
                 />
             ) : (
                 <WeeklyVisualSchedule schedule={schedule} />
             )}
          </div>

          {/* Resizable Splitter */}
          <div 
            className="w-4 flex flex-col items-center justify-center cursor-col-resize hover:bg-gray-200 transition-colors flex-shrink-0 select-none group z-10"
            onMouseDown={startResizing}
            title="Drag to resize"
          >
             <div className="w-1 h-8 bg-gray-300 rounded-full group-hover:bg-blue-400 transition-colors" />
          </div>

          {/* Sidebar Requests Area */}
          <div 
            style={{ width: sidebarWidth }}
            className="flex-shrink-0 flex flex-col h-full bg-white transition-none"
          >
            <DraggableFacultyList 
                requests={sortedRequests} 
                schedule={schedule} 
                instructors={instructors}
            />
          </div>
      </div>

      {showAssistant && (
        <SmartAssistant 
            schedule={schedule} 
            requests={requests}
            onClose={() => setShowAssistant(false)}
        />
      )}

      {/* Load / Import Modal */}
      {showLoadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl animate-in fade-in zoom-in duration-200 overflow-hidden">
                <div className="bg-blue-900 text-white p-5 flex justify-between items-center">
                    <div>
                        <h2 className="text-lg font-bold">Load Previous Schedule</h2>
                        <p className="text-sm text-blue-200">Start your semester by loading data from a previous term.</p>
                    </div>
                    <button onClick={() => setShowLoadModal(false)} className="text-blue-200 hover:text-white transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>
                
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Option 1: System Archive */}
                    <div className="border border-gray-200 rounded-lg p-6 hover:border-blue-300 transition-colors bg-gray-50 flex flex-col">
                        <div className="flex items-center mb-4 text-blue-800">
                            <History className="w-6 h-6 mr-2" />
                            <h3 className="font-bold text-lg">System Archive</h3>
                        </div>
                        <p className="text-sm text-gray-600 mb-4 flex-1">
                            Choose a finalized schedule from a previous semester stored in the system.
                        </p>
                        
                        {archivedSchedules.length > 0 ? (
                            <div className="space-y-2">
                                {archivedSchedules.map(arch => (
                                    <button
                                        key={arch.id}
                                        onClick={() => {
                                            if(confirm(`Load ${arch.termTitle}? This will replace current data.`)) {
                                                onLoadArchivedSchedule(arch.id);
                                                setShowLoadModal(false);
                                            }
                                        }}
                                        className="w-full flex justify-between items-center p-3 bg-white border border-gray-300 rounded-md hover:bg-blue-50 hover:border-blue-400 transition-all text-sm font-medium text-gray-700"
                                    >
                                        <span>{arch.termTitle}</span>
                                        <span className="text-xs text-gray-400">{arch.sections.length} sections</span>
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-4 text-gray-400 text-sm italic border border-dashed border-gray-300 rounded">
                                No archived schedules found.
                            </div>
                        )}
                    </div>

                    {/* Option 2: File Upload */}
                    <div className="border border-gray-200 rounded-lg p-6 hover:border-green-300 transition-colors bg-gray-50 flex flex-col">
                        <div className="flex items-center mb-4 text-green-700">
                            <FileUp className="w-6 h-6 mr-2" />
                            <h3 className="font-bold text-lg">Upload File</h3>
                        </div>
                        <p className="text-sm text-gray-600 mb-6 flex-1">
                            Upload a CSV or Excel file exported from your student information system or previous spreadsheet.
                        </p>
                        <button 
                            onClick={() => fileInputRef.current?.click()}
                            className="w-full py-3 bg-white border border-green-600 text-green-700 font-bold rounded-lg hover:bg-green-600 hover:text-white transition-all shadow-sm flex items-center justify-center"
                        >
                            <Upload className="w-4 h-4 mr-2" />
                            Select CSV File
                        </button>
                    </div>
                </div>
            </div>
        </div>
      )}

      {/* Faculty Status Modal */}
      {showReminderModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
             <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[85vh] flex flex-col animate-in fade-in zoom-in duration-200">
                <div className="flex justify-between items-center p-5 border-b border-gray-100">
                    <div>
                        <h2 className="text-lg font-bold text-gray-800">Faculty Submission Status</h2>
                        <p className="text-sm text-gray-500">Track responses and send email reminders.</p>
                    </div>
                    <div className="flex items-center space-x-3">
                         <button 
                            onClick={handleRemindAll}
                            className="text-xs flex items-center bg-blue-100 text-blue-700 px-3 py-2 rounded-md hover:bg-blue-200 transition-colors font-medium"
                        >
                            <Send className="w-3.5 h-3.5 mr-1.5" />
                            Remind All Missing
                        </button>
                        <button onClick={() => setShowReminderModal(false)} className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors">
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                </div>
                
                <div className="p-6 overflow-y-auto bg-gray-50/50">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                            <div className="flex items-center justify-between mb-3 border-b border-gray-100 pb-2">
                                <h3 className="text-xs font-bold text-gray-500 uppercase">Full-Time Faculty</h3>
                                <span className="text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-600">{fullTime.filter(i => hasSubmitted(i.name)).length} / {fullTime.length}</span>
                            </div>
                            <div className="flex flex-wrap gap-2 content-start">
                                {fullTime.map(inst => <FacultyChip key={inst.id} instructor={inst} />)}
                            </div>
                        </div>

                        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                            <div className="flex items-center justify-between mb-3 border-b border-gray-100 pb-2">
                                <h3 className="text-xs font-bold text-gray-500 uppercase">Part-Time Faculty</h3>
                                <span className="text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-600">{partTime.filter(i => hasSubmitted(i.name)).length} / {partTime.length}</span>
                            </div>
                            <div className="flex flex-wrap gap-2 content-start">
                                {partTime.map(inst => <FacultyChip key={inst.id} instructor={inst} />)}
                            </div>
                        </div>
                    </div>
                </div>
                
                <div className="p-4 border-t border-gray-100 bg-gray-50 text-right">
                    <button 
                        onClick={() => setShowReminderModal(false)}
                        className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-50"
                    >
                        Close
                    </button>
                </div>
             </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
