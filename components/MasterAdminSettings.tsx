
import React from 'react';
import { SchoolConfig } from '../types';
import { ShieldCheck, Save, Building, Calendar, Phone, Mail } from 'lucide-react';

interface Props {
  config: SchoolConfig;
  onUpdate: (newConfig: SchoolConfig) => void;
}

const MasterAdminSettings: React.FC<Props> = ({ config, onUpdate }) => {
  const [formData, setFormData] = React.useState<SchoolConfig>(config);
  const [saved, setSaved] = React.useState(false);

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

  return (
    <div className="max-w-3xl mx-auto p-8">
      <div className="mb-8 flex items-center border-b pb-4">
        <ShieldCheck className="w-10 h-10 text-emerald-600 mr-4" />
        <div>
            <h1 className="text-3xl font-bold text-gray-800">Master Admin Settings</h1>
            <p className="text-gray-500">Configure global settings for the entire institution.</p>
        </div>
      </div>

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
                        className="w-full border p-2 rounded text-gray-900 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        placeholder="e.g. Yosemite Valley University"
                    />
                </div>
            </div>
        </div>

        {/* Schedule Info */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-gray-500" />
                Active Term Configuration
            </h2>
            <div className="grid grid-cols-1 gap-4">
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Current Semester Title</label>
                    <input 
                        type="text" 
                        value={formData.scheduleTitle}
                        onChange={e => handleChange('scheduleTitle', e.target.value)}
                        className="w-full border p-2 rounded text-gray-900 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        placeholder="e.g. Fall 2026"
                    />
                    <p className="text-xs text-gray-500 mt-1">This title propagates to all department dashboards and faculty forms.</p>
                </div>
            </div>
        </div>

        {/* Support Info */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                <Phone className="w-5 h-5 mr-2 text-gray-500" />
                Help & Support Contact
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Contact Name</label>
                    <input 
                        type="text" 
                        value={formData.helpContactName}
                        onChange={e => handleChange('helpContactName', e.target.value)}
                        className="w-full border p-2 rounded text-gray-900 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                </div>
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Contact Email</label>
                    <div className="relative">
                        <Mail className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                        <input 
                            type="email" 
                            value={formData.helpContactEmail}
                            onChange={e => handleChange('helpContactEmail', e.target.value)}
                            className="w-full border p-2 pl-9 rounded text-gray-900 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
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
  );
};

export default MasterAdminSettings;
