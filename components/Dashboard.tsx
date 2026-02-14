
// ... imports ...
import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { ClassSection, FacultyRequest, Instructor, EmailSettings, SectionStatus } from '../types';
import ScheduleTable from './ScheduleTable';
import SmartAssistant from './SmartAssistant';
import DraggableFacultyList from './DraggableFacultyList';
import { Upload, ArrowUpDown, Clock, MapPin, CheckCircle2, Mail, Send, X, User, TrendingUp, TrendingDown, Minus, Download, AlertCircle, ToggleLeft, ToggleRight, Sparkles, ListFilter } from 'lucide-react';
import { parseScheduleCSV, exportScheduleToExcel, parseTimeMinutes, getDaySortValue } from '../utils/schedulerUtils';

interface Props {
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
}

const Dashboard: React.FC<Props> = ({ scheduleTitle, schedule, requests, rooms, instructors, onUpdateSection, onAddSection, onImportSchedule, onSort, onUpdateInstructor, isSidebarCollapsed, emailSettings, timeBlocks, modalities, onAddTimeBlock }) => {
  const [showAssistant, setShowAssistant] = useState(false);
  const [showReminderModal, setShowReminderModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Resize State
  const [sidebarWidth, setSidebarWidth] = useState(350);
  const [isResizing, setIsResizing] = useState(false);

  // Auto-Assign State
  const [isAutoAssignEnabled, setIsAutoAssignEnabled] = useState(false);

  // --- Statistics Calculations ---
  
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
  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onImportSchedule) {
        const reader = new FileReader();
        reader.onload = (evt) => {
            const text = evt.target?.result as string;
            const sections = parseScheduleCSV(text, 'temp_id');
            // We always import the faculty name (if present) so drag-and-drop matching works.
            // Status starts as IMPORTED, so it won't count against load until confirmed.
            onImportSchedule(sections);
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
          <p className="text-sm text-gray-500">Department of Business & Computing</p>
        </div>
        <div className="flex flex-wrap gap-2 items-center">
             
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

             {/* Improved Sort Control Group */}
             <div className="flex items-center bg-white rounded-md shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-3 py-2 bg-gray-50 border-r border-gray-200 flex items-center text-gray-500">
                    <ListFilter className="w-3.5 h-3.5 mr-1.5" />
                    <span className="text-[10px] font-bold uppercase tracking-wide">Sort By</span>
                </div>
                <button 
                  onClick={() => onSort('course')}
                  className="px-3 py-2 text-xs font-medium text-gray-600 hover:bg-gray-50 hover:text-blue-600 border-r border-gray-200 transition-colors"
                >
                   Course
                </button>
                <button 
                  onClick={() => onSort('time')}
                  className="px-3 py-2 text-xs font-medium text-gray-600 hover:bg-gray-50 hover:text-blue-600 border-r border-gray-200 transition-colors"
                >
                   Time
                </button>
                <button 
                  onClick={() => onSort('room')}
                  className="px-3 py-2 text-xs font-medium text-gray-600 hover:bg-gray-50 hover:text-blue-600 border-r border-gray-200 transition-colors"
                >
                   Room
                </button>
                <button 
                  onClick={() => onSort('faculty')}
                  className="px-3 py-2 text-xs font-medium text-gray-600 hover:bg-gray-50 hover:text-blue-600 border-r border-gray-200 transition-colors"
                >
                   Faculty
                </button>
                <button 
                  onClick={() => onSort('status')}
                  className="px-3 py-2 text-xs font-medium text-gray-600 hover:bg-gray-50 hover:text-blue-600 transition-colors"
                >
                   Status
                </button>
             </div>
             
             <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                className="hidden" 
                accept=".csv" 
             />
             <button 
                onClick={handleImportClick}
                className="flex items-center px-3 py-2 bg-white border border-gray-200 rounded-md shadow-sm text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors ml-2"
                title="Import Previous Year Schedule (CSV)"
             >
                <Upload className="w-3.5 h-3.5 mr-2" />
                Import
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
          {/* Main Table Area */}
          <div className="flex-1 overflow-y-auto pr-2 rounded-lg border border-gray-200 bg-white shadow-sm">
             <ScheduleTable 
                schedule={schedule} 
                facultyRequests={requests}
                availableRooms={rooms}
                availableTimeBlocks={timeBlocks}
                availableMethods={modalities}
                onAddTimeBlock={onAddTimeBlock}
                onUpdateSection={onUpdateSection}
                onAddSection={onAddSection}
             />
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
        <SmartAssistant schedule={schedule} requests={requests} />
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
