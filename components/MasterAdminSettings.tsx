
import React, { useState, useEffect, useMemo } from 'react';
import { SchoolConfig, GlobalOption, Instructor, Department } from '../types';
import { ShieldCheck, Save, Building, Calendar, Phone, Mail, Plus, Trash2, MapPin, Laptop, Send, UserCog, CheckSquare, Square, ChevronDown, ChevronUp, BookOpen, AlertTriangle } from 'lucide-react';

interface Props {
  config: SchoolConfig;
  onUpdate: (newConfig: SchoolConfig) => void;
  
  modalities: GlobalOption[];
  onAddModality: (val: string) => void;
  onRemoveModality: (id: string) => void;

  campuses: GlobalOption[];
  onAddCampus: (val: string) => void;
  onRemoveCampus: (id: string) => void;

  textbookCosts: GlobalOption[];
  onAddTextbookCost: (val: string) => void;
  onRemoveTextbookCost: (id: string) => void;

  departments: Department[];
  allInstructors: Instructor[];
  onUpdateInstructor: (id: string, updates: Partial<Instructor>) => void;
}

const MasterAdminSettings: React.FC<Props> = ({ 
    config, onUpdate, 
    modalities, onAddModality, onRemoveModality,
    campuses, onAddCampus, onRemoveCampus,
    textbookCosts, onAddTextbookCost, onRemoveTextbookCost,
    departments, allInstructors, onUpdateInstructor
}) => {
  const [formData, setFormData] = React.useState<SchoolConfig>(config);
  const [saved, setSaved] = React.useState(false);

  // Local state for new inputs
  const [newModality, setNewModality] = useState('');
  const [newCampus, setNewCampus] = useState('');
  const [newTextbookCost, setNewTextbookCost] = useState('');

  // Scheduler Management State
  const [selectedDeptId, setSelectedDeptId] = useState<string>(departments[0]?.id || '');

  // Email Announcement State
  const [announcementSubject, setAnnouncementSubject] = useState('');
  const [announcementBody, setAnnouncementBody] = useState('');
  const [isEmailCollapsed, setIsEmailCollapsed] = useState(true);

  const filteredInstructors = useMemo(() => {
    return allInstructors.filter(i => i.departmentId === selectedDeptId).sort((a,b) => a.name.localeCompare(b.name));
  }, [allInstructors, selectedDeptId]);

  const allSchedulers = useMemo(() => {
      return allInstructors.filter(i => i.isScheduler);
  }, [allInstructors]);

  // Update default email draft when config changes
  useEffect(() => {
     setAnnouncementSubject(`Action Required: ${formData.scheduleTitle} Scheduling Cycle Open`);
     setAnnouncementBody(`Dear Schedule Developers,\n\nThe system is now configured for the ${formData.scheduleTitle} semester.\n\nPlease log in to AcademicPro, review your department settings, and prepare to receive faculty requests.\n\nThank you,\n${formData.helpContactName}`);
  }, [formData.scheduleTitle, formData.helpContactName]);

  const handleChange = (field: keyof SchoolConfig, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setSaved(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate(formData);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleAddModality = () => {
    if (newModality.trim()) {
        onAddModality(newModality.trim());
        setNewModality('');
    }
  };

  const handleAddCampus = () => {
    if (newCampus.trim()) {
        onAddCampus(newCampus.trim());
        setNewCampus('');
    }
  };

  const handleAddTextbookCost = () => {
      if (newTextbookCost.trim()) {
          onAddTextbookCost(newTextbookCost.trim());
          setNewTextbookCost('');
      }
  };

  const handleSendAnnouncement = () => {
    const recipients = allSchedulers.filter(i => i.email).map(i => i.email);
    
    if (recipients.length === 0) {
        alert("No faculty members have been designated as 'Schedulers' yet.");
        return;
    }

    const bcc = recipients.join(',');
    const subject = encodeURIComponent(announcementSubject);
    const body = encodeURIComponent(announcementBody);
    
    // We use BCC to prevent Reply-All storms and keep addresses private if needed
    window.location.href = `mailto:?bcc=${bcc}&subject=${subject}&body=${body}`;
  };

  const toggleScheduler = (instructor: Instructor) => {
      onUpdateInstructor(instructor.id, { isScheduler: !instructor.isScheduler });
  };

  const handleFactoryReset = () => {
      if (confirm("WARNING: This will delete ALL data (Schedules, Requests, Settings) and reset the application to its initial state. This cannot be undone. Are you sure?")) {
          localStorage.clear();
          window.location.reload();
      }
  };

  return (
    <div className="max-w-4xl mx-auto p-8 pb-24">
      <div className="mb-8 flex items-center border-b pb-4">
        <ShieldCheck className="w-10 h-10 text-emerald-600 mr-4" />
        <div>
            <h1 className="text-3xl font-bold text-gray-800">Master Admin Settings</h1>
            <p className="text-gray-500">Configure global settings and lists for the entire institution.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          <div className="col-span-1 md:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* School Info */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                        <Building className="w-5 h-5 mr-2 text-gray-500" />
                        Institution Details
                    </h2>
                    <div className="grid grid-cols-1 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">School Name</label>
                            <input 
                                type="text" 
                                value={formData.schoolName}
                                onChange={e => handleChange('schoolName', e.target.value)}
                                className="w-full border p-2 rounded text-gray-900 bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                placeholder="e.g. Yosemite Valley University"
                            />
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Schedule Info */}
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                        <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                            <Calendar className="w-5 h-5 mr-2 text-gray-500" />
                            Active Term
                        </h2>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Current Semester Title</label>
                            <input 
                                type="text" 
                                value={formData.scheduleTitle}
                                onChange={e => handleChange('scheduleTitle', e.target.value)}
                                className="w-full border p-2 rounded text-gray-900 bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                placeholder="e.g. Fall 2026"
                            />
                        </div>
                    </div>

                    {/* Support Info */}
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                        <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                            <Phone className="w-5 h-5 mr-2 text-gray-500" />
                            Help Contact
                        </h2>
                        <div className="space-y-3">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Name</label>
                                <input 
                                    type="text" 
                                    value={formData.helpContactName}
                                    onChange={e => handleChange('helpContactName', e.target.value)}
                                    className="w-full border p-2 rounded text-gray-900 bg-white"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
                                <input 
                                    type="email" 
                                    value={formData.helpContactEmail}
                                    onChange={e => handleChange('helpContactEmail', e.target.value)}
                                    className="w-full border p-2 rounded text-gray-900 bg-white"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-end space-x-4">
                    {saved && (
                        <span className="text-emerald-600 font-medium flex items-center animate-in fade-in">
                            <Save className="w-4 h-4 mr-1" /> Settings Saved!
                        </span>
                    )}
                    <button 
                        type="submit"
                        className="bg-emerald-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-emerald-700 transition-colors shadow-sm"
                    >
                        Save Global Configuration
                    </button>
                </div>
            </form>
          </div>

          {/* Manage Schedule Developers */}
          <div className="col-span-1 md:col-span-2 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
             <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                 <div>
                    <h2 className="text-lg font-bold text-gray-800 flex items-center">
                        <UserCog className="w-5 h-5 mr-2 text-purple-600" />
                        Manage Schedule Developers
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">Assign faculty who are responsible for building the schedule in each department.</p>
                 </div>
                 <select 
                    value={selectedDeptId} 
                    onChange={e => setSelectedDeptId(e.target.value)}
                    className="mt-4 md:mt-0 p-2 border border-gray-300 rounded text-sm bg-white text-gray-900 min-w-[200px]"
                 >
                    {departments.map(d => (
                        <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                 </select>
             </div>
             
             <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-md">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Faculty Name</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Is Scheduler?</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filteredInstructors.length > 0 ? (
                            filteredInstructors.map(inst => (
                                <tr key={inst.id} className="hover:bg-gray-50">
                                    <td className="px-4 py-2 text-sm text-gray-900 font-medium">{inst.name}</td>
                                    <td className="px-4 py-2 text-sm text-gray-500">{inst.email}</td>
                                    <td className="px-4 py-2 text-center">
                                        <button 
                                            onClick={() => toggleScheduler(inst)}
                                            className="focus:outline-none"
                                        >
                                            {inst.isScheduler ? (
                                                <div className="flex items-center justify-center text-purple-600 font-bold text-xs bg-purple-100 px-2 py-1 rounded-full border border-purple-200">
                                                    <CheckSquare className="w-4 h-4 mr-1" /> Yes
                                                </div>
                                            ) : (
                                                <Square className="w-5 h-5 text-gray-300 mx-auto hover:text-gray-400" />
                                            )}
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={3} className="px-4 py-6 text-center text-gray-500 italic">No faculty found in this department.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
             </div>
          </div>

          {/* Announcement Section (Collapsible) */}
          <div className="col-span-1 md:col-span-2 bg-indigo-50 rounded-lg shadow-sm border border-indigo-100 overflow-hidden">
            <button 
                onClick={() => setIsEmailCollapsed(!isEmailCollapsed)}
                className="w-full flex justify-between items-center p-6 text-left hover:bg-indigo-100/50 transition-colors focus:outline-none"
            >
                <div>
                    <h2 className="text-lg font-bold text-indigo-900 flex items-center">
                        <Send className="w-5 h-5 mr-2 text-indigo-600" />
                        Notify Schedule Builders
                    </h2>
                    <p className="text-sm text-indigo-700 mt-1">
                        Send a broadcast email to {allSchedulers.length} designated Schedule Developers.
                    </p>
                </div>
                {isEmailCollapsed ? <ChevronDown className="w-5 h-5 text-indigo-400" /> : <ChevronUp className="w-5 h-5 text-indigo-400" />}
            </button>
            
            {!isEmailCollapsed && (
                <div className="p-6 pt-0 animate-in slide-in-from-top-2 border-t border-indigo-200/50 mt-2">
                     <p className="text-sm text-gray-600 mb-4 pt-4">
                        Use this form to draft an email announcing the start of the <strong>{formData.scheduleTitle}</strong> cycle.
                    </p>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-indigo-600 uppercase mb-1">Subject Line</label>
                            <input 
                                type="text" 
                                value={announcementSubject}
                                onChange={e => setAnnouncementSubject(e.target.value)}
                                className="w-full border border-indigo-200 p-2 rounded text-gray-900 bg-white focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-indigo-600 uppercase mb-1">Message Body</label>
                            <textarea 
                                rows={5}
                                value={announcementBody}
                                onChange={e => setAnnouncementBody(e.target.value)}
                                className="w-full border border-indigo-200 p-2 rounded text-gray-900 bg-white focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                        <div className="flex justify-end">
                            <button 
                                onClick={handleSendAnnouncement}
                                className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-indigo-700 transition-colors flex items-center shadow-sm"
                            >
                                <Mail className="w-4 h-4 mr-2" />
                                Open Email Client ({allSchedulers.length} recipients)
                            </button>
                        </div>
                    </div>
                </div>
            )}
          </div>

          {/* Global Modalities */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                <Laptop className="w-5 h-5 mr-2 text-blue-500" />
                Global Modalities
            </h2>
            <div className="flex space-x-2 mb-4">
                <input 
                    type="text" 
                    placeholder="New Modality (e.g. Online)" 
                    value={newModality}
                    onChange={e => setNewModality(e.target.value)}
                    className="flex-1 border p-2 rounded text-sm bg-white text-gray-900"
                />
                <button onClick={handleAddModality} className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700">
                    <Plus className="w-5 h-5" />
                </button>
            </div>
            <ul className="space-y-2 max-h-60 overflow-y-auto">
                {modalities.map(mod => (
                    <li key={mod.id} className="flex justify-between items-center bg-gray-50 p-2 rounded border border-gray-100">
                        <span className="text-sm text-gray-700">{mod.value}</span>
                        <button onClick={() => onRemoveModality(mod.id)} className="text-red-400 hover:text-red-600">
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </li>
                ))}
                {modalities.length === 0 && <li className="text-gray-400 text-sm italic p-2">No modalities defined.</li>}
            </ul>
          </div>

          {/* Global Campuses */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                <MapPin className="w-5 h-5 mr-2 text-red-500" />
                Global Campuses
            </h2>
            <div className="flex space-x-2 mb-4">
                <input 
                    type="text" 
                    placeholder="New Campus (e.g. Main Campus)" 
                    value={newCampus}
                    onChange={e => setNewCampus(e.target.value)}
                    className="flex-1 border p-2 rounded text-sm bg-white text-gray-900"
                />
                <button onClick={handleAddCampus} className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700">
                    <Plus className="w-5 h-5" />
                </button>
            </div>
            <ul className="space-y-2 max-h-60 overflow-y-auto">
                {campuses.map(camp => (
                    <li key={camp.id} className="flex justify-between items-center bg-gray-50 p-2 rounded border border-gray-100">
                        <span className="text-sm text-gray-700">{camp.value}</span>
                        <button onClick={() => onRemoveCampus(camp.id)} className="text-red-400 hover:text-red-600">
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </li>
                ))}
                 {campuses.length === 0 && <li className="text-gray-400 text-sm italic p-2">No campuses defined.</li>}
            </ul>
          </div>
          
          {/* Global Text & Supplies Cost */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 md:col-span-2">
            <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                <BookOpen className="w-5 h-5 mr-2 text-green-600" />
                Text & Supplies Cost Types
            </h2>
            <div className="flex space-x-2 mb-4">
                <input 
                    type="text" 
                    placeholder="New Cost Type (e.g. OER - Zero Cost)" 
                    value={newTextbookCost}
                    onChange={e => setNewTextbookCost(e.target.value)}
                    className="flex-1 border p-2 rounded text-sm bg-white text-gray-900"
                />
                <button onClick={handleAddTextbookCost} className="bg-green-600 text-white p-2 rounded hover:bg-green-700">
                    <Plus className="w-5 h-5" />
                </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {textbookCosts.map(cost => (
                    <div key={cost.id} className="flex justify-between items-center bg-gray-50 p-2 rounded border border-gray-100">
                        <span className="text-sm text-gray-700">{cost.value}</span>
                        <button onClick={() => onRemoveTextbookCost(cost.id)} className="text-red-400 hover:text-red-600">
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                ))}
                 {textbookCosts.length === 0 && <div className="text-gray-400 text-sm italic p-2 col-span-3">No cost types defined.</div>}
            </div>
          </div>

          {/* Danger Zone */}
          <div className="bg-red-50 p-6 rounded-lg shadow-sm border border-red-200 md:col-span-2 mt-8">
              <h2 className="text-lg font-bold text-red-800 mb-2 flex items-center">
                  <AlertTriangle className="w-5 h-5 mr-2" />
                  Danger Zone
              </h2>
              <p className="text-sm text-red-700 mb-4">
                  Resetting the application will clear all schedules, faculty requests, and custom settings stored in your browser. 
                  This action cannot be undone.
              </p>
              <button 
                onClick={handleFactoryReset}
                className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition-colors"
              >
                  Factory Reset (Clear All Data)
              </button>
          </div>

      </div>
    </div>
  );
};

export default MasterAdminSettings;
