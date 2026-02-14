
import React, { useState } from 'react';
import { SchoolConfig, GlobalOption } from '../types';
import { ShieldCheck, Save, Building, Calendar, Phone, Mail, Plus, Trash2, MapPin, Laptop } from 'lucide-react';

interface Props {
  config: SchoolConfig;
  onUpdate: (newConfig: SchoolConfig) => void;
  
  modalities: GlobalOption[];
  onAddModality: (val: string) => void;
  onRemoveModality: (id: string) => void;

  campuses: GlobalOption[];
  onAddCampus: (val: string) => void;
  onRemoveCampus: (id: string) => void;
}

const MasterAdminSettings: React.FC<Props> = ({ 
    config, onUpdate, 
    modalities, onAddModality, onRemoveModality,
    campuses, onAddCampus, onRemoveCampus
}) => {
  const [formData, setFormData] = React.useState<SchoolConfig>(config);
  const [saved, setSaved] = React.useState(false);

  // Local state for new inputs
  const [newModality, setNewModality] = useState('');
  const [newCampus, setNewCampus] = useState('');

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

  return (
    <div className="max-w-4xl mx-auto p-8">
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

      </div>
    </div>
  );
};

export default MasterAdminSettings;
