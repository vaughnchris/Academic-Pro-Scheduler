
import React, { useState } from 'react';
import { FacultyRequest, PreferenceRow, CourseOption, Instructor } from '../types';
import { Send, Info, X, Save, Plus, Trash2 } from 'lucide-react';
import MultiSelect from './MultiSelect';
import { DAYS_OF_WEEK } from '../services/mockData';

interface Props {
  departmentId: string;
  departmentName?: string;
  scheduleTitle: string;
  onSubmit: (request: FacultyRequest) => void;
  availableCourses: CourseOption[];
  availableModalities: string[];
  availableCampuses: string[];
  availableTextbookCosts: string[]; // New prop for dynamic costs
  instructors: Instructor[];
  availableTimes: string[];
  initialValues?: FacultyRequest;
  onCancel?: () => void;
  isAdminMode?: boolean;
}

const createEmptyPreference = (rank: number): PreferenceRow => ({
  rank,
  classTitle: '',
  daysAvailable: [],
  timesAvailable: [],
  campus: '',
  modality: '',
  notes: '',
  sameAsLastYear: false,
  textbookCost: 'Regular Cost'
});

const FacultyForm: React.FC<Props> = ({ 
  departmentId, 
  departmentName = 'Department of Business & Computing',
  scheduleTitle, 
  onSubmit, 
  availableCourses, 
  availableModalities, 
  availableCampuses, 
  availableTextbookCosts,
  instructors, 
  availableTimes,
  initialValues,
  onCancel,
  isAdminMode
}) => {
  const [name, setName] = useState(initialValues?.name || '');
  const [email, setEmail] = useState(initialValues?.email || '');
  const [phone, setPhone] = useState(initialValues?.contactNumber || '');
  const [load, setLoad] = useState<number>(initialValues?.loadDesired || 0);
  
  // Initialize preferences with padding up to 4 rows if needed, or use existing
  const [preferences, setPreferences] = useState<PreferenceRow[]>(() => {
    if (initialValues?.preferences) {
        const existing = initialValues.preferences;
        const padded = [...existing];
        // Fill up to 4 to maintain standard initial form size
        if (padded.length < 4) {
            for (let i = existing.length; i < 4; i++) {
                padded.push(createEmptyPreference(i + 1));
            }
        }
        return padded;
    }
    return Array.from({ length: 4 }, (_, i) => createEmptyPreference(i + 1));
  });

  const [certified, setCertified] = useState<boolean>(initialValues?.certifiedOnline ?? false);
  const [willingness, setWillingness] = useState(initialValues?.willingToTeach || { live: false, online: false, hybrid: false });
  const [instructions, setInstructions] = useState(initialValues?.specialInstructions || '');

  const handleInstructorChange = (selectedName: string) => {
      setName(selectedName);
      const instructor = instructors.find(i => i.name === selectedName);
      if (instructor) {
          setEmail(instructor.email);
      } else {
          setEmail('');
      }
  };

  const handlePreferenceChange = (index: number, field: keyof PreferenceRow, value: any) => {
    const newPrefs = [...preferences];
    newPrefs[index] = { ...newPrefs[index], [field]: value };
    setPreferences(newPrefs);
  };

  const handleAddRow = () => {
      setPreferences(prev => [
          ...prev,
          createEmptyPreference(prev.length + 1)
      ]);
  };

  const handleRemoveRow = (index: number) => {
      const newPrefs = preferences.filter((_, i) => i !== index).map((p, i) => ({
          ...p,
          rank: i + 1
      }));
      setPreferences(newPrefs);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) {
        alert("Please select your name from the list.");
        return;
    }

    const cleanPrefs = preferences.filter(p => p.classTitle.trim() !== '');
    
    const request: FacultyRequest = {
      id: initialValues?.id || crypto.randomUUID(),
      departmentId,
      name,
      email,
      contactNumber: phone,
      loadDesired: load,
      preferences: cleanPrefs,
      certifiedOnline: certified,
      willingToTeach: willingness,
      specialInstructions: instructions,
      submittedAt: initialValues?.submittedAt || new Date().toISOString()
    };
    
    onSubmit(request);
    if (!initialValues && !isAdminMode) {
         alert("Request submitted successfully!");
    }
  };

  return (
    <div className="w-full bg-white p-8 shadow-lg rounded-lg border border-gray-200">
      <div className="flex justify-between items-start mb-8">
        <div className="text-center flex-1">
            <h1 className="text-3xl font-bold text-gray-800">
                {isAdminMode && initialValues ? 'Edit Faculty Request' : isAdminMode ? 'Add New Faculty Request' : 'Faculty Schedule Request'}
            </h1>
            <h2 className="text-xl text-gray-600 mt-2">{departmentName} - {scheduleTitle}</h2>
        </div>
        {onCancel && (
            <button onClick={onCancel} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
            </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Header Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4 bg-gray-50 rounded-lg border border-gray-300">
          <div>
            <label className="block text-sm font-semibold text-gray-700">Faculty Name</label>
            <select 
                required 
                value={name} 
                onChange={e => handleInstructorChange(e.target.value)} 
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
            >
                <option value="">Select your name...</option>
                {instructors.map(inst => (
                    <option key={inst.id} value={inst.name}>{inst.name} ({inst.type})</option>
                ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700">Email</label>
            <input 
                type="text" 
                value={email} 
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border text-gray-500 bg-gray-100 cursor-not-allowed" 
                readOnly
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700">Phone Number</label>
            <input 
                required 
                type="tel" 
                value={phone} 
                onChange={e => setPhone(e.target.value)} 
                placeholder="e.g. 555-0123"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white" 
            />
          </div>
        </div>

        <div>
          <label className="block text-lg font-medium text-gray-800">How many classes would you like to teach this term?</label>
          <input type="number" min="0" value={load} onChange={e => setLoad(parseInt(e.target.value))} className="mt-2 w-32 p-2 border border-gray-300 rounded-md text-gray-900 bg-white" />
        </div>

        {/* Preference Table */}
        <div className="overflow-visible pb-24 overflow-x-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-3 gap-2">
            <p className="text-sm text-gray-600">List the classes you prefer to teach in order of preference.</p>
            {!isAdminMode && (
                <div className="flex items-center text-xs text-blue-700 bg-blue-50 px-3 py-2 rounded-md border border-blue-100">
                    <Info className="w-4 h-4 mr-2 flex-shrink-0" />
                    <span><strong>Tip:</strong> If you wish to teach multiple sections of the same course, please list that course multiple times in separate rows.</span>
                </div>
            )}
          </div>
          <table className="min-w-full divide-y divide-gray-200 border border-gray-300">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12">Rank</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[200px]">Class Title</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[140px]">Days</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[140px]">Times</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Campus</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Modality</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">Text & Supplies</th>
                <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-20" title="Same section, time and room as last year?">Same?</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[150px]">Section Notes</th>
                <th className="px-3 py-2 w-10"></th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {preferences.map((pref, idx) => (
                <tr key={idx}>
                  <td className="px-3 py-2 text-center font-bold text-gray-500 align-top pt-3">{pref.rank}</td>
                  
                  {/* Course Dropdown */}
                  <td className="px-1 py-1 align-top">
                    <select 
                      value={pref.classTitle} 
                      onChange={e => handlePreferenceChange(idx, 'classTitle', e.target.value)}
                      className="w-full p-2 border-gray-200 border rounded text-sm bg-white text-gray-900"
                    >
                      <option value="">Select a Course...</option>
                      {availableCourses.map(c => (
                        <option key={c.id} value={`${c.code} - ${c.title}`}>
                          {c.code} - {c.title}
                        </option>
                      ))}
                    </select>
                  </td>

                  {/* Multi-Select Days */}
                  <td className="px-1 py-1 align-top">
                    <MultiSelect 
                      label="Select Days" 
                      options={DAYS_OF_WEEK} 
                      selected={pref.daysAvailable} 
                      onChange={(selected) => handlePreferenceChange(idx, 'daysAvailable', selected)}
                    />
                  </td>

                  {/* Multi-Select Times */}
                  <td className="px-1 py-1 align-top">
                    <MultiSelect 
                      label="Select Times" 
                      options={availableTimes} 
                      selected={pref.timesAvailable} 
                      onChange={(selected) => handlePreferenceChange(idx, 'timesAvailable', selected)}
                    />
                  </td>

                  {/* Campus Dropdown */}
                  <td className="px-1 py-1 align-top">
                     <select 
                      value={pref.campus} 
                      onChange={e => handlePreferenceChange(idx, 'campus', e.target.value)} 
                      className="w-full p-2 border-gray-200 border rounded text-sm bg-white text-gray-900"
                    >
                      <option value="">Select...</option>
                      {availableCampuses.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </td>

                  {/* Modality Dropdown */}
                  <td className="px-1 py-1 align-top">
                    <select 
                      value={pref.modality} 
                      onChange={e => handlePreferenceChange(idx, 'modality', e.target.value)} 
                      className="w-full p-2 border-gray-200 border rounded text-sm bg-white text-gray-900"
                    >
                       <option value="">Select...</option>
                       {availableModalities.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                  </td>

                  {/* Textbook Cost Dropdown (Dynamic) */}
                  <td className="px-1 py-1 align-top">
                    <select 
                      value={pref.textbookCost} 
                      onChange={e => handlePreferenceChange(idx, 'textbookCost', e.target.value)} 
                      className="w-full p-2 border-gray-200 border rounded text-sm bg-white text-gray-900"
                    >
                       <option value="">Select Cost...</option>
                       {availableTextbookCosts.map(cost => (
                           <option key={cost} value={cost}>{cost}</option>
                       ))}
                       {!availableTextbookCosts.includes(pref.textbookCost) && pref.textbookCost && (
                           <option value={pref.textbookCost}>{pref.textbookCost}</option>
                       )}
                    </select>
                  </td>

                  {/* Same as last year checkbox */}
                  <td className="px-1 py-1 align-top text-center pt-3">
                    <input 
                      type="checkbox"
                      checked={pref.sameAsLastYear}
                      onChange={e => handlePreferenceChange(idx, 'sameAsLastYear', e.target.checked)}
                      className="h-5 w-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                    />
                  </td>

                  {/* Notes Input */}
                  <td className="px-1 py-1 align-top">
                     <input 
                      type="text"
                      value={pref.notes || ''} 
                      onChange={e => handlePreferenceChange(idx, 'notes', e.target.value)} 
                      placeholder="e.g. Specific room..."
                      className="w-full p-2 border-gray-200 border rounded text-sm bg-white text-gray-900"
                    />
                  </td>

                  <td className="px-1 py-1 align-top text-center pt-2">
                      <button 
                        type="button"
                        onClick={() => handleRemoveRow(idx)}
                        className="text-gray-400 hover:text-red-500 p-1 rounded transition-colors"
                        title="Remove row"
                        disabled={preferences.length <= 1}
                      >
                          <Trash2 className="w-4 h-4" />
                      </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          <div className="mt-4">
              <button 
                type="button" 
                onClick={handleAddRow}
                className="flex items-center text-blue-600 hover:text-blue-800 font-medium text-sm transition-colors hover:bg-blue-50 px-3 py-2 rounded-md border border-transparent hover:border-blue-200"
              >
                  <Plus className="w-4 h-4 mr-2" /> Add Another Course Preference
              </button>
          </div>
        </div>

        {/* Certifications & Willingness */}
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-300 space-y-4 text-gray-900">
          <div className="flex items-center space-x-4">
            <span className="font-semibold text-gray-700">Are you certified to teach online?</span>
            <label className="flex items-center space-x-2">
              <input type="radio" checked={certified} onChange={() => setCertified(true)} name="certified" className="h-4 w-4 text-blue-600" /> <span>Yes</span>
            </label>
            <label className="flex items-center space-x-2">
              <input type="radio" checked={!certified} onChange={() => setCertified(false)} name="certified" className="h-4 w-4 text-blue-600" /> <span>No</span>
            </label>
          </div>

          <div>
            <span className="block font-semibold text-gray-700 mb-2">If preferred modality is not available, check willing modalities:</span>
            <div className="flex space-x-6">
              <label className="flex items-center space-x-2">
                <input type="checkbox" checked={willingness.live} onChange={e => setWillingness({...willingness, live: e.target.checked})} className="h-4 w-4 text-blue-600 rounded" />
                <span>Live</span>
              </label>
              <label className="flex items-center space-x-2">
                <input type="checkbox" checked={willingness.online} onChange={e => setWillingness({...willingness, online: e.target.checked})} className="h-4 w-4 text-blue-600 rounded" />
                <span>Online</span>
              </label>
              <label className="flex items-center space-x-2">
                <input type="checkbox" checked={willingness.hybrid} onChange={e => setWillingness({...willingness, hybrid: e.target.checked})} className="h-4 w-4 text-blue-600 rounded" />
                <span>Hybrid</span>
              </label>
            </div>
          </div>
        </div>

        {/* Special Instructions */}
        <div>
          <label className="block text-lg font-medium text-gray-800">Any special instructions and/or requests?</label>
          <textarea 
            rows={4} 
            value={instructions} 
            onChange={e => setInstructions(e.target.value)} 
            className="mt-2 w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
            placeholder="Enter requests here..."
          />
        </div>

        <div className="flex justify-end space-x-3">
          {onCancel && (
              <button type="button" onClick={onCancel} className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition">
                  Cancel
              </button>
          )}
          <button type="submit" className={`flex items-center px-6 py-3 text-white font-medium rounded-lg transition ${isAdminMode ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-700 hover:bg-blue-800'}`}>
            {isAdminMode ? <Save className="w-5 h-5 mr-2" /> : <Send className="w-5 h-5 mr-2" />}
            {isAdminMode ? (initialValues ? 'Update Request' : 'Save Request') : 'Submit Request'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default FacultyForm;
