
import React, { useState, useMemo } from 'react';
import { ClassSection, CourseOption, Instructor, EmailSettings } from '../types';
import { Trash2, Plus, Settings, UserPlus, Edit2, Clock, Mail, Check, X, GripVertical, UserCog } from 'lucide-react';
import { parseTimeMinutes } from '../utils/schedulerUtils';

interface Props {
  // Global settings like scheduleTitle removed
  courses: CourseOption[];
  onAddCourse: (code: string, title: string) => void;
  onRemoveCourse: (id: string) => void;
  
  // Modalities and Campuses removed from here (Managed Globally)

  rooms: string[];
  onAddRoom: (val: string) => void;
  onRemoveRoom: (val: string) => void;
  onUpdateRoom: (oldVal: string, newVal: string) => void;

  instructors: Instructor[];
  onAddInstructor: (inst: Partial<Instructor>) => void;
  onUpdateInstructor: (id: string, updates: Partial<Instructor>) => void;
  onRemoveInstructor: (id: string) => void;

  timeBlocks: string[];
  onAddTimeBlock: (val: string) => void;
  onRemoveTimeBlock: (val: string) => void;

  schedule: ClassSection[]; 
  emailSettings: EmailSettings;
  setEmailSettings: React.Dispatch<React.SetStateAction<EmailSettings>>;
}

const AdminSettings: React.FC<Props> = ({ 
  courses, onAddCourse, onRemoveCourse,
  rooms, onAddRoom, onRemoveRoom, onUpdateRoom,
  instructors, onAddInstructor, onUpdateInstructor, onRemoveInstructor,
  timeBlocks, onAddTimeBlock, onRemoveTimeBlock,
  emailSettings, setEmailSettings
}) => {
  const [newCourseCode, setNewCourseCode] = useState('');
  const [newCourseTitle, setNewCourseTitle] = useState('');
  const [newRoom, setNewRoom] = useState('');
  
  // Time Block State
  const [newStartTime, setNewStartTime] = useState('');
  const [newEndTime, setNewEndTime] = useState('');
  
  // Room Edit State
  const [editingRoom, setEditingRoom] = useState<string | null>(null);
  const [editRoomName, setEditRoomName] = useState('');

  // Instructor State
  const [editingInstructorId, setEditingInstructorId] = useState<string | null>(null);
  const [newInstName, setNewInstName] = useState('');
  const [newInstEmail, setNewInstEmail] = useState('');
  const [newInstSeniority, setNewInstSeniority] = useState<number | ''>('');
  const [newInstType, setNewInstType] = useState<'Full-Time' | 'Part-Time'>('Full-Time');
  const [newInstIsScheduler, setNewInstIsScheduler] = useState(false);

  // Instructor Drag State
  const [draggedInstructorId, setDraggedInstructorId] = useState<string | null>(null);

  // Sorting Lists for Display
  const sortedInstructors = useMemo(() => {
    return [...instructors].sort((a, b) => {
        // Primary Sort: Seniority (if exists)
        if ((a.seniority || 99) !== (b.seniority || 99)) {
            return (a.seniority || 99) - (b.seniority || 99);
        }
        // Secondary Sort: Name
        return a.name.localeCompare(b.name);
    });
  }, [instructors]);

  const sortedCourses = useMemo(() => {
    return [...courses].sort((a, b) => a.code.localeCompare(b.code));
  }, [courses]);

  const sortedRooms = useMemo(() => {
    return [...rooms].sort((a, b) => a.localeCompare(b));
  }, [rooms]);

  const sortedTimeBlocks = useMemo(() => {
    return [...timeBlocks].sort((a, b) => {
        const startA = a.split(' - ')[0];
        const startB = b.split(' - ')[0];
        return parseTimeMinutes(startA) - parseTimeMinutes(startB);
    });
  }, [timeBlocks]);

  const addCourse = () => {
    if (newCourseCode && newCourseTitle) {
      onAddCourse(newCourseCode, newCourseTitle);
      setNewCourseCode('');
      setNewCourseTitle('');
    }
  };

  const addRoom = () => {
    if (newRoom && !rooms.includes(newRoom)) {
        onAddRoom(newRoom);
        setNewRoom('');
    }
  };

  const startEditRoom = (room: string) => {
    setEditingRoom(room);
    setEditRoomName(room);
  };

  const cancelEditRoom = () => {
    setEditingRoom(null);
    setEditRoomName('');
  };

  const saveEditRoom = () => {
    const oldName = editingRoom;
    const newName = editRoomName.trim();

    if (!oldName) return;

    if (!newName) {
        alert("Room name cannot be empty.");
        return;
    }

    // If name hasn't changed, just close
    if (newName === oldName) {
        setEditingRoom(null);
        return;
    }

    if (rooms.includes(newName)) {
        alert("A room with that name already exists.");
        return;
    }

    onUpdateRoom(oldName, newName);
    setEditingRoom(null);
    setEditRoomName('');
  };

  const formatTimeForDisplay = (timeStr: string) => {
      if (!timeStr) return '';
      const [h, m] = timeStr.split(':');
      const hour = parseInt(h);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const hour12 = hour % 12 || 12;
      return `${hour12}:${m} ${ampm}`;
  };

  const addTimeBlock = () => {
    if (newStartTime && newEndTime) {
        const formattedStart = formatTimeForDisplay(newStartTime);
        const formattedEnd = formatTimeForDisplay(newEndTime);
        const newBlock = `${formattedStart} - ${formattedEnd}`;

        if (!timeBlocks.includes(newBlock)) {
            onAddTimeBlock(newBlock);
            setNewStartTime('');
            setNewEndTime('');
        } else {
            alert('Time block already exists.');
        }
    }
  };

  // Instructor Management Functions
  const handleSaveInstructor = () => {
      if (!newInstName || !newInstEmail) return;

      if (editingInstructorId) {
          // Update Existing
          onUpdateInstructor(editingInstructorId, {
             name: newInstName,
             email: newInstEmail,
             type: newInstType,
             seniority: newInstSeniority === '' ? 99 : newInstSeniority,
             isScheduler: newInstIsScheduler
          });
          setEditingInstructorId(null);
      } else {
          // Add New
          onAddInstructor({
              name: newInstName,
              email: newInstEmail,
              type: newInstType,
              seniority: newInstSeniority === '' ? 99 : newInstSeniority,
              isScheduler: newInstIsScheduler
          });
      }
      
      // Reset Form
      setNewInstName('');
      setNewInstEmail('');
      setNewInstSeniority('');
      setNewInstType('Full-Time');
      setNewInstIsScheduler(false);
  };

  const startEditInstructor = (inst: Instructor) => {
      setEditingInstructorId(inst.id);
      setNewInstName(inst.name);
      setNewInstEmail(inst.email);
      setNewInstType(inst.type);
      setNewInstSeniority(inst.seniority !== undefined ? inst.seniority : '');
      setNewInstIsScheduler(inst.isScheduler || false);
  };

  const cancelEditInstructor = () => {
      setEditingInstructorId(null);
      setNewInstName('');
      setNewInstEmail('');
      setNewInstSeniority('');
      setNewInstType('Full-Time');
      setNewInstIsScheduler(false);
  };

  const removeInstructor = (id: string) => {
      if (confirm('Are you sure you want to remove this faculty member?')) {
        onRemoveInstructor(id);
        if (editingInstructorId === id) cancelEditInstructor();
      }
  };
  
  // Drag and Drop Logic for Instructors
  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedInstructorId(id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedInstructorId || draggedInstructorId === targetId) return;

    // Use sorted list for reordering logic based on rank
    const currentList = [...sortedInstructors];
    
    const dragIndex = currentList.findIndex(i => i.id === draggedInstructorId);
    const targetIndex = currentList.findIndex(i => i.id === targetId);

    if (dragIndex === -1 || targetIndex === -1) return;

    // Reorder
    const item = currentList[dragIndex];
    currentList.splice(dragIndex, 1);
    currentList.splice(targetIndex, 0, item);

    // Update rank/seniority based on new index
    currentList.forEach((inst, index) => {
        const newRank = index + 1;
        if (inst.seniority !== newRank) {
            onUpdateInstructor(inst.id, { seniority: newRank });
        }
    });

    setDraggedInstructorId(null);
  };

  return (
    <div className="w-full p-4">
      <div className="mb-8 flex items-center">
        <Settings className="w-8 h-8 text-gray-700 mr-3" />
        <h1 className="text-3xl font-bold text-gray-800">Department Settings</h1>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        
        {/* Manage Faculty */}
        <div className="bg-white p-6 rounded-lg shadow border border-gray-200 col-span-1 md:col-span-2 lg:col-span-2">
            <h2 className="text-xl font-semibold mb-4 text-blue-900 border-b pb-2 flex items-center justify-between">
                <div className="flex items-center">
                    <UserPlus className="w-5 h-5 mr-2" />
                    Manage Faculty
                </div>
                {editingInstructorId && (
                    <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full font-medium">
                        Editing Mode
                    </span>
                )}
            </h2>
            <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2 mb-4 items-end">
                <div className="w-24">
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Rank #</label>
                    <input 
                        type="number"
                        placeholder="Rank" 
                        value={newInstSeniority}
                        onChange={e => setNewInstSeniority(parseInt(e.target.value) || '')}
                        className="w-full border p-2 rounded text-sm bg-white text-gray-900 placeholder-gray-500"
                    />
                </div>
                <div className="flex-1">
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Name</label>
                    <input 
                        type="text" 
                        placeholder="e.g. Doe, Jane" 
                        value={newInstName}
                        onChange={e => setNewInstName(e.target.value)}
                        className="w-full border p-2 rounded text-sm bg-white text-gray-900 placeholder-gray-500"
                    />
                </div>
                <div className="flex-1">
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Email</label>
                    <input 
                        type="email" 
                        placeholder="Email Address" 
                        value={newInstEmail}
                        onChange={e => setNewInstEmail(e.target.value)}
                        className="w-full border p-2 rounded text-sm bg-white text-gray-900 placeholder-gray-500"
                    />
                </div>
                <div className="w-32">
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Type</label>
                    <select
                        value={newInstType}
                        onChange={e => setNewInstType(e.target.value as 'Full-Time' | 'Part-Time')}
                        className="w-full border p-2 rounded text-sm bg-white text-gray-900"
                    >
                        <option value="Full-Time">Full-Time</option>
                        <option value="Part-Time">Part-Time</option>
                    </select>
                </div>
                 <div className="flex items-center pb-2 px-1">
                    <label className="flex items-center cursor-pointer" title="Designate as Department Scheduler">
                        <input 
                            type="checkbox" 
                            checked={newInstIsScheduler} 
                            onChange={e => setNewInstIsScheduler(e.target.checked)}
                            className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500 border-gray-300" 
                        />
                        <span className="ml-2 text-xs font-medium text-gray-600">Scheduler?</span>
                    </label>
                </div>
                <div className="flex space-x-2">
                    {editingInstructorId && (
                        <button onClick={cancelEditInstructor} className="bg-gray-200 text-gray-700 px-3 py-2 rounded hover:bg-gray-300 font-medium" title="Cancel Edit">
                            <X className="w-5 h-5" />
                        </button>
                    )}
                    <button 
                        onClick={handleSaveInstructor} 
                        className={`${editingInstructorId ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'} text-white px-4 py-2 rounded font-medium flex items-center min-w-[80px] justify-center transition-colors`}
                    >
                        {editingInstructorId ? 'Update' : 'Add'}
                    </button>
                </div>
            </div>
            <div className="h-64 overflow-y-auto border rounded-md border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50 sticky top-0">
                        <tr>
                            <th className="px-2 py-2 w-8"></th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase w-16">Rank</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                            <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {sortedInstructors.map(inst => (
                            <tr 
                                key={inst.id} 
                                className={`${editingInstructorId === inst.id ? 'bg-blue-50' : 'hover:bg-gray-50'} ${draggedInstructorId === inst.id ? 'opacity-50' : ''}`}
                                draggable
                                onDragStart={(e) => handleDragStart(e, inst.id)}
                                onDragOver={handleDragOver}
                                onDrop={(e) => handleDrop(e, inst.id)}
                            >
                                <td className="px-2 py-2 cursor-move text-gray-400">
                                    <GripVertical className="w-4 h-4" />
                                </td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm font-bold text-gray-600">
                                    {inst.seniority ? `#${inst.seniority}` : '-'}
                                </td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                                    {inst.name}
                                    {inst.isScheduler && (
                                        <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-purple-100 text-purple-800" title="Scheduler Role">
                                            <UserCog className="w-3 h-3 mr-1" /> Scheduler
                                        </span>
                                    )}
                                </td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{inst.email}</td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${inst.type === 'Full-Time' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                        {inst.type}
                                    </span>
                                </td>
                                <td className="px-4 py-2 whitespace-nowrap text-right text-sm font-medium">
                                    <div className="flex items-center justify-end space-x-2">
                                        <button 
                                            onClick={() => startEditInstructor(inst)} 
                                            className="text-blue-400 hover:text-blue-600 p-1 rounded hover:bg-blue-100"
                                            title="Edit Faculty"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button 
                                            onClick={() => removeInstructor(inst.id)} 
                                            className="text-red-400 hover:text-red-600 p-1 rounded hover:bg-red-100"
                                            title="Delete Faculty"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>


        {/* Manage Courses */}
        <div className="bg-white p-6 rounded-lg shadow border border-gray-200 col-span-1 md:col-span-2 lg:col-span-1">
          <h2 className="text-xl font-semibold mb-4 text-blue-900 border-b pb-2">Manage Courses</h2>
          <div className="flex space-x-2 mb-4">
            <input 
              type="text" 
              placeholder="Code" 
              value={newCourseCode}
              onChange={e => setNewCourseCode(e.target.value)}
              className="flex-1 w-24 border p-2 rounded text-sm bg-white text-gray-900 placeholder-gray-500"
            />
            <input 
              type="text" 
              placeholder="Title" 
              value={newCourseTitle}
              onChange={e => setNewCourseTitle(e.target.value)}
              className="flex-2 w-full border p-2 rounded text-sm bg-white text-gray-900 placeholder-gray-500"
            />
            <button onClick={addCourse} className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700">
              <Plus className="w-5 h-5" />
            </button>
          </div>
          <div className="h-64 overflow-y-auto space-y-2 pr-2">
            {sortedCourses.map(course => (
              <div key={course.id} className="flex justify-between items-center bg-gray-50 p-2 rounded border border-gray-100">
                <div>
                  <span className="font-bold text-sm text-gray-700">{course.code}</span>
                  <p className="text-xs text-gray-500">{course.title}</p>
                </div>
                <button onClick={() => onRemoveCourse(course.id)} className="text-red-400 hover:text-red-600">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Manage Time Blocks */}
        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <h2 className="text-xl font-semibold mb-4 text-blue-900 border-b pb-2 flex items-center">
              <Clock className="w-5 h-5 mr-2" />
              Manage Time Blocks
          </h2>
          <div className="flex items-center space-x-2 mb-4">
            <div className="flex-1 flex items-center space-x-1">
                <div className="flex-1">
                    <label className="block text-[10px] text-gray-500 uppercase font-bold mb-0.5">Start</label>
                    <input 
                        type="time" 
                        value={newStartTime}
                        onChange={e => setNewStartTime(e.target.value)}
                        className="w-full border p-1.5 rounded text-sm bg-white text-gray-900"
                    />
                </div>
                <div className="flex-1">
                    <label className="block text-[10px] text-gray-500 uppercase font-bold mb-0.5">End</label>
                    <input 
                        type="time" 
                        value={newEndTime}
                        onChange={e => setNewEndTime(e.target.value)}
                        className="w-full border p-1.5 rounded text-sm bg-white text-gray-900"
                    />
                </div>
            </div>
            <button onClick={addTimeBlock} className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700 flex-shrink-0 mt-4">
              <Plus className="w-5 h-5" />
            </button>
          </div>
          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {sortedTimeBlocks.map(tb => (
              <div key={tb} className="flex justify-between items-center bg-gray-50 p-2 rounded border border-gray-100">
                <span className="text-sm text-gray-700">{tb}</span>
                <button onClick={() => onRemoveTimeBlock(tb)} className="text-red-400 hover:text-red-600">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Manage Rooms */}
        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <h2 className="text-xl font-semibold mb-4 text-blue-900 border-b pb-2">Manage Rooms</h2>
          <div className="flex space-x-2 mb-4">
            <input 
              type="text" 
              placeholder="New Room (e.g. CAT 202)" 
              value={newRoom}
              onChange={e => setNewRoom(e.target.value)}
              className="flex-1 border p-2 rounded text-sm bg-white text-gray-900 placeholder-gray-500"
            />
            <button onClick={addRoom} className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700">
              <Plus className="w-5 h-5" />
            </button>
          </div>
          <ul className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {sortedRooms.map(room => (
              <li key={room} className="flex justify-between items-center bg-gray-50 p-2 rounded border border-gray-100 group min-h-[42px]">
                {editingRoom === room ? (
                    <div className="flex items-center flex-1 space-x-2 animate-in fade-in duration-200">
                        <input 
                            type="text" 
                            value={editRoomName} 
                            onChange={e => setEditRoomName(e.target.value)}
                            className="flex-1 border border-blue-300 p-1 rounded text-sm focus:ring-2 focus:ring-blue-200 outline-none"
                            autoFocus
                        />
                        <button onClick={saveEditRoom} className="text-green-600 hover:bg-green-50 p-1 rounded transition-colors" title="Save">
                            <Check className="w-4 h-4" />
                        </button>
                        <button onClick={cancelEditRoom} className="text-red-500 hover:bg-red-50 p-1 rounded transition-colors" title="Cancel">
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                ) : (
                    <>
                        <span className="text-sm text-gray-700 font-medium">{room}</span>
                        <div className="flex items-center space-x-1">
                            <button 
                                onClick={() => startEditRoom(room)} 
                                className="text-blue-400 hover:text-blue-600 p-1 hover:bg-blue-50 rounded transition-colors" 
                                title="Rename and Update Schedule"
                            >
                                <Edit2 className="w-4 h-4" />
                            </button>
                            <button onClick={() => onRemoveRoom(room)} className="text-red-400 hover:text-red-600 p-1 hover:bg-red-50 rounded transition-colors">
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    </>
                )}
              </li>
            ))}
          </ul>
        </div>
        
        {/* Email Settings - kept here as per structure */}
        <div className="bg-white p-6 rounded-lg shadow border border-gray-200 col-span-1 md:col-span-2 lg:col-span-3">
            <h2 className="text-xl font-semibold mb-4 text-blue-900 border-b pb-2 flex items-center">
                <Mail className="w-5 h-5 mr-2" />
                Email Reminder Settings
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <h3 className="font-medium text-gray-700 mb-2">Individual Reminder</h3>
                    <p className="text-xs text-gray-500 mb-2">Used when clicking the mail icon next to a specific faculty member. Use <code>{'{name}'}</code> for the faculty name.</p>
                    <div className="space-y-3">
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 uppercase">Subject</label>
                            <input 
                                type="text" 
                                value={emailSettings.individualSubject} 
                                onChange={e => setEmailSettings({...emailSettings, individualSubject: e.target.value})}
                                className="w-full border p-2 rounded text-sm bg-white text-gray-900"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 uppercase">Body</label>
                            <textarea 
                                rows={6}
                                value={emailSettings.individualBody} 
                                onChange={e => setEmailSettings({...emailSettings, individualBody: e.target.value})}
                                className="w-full border p-2 rounded text-sm bg-white text-gray-900"
                            />
                        </div>
                    </div>
                </div>
                <div>
                    <h3 className="font-medium text-gray-700 mb-2">Bulk Reminder</h3>
                    <p className="text-xs text-gray-500 mb-2">Used for the "Remind All Missing" button. Sent as BCC to multiple recipients.</p>
                    <div className="space-y-3">
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 uppercase">Subject</label>
                            <input 
                                type="text" 
                                value={emailSettings.bulkSubject} 
                                onChange={e => setEmailSettings({...emailSettings, bulkSubject: e.target.value})}
                                className="w-full border p-2 rounded text-sm bg-white text-gray-900"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 uppercase">Body</label>
                            <textarea 
                                rows={6}
                                value={emailSettings.bulkBody} 
                                onChange={e => setEmailSettings({...emailSettings, bulkBody: e.target.value})}
                                className="w-full border p-2 rounded text-sm bg-white text-gray-900"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>

      </div>
    </div>
  );
};

export default AdminSettings;
