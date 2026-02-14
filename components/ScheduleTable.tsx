
import React, { useState, useMemo, useEffect } from 'react';
import { ClassSection, SectionStatus, FacultyRequest } from '../types';
import { Edit2, X, Save, AlertTriangle, CheckCircle2, Plus } from 'lucide-react';
import MultiSelect from './MultiSelect';
import { DAYS_OF_WEEK } from '../services/mockData';

interface Props {
  schedule: ClassSection[];
  facultyRequests: FacultyRequest[];
  availableRooms: string[];
  // New props for Time Block management
  availableTimeBlocks?: string[]; 
  availableMethods?: string[];
  onAddTimeBlock?: (newBlock: string) => void;
  
  onUpdateSection: (id: string, updates: Partial<ClassSection>) => void;
  onAddSection: (section: Partial<ClassSection>) => void;
}

// Helper to parse time string "9:35 AM" to minutes from midnight
const parseTime = (timeStr: string): number | null => {
  if (!timeStr) return null;
  const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
  if (!match) return null;
  let [_, h, m, period] = match;
  let hour = parseInt(h);
  const minute = parseInt(m);
  if (period.toUpperCase() === 'PM' && hour !== 12) hour += 12;
  if (period.toUpperCase() === 'AM' && hour === 12) hour = 0;
  return hour * 60 + minute;
};

// Helper to check time overlap
const hasTimeOverlap = (start1: string, end1: string, start2: string, end2: string) => {
  const s1 = parseTime(start1);
  const e1 = parseTime(end1);
  const s2 = parseTime(start2);
  const e2 = parseTime(end2);
  if (s1 === null || e1 === null || s2 === null || e2 === null) return false;
  return Math.max(s1, s2) < Math.min(e1, e2);
};

// Helper to check day overlap (simple char check for M, T, W, R, F, S)
const hasDayOverlap = (days1: string, days2: string) => {
  if (!days1 || !days2) return false;
  const d1 = days1.toUpperCase();
  const d2 = days2.toUpperCase();
  for (const char of d1) {
    if (d2.includes(char)) return true;
  }
  return false;
};

// Helper to parse course string "MCSI 200 - Title"
const parseCourseString = (fullTitle: string) => {
  const parts = fullTitle.match(/^([A-Z]+)\s+(\d+)\s*-\s*(.+)$/);
  if (parts) {
    return { subject: parts[1], courseNumber: parts[2], title: parts[3] };
  }
  return { subject: '', courseNumber: '', title: fullTitle };
};

// Helper for days mapping from ["Mon", "Wed"] to "MW"
const mapDaysToCode = (days: string[]) => {
  const map: Record<string, string> = { 'Mon': 'M', 'Tue': 'T', 'Wed': 'W', 'Thu': 'R', 'Fri': 'F', 'Sat': 'S', 'Sun': 'U' };
  return days.map(d => map[d] || '').join('');
};

const parseDaysFromCode = (code: string): string[] => {
  if (!code) return [];
  const map: Record<string, string> = { 'M': 'Mon', 'T': 'Tue', 'W': 'Wed', 'R': 'Thu', 'F': 'Fri', 'S': 'Sat', 'U': 'Sun' };
  return code.split('').map(c => map[c]).filter(Boolean);
};

const mapModalityToMethod = (mod: string) => {
    if (mod === 'Online') return 'ONLINE';
    if (mod === 'Hybrid') return 'HYBRID';
    return 'LEC';
};

const ScheduleTable: React.FC<Props> = ({ 
    schedule, 
    facultyRequests, 
    availableRooms, 
    availableTimeBlocks = [],
    availableMethods = [],
    onAddTimeBlock,
    onUpdateSection, 
    onAddSection 
}) => {
  const [editingSection, setEditingSection] = useState<ClassSection | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  // Time Block State for Edit Modal
  const [selectedTimeBlock, setSelectedTimeBlock] = useState('');
  const [isAddingTimeBlock, setIsAddingTimeBlock] = useState(false);
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');

  // When editing section changes, try to match current time to a block
  useEffect(() => {
    if (editingSection) {
        if (editingSection.beginTime && editingSection.endTime) {
            const combined = `${editingSection.beginTime} - ${editingSection.endTime}`;
            if (availableTimeBlocks.includes(combined)) {
                setSelectedTimeBlock(combined);
            } else {
                setSelectedTimeBlock('CUSTOM'); // It has time, but matches no block
            }
        } else {
            setSelectedTimeBlock('');
        }
        setIsAddingTimeBlock(false);
        setCustomStart('');
        setCustomEnd('');
    }
  }, [editingSection, availableTimeBlocks]);

  // Derive unique lists
  const facultyOptions = useMemo(() => {
    const names = new Set(['Staff']);
    facultyRequests.forEach(r => names.add(r.name));
    return Array.from(names).sort();
  }, [facultyRequests]);

  // Combine passed available rooms with any room currently used in the schedule (in case import had undefined rooms)
  const allRooms = useMemo(() => {
    const roomSet = new Set(availableRooms);
    schedule.forEach(s => {
        if(s.room) roomSet.add(s.room);
    });
    return Array.from(roomSet).sort();
  }, [schedule, availableRooms]);

  // Styling logic based on status
  const getRowClasses = (section: ClassSection) => {
    const isAssigned = section.faculty && section.faculty !== 'Staff';

    switch (section.status) {
      case SectionStatus.IMPORTED:
        // If assigned, show as dark/bold but keep gray background to indicate source
        if (isAssigned) return 'bg-gray-100 text-gray-900 font-bold border-l-4 border-blue-500';
        return 'bg-gray-100 text-gray-500 italic font-normal'; // Template/Ghost look
      case SectionStatus.KEEP:
        return 'bg-blue-100 text-blue-900 font-semibold'; // Light Blue
      case SectionStatus.CHANGE:
        return 'bg-green-100 text-green-900 font-semibold'; // Green
      case SectionStatus.DELETE:
        return 'bg-orange-200 text-orange-900'; // Brown/Tan
      case SectionStatus.NEW:
        return 'bg-pink-100 text-pink-900 font-semibold'; // Light Pink
      default:
        return 'bg-white text-gray-900';
    }
  };

  const getRequestedFaculty = (courseTitle: string) => {
    return facultyRequests.filter(req => 
      req.preferences.some(p => courseTitle.toLowerCase().includes(p.classTitle.toLowerCase()))
    );
  };

  // Check for conflicts for a specific section against the rest of the schedule
  const getConflicts = (section: ClassSection, excludeId?: string) => {
    const conflicts: string[] = [];
    
    // Ignore online or TBA
    if (!section.room || section.room === 'ONLINE' || section.room === 'TBA') return [];
    if (!section.meetingDays || !section.beginTime || !section.endTime) return [];

    schedule.forEach(other => {
      if (other.id === (excludeId || section.id)) return; // Don't check against self
      if (other.room === 'ONLINE' || other.room === 'TBA') return;

      // Room Conflict
      if (other.room === section.room) {
        if (hasDayOverlap(section.meetingDays, other.meetingDays)) {
          if (hasTimeOverlap(section.beginTime, section.endTime, other.beginTime, other.endTime)) {
            conflicts.push(`Room conflict with ${other.subject} ${other.courseNumber} (Sec ${other.section})`);
          }
        }
      }
    });

    return conflicts;
  };

  // Find available rooms for the editing section from the master list
  const getFreeRooms = (current: ClassSection) => {
    if (!current.meetingDays || !current.beginTime || !current.endTime) return [];

    return allRooms.filter(room => {
      // Check if this room is occupied by ANY other class at this time
      const isOccupied = schedule.some(other => {
        if (other.id === current.id) return false;
        if (other.room !== room) return false;
        if (!hasDayOverlap(current.meetingDays, other.meetingDays)) return false;
        if (!hasTimeOverlap(current.beginTime, current.endTime, other.beginTime, other.endTime)) return false;
        return true;
      });
      return !isOccupied;
    });
  };

  const handleEditClick = (section: ClassSection) => {
    setEditingSection({ ...section });
  };

  const handleSaveEdit = () => {
    if (editingSection) {
      const updates = { ...editingSection };
      // Auto-confirm imported sections when manually edited
      if (updates.status === SectionStatus.IMPORTED) {
        updates.status = SectionStatus.KEEP;
      }
      onUpdateSection(editingSection.id, updates);
      setEditingSection(null);
    }
  };

  const handleEditChange = (field: keyof ClassSection, value: string) => {
    if (editingSection) {
      setEditingSection({ ...editingSection, [field]: value });
    }
  };

  const handleTimeBlockChange = (value: string) => {
      setSelectedTimeBlock(value);
      if (value === 'NEW') {
          setIsAddingTimeBlock(true);
          return;
      }
      if (value === 'CUSTOM') {
          return; // Do nothing to times, just allow manual edit if needed (though UI below hides inputs unless custom/new logic improved)
      }
      if (value && value !== 'CUSTOM') {
          const parts = value.split(' - ');
          if (parts.length === 2 && editingSection) {
              setEditingSection({ 
                  ...editingSection, 
                  beginTime: parts[0], 
                  endTime: parts[1] 
              });
          }
      }
  };
  
  const formatTime = (timeStr: string) => {
     if(!timeStr) return '';
     const [h, m] = timeStr.split(':');
     const hour = parseInt(h);
     const ampm = hour >= 12 ? 'PM' : 'AM';
     const h12 = hour % 12 || 12;
     // simple pad minutes
     const mStr = m.length === 1 ? `0${m}` : m;
     return `${h12}:${mStr} ${ampm}`;
  };

  const handleCreateTimeBlock = () => {
      if (customStart && customEnd && onAddTimeBlock) {
          const formattedStart = formatTime(customStart);
          const formattedEnd = formatTime(customEnd);
          const newBlock = `${formattedStart} - ${formattedEnd}`;
          
          // Call the prop to update the central list
          onAddTimeBlock(newBlock);
          
          // Select it immediately locally
          if (editingSection) {
              setEditingSection({
                  ...editingSection,
                  beginTime: formattedStart,
                  endTime: formattedEnd
              });
          }
          setIsAddingTimeBlock(false);
          // Force select logic to pick up the new value once parent rerenders, or set locally now:
          setSelectedTimeBlock(newBlock); 
      }
  };

  // Handle Faculty Dropdown Change directly in table
  const handleFacultyChange = (id: string, newFaculty: string, currentStatus: SectionStatus) => {
    let newStatus = currentStatus;
    // If it was imported and we change faculty, mark it as active (KEEP or CHANGE, let's say CHANGE since we touched it)
    if (currentStatus === SectionStatus.IMPORTED) {
        newStatus = SectionStatus.CHANGE;
    }
    onUpdateSection(id, { faculty: newFaculty, status: newStatus });
  };

  // Drag Handlers
  const handleDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault(); // Necessary to allow dropping
    if (dragOverId !== id) setDragOverId(id);
  };

  const handleDragLeave = () => {
    setDragOverId(null);
  };

  const handleDrop = (e: React.DragEvent, sectionId: string | null) => {
    e.preventDefault();
    setDragOverId(null);

    const dataStr = e.dataTransfer.getData('faculty-request');
    if (!dataStr) return; // Not a valid drop

    try {
        const { facultyName, preference } = JSON.parse(dataStr);
        const { subject, courseNumber, title } = parseCourseString(preference.classTitle);
        const method = mapModalityToMethod(preference.modality);
        const days = mapDaysToCode(preference.daysAvailable);

        // Construct notes from preference
        const noteParts = [];
        if (preference.sameAsLastYear) noteParts.push('[Same as last year]');
        // Only append if it's special cost
        if (preference.textbookCost && preference.textbookCost !== 'Regular Cost') {
             noteParts.push(`[${preference.textbookCost}]`);
        }
        if (preference.notes) noteParts.push(preference.notes);
        const combinedNotes = noteParts.join(' ');

        if (sectionId) {
            // Drop on Existing -> Replace Course Info
            onUpdateSection(sectionId, { 
                faculty: facultyName,
                subject: subject || 'UNK',
                courseNumber: courseNumber || '000',
                title: title,
                method: method,
                meetingDays: days,
                notes: combinedNotes, // Inject notes
                // We keep the existing time/room of the slot we dropped onto
                status: SectionStatus.CHANGE // Explicitly sets to CHANGE, removing IMPORTED status
            });
        } else {
            // Drop on "Add New" -> Insert new section
            onAddSection({
                faculty: facultyName,
                subject: subject || 'MCSI',
                courseNumber: courseNumber || '101',
                title: title,
                method: method,
                meetingDays: days,
                notes: combinedNotes, // Inject notes
                // Default placeholders
                term: '2026MFA',
                section: 'NEW',
                beginTime: '',
                endTime: '',
                room: method === 'ONLINE' ? 'ONLINE' : '',
                status: SectionStatus.NEW
            });
        }
    } catch (err) {
        console.error("Failed to parse dropped data", err);
    }
  };

  const currentConflicts = editingSection ? getConflicts(editingSection, editingSection.id) : [];
  const freeRooms = editingSection ? getFreeRooms(editingSection) : [];

  return (
    <>
      <div className="overflow-x-auto shadow-md rounded-lg border border-gray-200 bg-white">
        <table className="min-w-full text-xs md:text-sm divide-y divide-gray-200">
          <thead className="bg-blue-900 text-white sticky top-0 z-10">
            <tr>
              <th className="px-2 py-3 text-left">Term</th>
              <th className="px-2 py-3 text-left">Subj</th>
              <th className="px-2 py-3 text-left">No.</th>
              <th className="px-2 py-3 text-left">Sec</th>
              <th className="px-2 py-3 text-left w-48">Title</th>
              <th className="px-2 py-3 text-left">Method</th>
              <th className="px-2 py-3 text-left">Days</th>
              <th className="px-2 py-3 text-left">Time</th>
              <th className="px-2 py-3 text-left">Room</th>
              <th className="px-2 py-3 text-left w-48">Faculty</th>
              <th className="px-2 py-3 text-left">Status</th>
              <th className="px-2 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {schedule.map((section) => {
              const interestedFaculty = getRequestedFaculty(section.title);
              const rowConflicts = getConflicts(section);
              const isDragOver = dragOverId === section.id;
              
              return (
                <tr 
                    key={section.id} 
                    className={`${getRowClasses(section)} transition-colors ${isDragOver ? 'bg-blue-100 ring-2 ring-blue-500 ring-inset' : 'hover:opacity-90'}`}
                    onDragOver={(e) => handleDragOver(e, section.id)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, section.id)}
                >
                  <td className="px-2 py-2 whitespace-nowrap">{section.term}</td>
                  <td className="px-2 py-2">{section.subject}</td>
                  <td className="px-2 py-2">{section.courseNumber}</td>
                  <td className="px-2 py-2">{section.section}</td>
                  <td className="px-2 py-2">
                    {section.title}
                    {section.notes && <div className="text-xs text-blue-600 italic mt-0.5">{section.notes}</div>}
                  </td>
                  <td className="px-2 py-2">{section.method}</td>
                  <td className="px-2 py-2">{section.meetingDays}</td>
                  <td className="px-2 py-2 whitespace-nowrap">{section.beginTime} - {section.endTime}</td>
                  <td className="px-2 py-2 flex items-center">
                    {section.room}
                    {rowConflicts.length > 0 && (
                      <span title={rowConflicts.join('\n')}>
                        <AlertTriangle className="w-4 h-4 text-red-500 ml-1" />
                      </span>
                    )}
                  </td>
                  <td className="px-2 py-2">
                    <div className="relative group">
                      <select
                        value={section.faculty}
                        onChange={(e) => handleFacultyChange(section.id, e.target.value, section.status)}
                        onClick={(e) => e.stopPropagation()} // Prevent row click issues
                        className={`w-full p-1 border rounded bg-transparent ${
                            section.faculty === 'Staff' && section.status !== SectionStatus.IMPORTED 
                                ? 'border-red-300 bg-red-50 text-red-900' 
                                : 'border-gray-300'
                        } ${section.status === SectionStatus.IMPORTED && section.faculty === 'Staff' ? 'text-gray-500 italic' : 'text-gray-900 font-medium'}`}
                      >
                        {facultyOptions.map(opt => (
                            <option key={opt} value={opt}>{opt}</option>
                        ))}
                        {/* Fallback for unlisted manual entries */}
                        {!facultyOptions.includes(section.faculty) && section.faculty !== '' && (
                            <option value={section.faculty}>{section.faculty}</option>
                        )}
                      </select>

                      {/* Tooltip showing requests */}
                      {interestedFaculty.length > 0 && (
                        <div className="absolute hidden group-hover:block z-50 bottom-full left-0 bg-gray-800 text-white text-xs rounded p-2 mb-1 w-48 shadow-lg font-normal">
                          <strong>Requested by:</strong>
                          <ul className="list-disc pl-4 mt-1">
                            {interestedFaculty.map(f => (
                              <li key={f.id}>{f.name} (Rank {f.preferences.find(p => section.title.toLowerCase().includes(p.classTitle.toLowerCase()))?.rank})</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {interestedFaculty.length > 0 && (
                        <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-blue-500 pointer-events-none" title="Faculty requested this"></span>
                      )}
                    </div>
                  </td>
                  <td className="px-2 py-2">
                    <select 
                      value={section.status} 
                      onChange={(e) => onUpdateSection(section.id, { status: e.target.value as SectionStatus })}
                      onClick={(e) => e.stopPropagation()}
                      className={`p-1 border border-gray-300 rounded text-xs bg-transparent ${section.status === SectionStatus.IMPORTED && section.faculty === 'Staff' ? 'text-gray-500 italic' : 'text-gray-900 font-bold'}`}
                    >
                      {Object.values(SectionStatus).map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                  <td className="px-2 py-2">
                      <button 
                        onClick={() => handleEditClick(section)}
                        className="text-gray-500 hover:text-blue-600 p-1 rounded hover:bg-blue-50 transition-colors" 
                        title="Edit Details"
                      >
                          <Edit2 className="w-4 h-4" />
                      </button>
                  </td>
                </tr>
              );
            })}
            
            {/* ADD NEW SECTION ROW */}
             <tr 
                className={`border-2 border-dashed border-gray-300 h-16 transition-colors ${dragOverId === 'ADD_NEW' ? 'bg-blue-50 border-blue-500' : 'bg-gray-50 hover:bg-gray-100'}`}
                onDragOver={(e) => handleDragOver(e, 'ADD_NEW')}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, null)}
             >
                <td colSpan={12} className="text-center">
                    <div className="flex flex-col items-center justify-center text-gray-400 py-2 pointer-events-none">
                        <Plus className="w-6 h-6 mb-1" />
                        <span className="text-sm font-medium">Drop Faculty Request Here to Add New Class</span>
                    </div>
                </td>
             </tr>
          </tbody>
        </table>
      </div>

      {/* Edit Modal */}
      {editingSection && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
            <div className="bg-blue-900 text-white px-6 py-4 flex justify-between items-center sticky top-0 z-10">
              <h2 className="text-xl font-bold">Edit Class Section</h2>
              <button onClick={() => setEditingSection(null)} className="text-white hover:text-gray-200">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6">
                {currentConflicts.length > 0 && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-800 text-sm">
                        <div className="font-bold flex items-center"><AlertTriangle className="w-4 h-4 mr-2"/> Conflicts Detected:</div>
                        <ul className="list-disc pl-5 mt-1">
                            {currentConflicts.map((c, i) => <li key={i}>{c}</li>)}
                        </ul>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Term removed as requested */}
                
                <div className="col-span-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                    <input type="text" value={editingSection.subject} onChange={e => handleEditChange('subject', e.target.value)} className="w-full border border-gray-300 p-2 rounded text-gray-900 bg-white" />
                </div>
                <div className="col-span-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Course No.</label>
                    <input type="text" value={editingSection.courseNumber} onChange={e => handleEditChange('courseNumber', e.target.value)} className="w-full border border-gray-300 p-2 rounded text-gray-900 bg-white" />
                </div>
                <div className="col-span-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Section</label>
                    <input type="text" value={editingSection.section} onChange={e => handleEditChange('section', e.target.value)} className="w-full border border-gray-300 p-2 rounded text-gray-900 bg-white" />
                </div>
                <div className="col-span-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Method</label>
                    <select 
                      value={editingSection.method} 
                      onChange={e => handleEditChange('method', e.target.value)} 
                      className="w-full border border-gray-300 p-2 rounded text-gray-900 bg-white"
                    >
                       <option value="">Select Method...</option>
                       {availableMethods.map(m => (
                         <option key={m} value={m}>{m}</option>
                       ))}
                       {/* Keep manual entry fallback just in case */}
                       {!availableMethods.includes(editingSection.method) && editingSection.method && (
                         <option value={editingSection.method}>{editingSection.method}</option>
                       )}
                    </select>
                </div>
                
                <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                    <input type="text" value={editingSection.title} onChange={e => handleEditChange('title', e.target.value)} className="w-full border border-gray-300 p-2 rounded text-gray-900 bg-white" />
                </div>

                <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Section Notes</label>
                    <input type="text" value={editingSection.notes || ''} onChange={e => handleEditChange('notes', e.target.value)} className="w-full border border-gray-300 p-2 rounded text-gray-900 bg-white" placeholder="Special requirements..." />
                </div>

                <div className="col-span-2 border-t border-gray-200 pt-4 mt-2">
                    <h3 className="font-semibold text-gray-800 mb-3">Time & Room Assignment</h3>
                </div>

                <div className="col-span-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Days</label>
                    <MultiSelect 
                        label="Select Days" 
                        options={DAYS_OF_WEEK} 
                        selected={parseDaysFromCode(editingSection.meetingDays)} 
                        onChange={(selected) => handleEditChange('meetingDays', mapDaysToCode(selected))}
                    />
                </div>
                
                <div className="col-span-1">
                     {/* Spacer */}
                </div>
                
                <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Time Block</label>
                    <div className="flex space-x-2">
                         <select 
                            value={selectedTimeBlock} 
                            onChange={e => handleTimeBlockChange(e.target.value)}
                            className="flex-1 border border-gray-300 p-2 rounded text-gray-900 bg-white"
                         >
                            <option value="">Select Time Block...</option>
                            {availableTimeBlocks.map(tb => (
                                <option key={tb} value={tb}>{tb}</option>
                            ))}
                            {selectedTimeBlock === 'CUSTOM' && <option value="CUSTOM">Custom/Manual</option>}
                            <option value="NEW" className="font-bold text-blue-600">+ Add New Time Block</option>
                         </select>
                    </div>

                    {/* New Time Block Creator */}
                    {isAddingTimeBlock && (
                         <div className="mt-3 bg-gray-50 p-3 rounded border border-gray-200 animate-in fade-in slide-in-from-top-2">
                            <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Define New Time Block</h4>
                            <div className="flex gap-2 items-center">
                                <input 
                                    type="time" 
                                    value={customStart}
                                    onChange={e => setCustomStart(e.target.value)}
                                    className="border p-1 rounded text-sm bg-white"
                                />
                                <span className="text-gray-400">to</span>
                                <input 
                                    type="time" 
                                    value={customEnd}
                                    onChange={e => setCustomEnd(e.target.value)}
                                    className="border p-1 rounded text-sm bg-white"
                                />
                                <button 
                                    onClick={handleCreateTimeBlock}
                                    className="bg-blue-600 text-white px-3 py-1 rounded text-xs font-bold hover:bg-blue-700"
                                >
                                    Add
                                </button>
                                <button 
                                    onClick={() => setIsAddingTimeBlock(false)}
                                    className="text-gray-500 hover:text-gray-700 px-2"
                                >
                                    Cancel
                                </button>
                            </div>
                         </div>
                    )}

                    {/* Fallback Display of current time if not in list */}
                    {!isAddingTimeBlock && (
                        <div className="text-xs text-gray-500 mt-1 pl-1">
                            Current: {editingSection.beginTime} - {editingSection.endTime}
                        </div>
                    )}
                </div>

                <div className="col-span-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Room</label>
                    <select 
                        value={editingSection.room} 
                        onChange={e => handleEditChange('room', e.target.value)} 
                        className={`w-full border p-2 rounded text-gray-900 bg-white ${currentConflicts.length > 0 ? 'border-red-500 bg-red-50' : 'border-gray-300'}`} 
                    >
                        <option value="">Select Room...</option>
                        {allRooms.map(room => (
                            <option key={room} value={room}>{room}</option>
                        ))}
                    </select>
                </div>
                <div className="col-span-1">
                     <label className="block text-sm font-medium text-gray-700 mb-1">Available Rooms</label>
                     <div className="flex flex-wrap gap-2 text-xs">
                        {freeRooms.length > 0 ? (
                            freeRooms.slice(0, 5).map(room => (
                                <button 
                                    key={room}
                                    onClick={() => handleEditChange('room', room)}
                                    className="px-2 py-1 bg-green-50 text-green-700 border border-green-200 rounded hover:bg-green-100 flex items-center"
                                >
                                    <CheckCircle2 className="w-3 h-3 mr-1" />
                                    {room}
                                </button>
                            ))
                        ) : (
                            <span className="text-gray-500 italic">No rooms available or online</span>
                        )}
                        {freeRooms.length > 5 && <span className="text-gray-400 self-center">+{freeRooms.length - 5} more</span>}
                     </div>
                </div>

                <div className="col-span-2 border-t border-gray-200 pt-4 mt-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Faculty Assignment</label>
                    <select 
                        value={editingSection.faculty} 
                        onChange={e => handleEditChange('faculty', e.target.value)} 
                        className="w-full border border-gray-300 p-2 rounded text-gray-900 bg-white"
                    >
                        {facultyOptions.map(name => (
                            <option key={name} value={name}>{name}</option>
                        ))}
                        {!facultyOptions.includes(editingSection.faculty) && editingSection.faculty !== '' && (
                            <option value={editingSection.faculty}>{editingSection.faculty} (Manual)</option>
                        )}
                    </select>
                </div>
                </div>
            </div>

            <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3 sticky bottom-0">
              <button onClick={() => setEditingSection(null)} className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-100 font-medium">
                Cancel
              </button>
              <button onClick={handleSaveEdit} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center font-medium">
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ScheduleTable;
