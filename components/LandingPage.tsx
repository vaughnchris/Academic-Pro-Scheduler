
import React, { useState } from 'react';
import { Users, ShieldCheck, BookOpen, Calendar, Building, PlusCircle } from 'lucide-react';
import { Department, SchoolConfig } from '../types';

interface Props {
  scheduleTitle: string;
  departments: Department[];
  schoolConfig?: SchoolConfig; // Make optional for type safety if needed, though App will pass it
  onSelectRole: (role: 'admin' | 'faculty', deptId: string) => void;
  onCreateDepartment: (name: string) => void;
}

const LandingPage: React.FC<Props> = ({ scheduleTitle, departments, schoolConfig, onSelectRole, onCreateDepartment }) => {
  const [selectedDept, setSelectedDept] = useState<string>('');
  const [isCreating, setIsCreating] = useState(false);
  const [newDeptName, setNewDeptName] = useState('');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (newDeptName) {
      onCreateDepartment(newDeptName);
      setIsCreating(false);
      setNewDeptName('');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-blue-900 flex flex-col items-center justify-center p-6 text-white font-sans">
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
            <div className="bg-white/10 p-4 rounded-full backdrop-blur-sm">
                <Calendar className="w-12 h-12 text-blue-300" />
            </div>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-2">
          {schoolConfig ? schoolConfig.schoolName : 'AcademicPro Scheduler'}
        </h1>
        <p className="text-xl text-blue-300 font-medium mb-2">{scheduleTitle}</p>
        <p className="text-lg text-blue-200 max-w-2xl mx-auto">
          Department Scheduling System
        </p>
      </div>

      <div className="w-full max-w-md mb-8">
        <label className="block text-sm font-medium text-blue-200 mb-2">Select Your Department</label>
        <div className="relative">
            <Building className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
            <select 
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white/10 border border-blue-400/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-400 appearance-none text-lg"
            >
                <option value="" disabled className="bg-slate-800 text-gray-400">-- Choose Department --</option>
                {departments.map(d => (
                    <option key={d.id} value={d.id} className="bg-slate-800 text-white">{d.name}</option>
                ))}
            </select>
        </div>
        
        {!isCreating && (
             <button 
                onClick={() => setIsCreating(true)}
                className="mt-2 text-sm text-blue-300 hover:text-white flex items-center"
             >
                <PlusCircle className="w-4 h-4 mr-1" /> Create New Department
             </button>
        )}

        {isCreating && (
            <form onSubmit={handleCreate} className="mt-4 bg-white/10 p-4 rounded-lg border border-blue-400/30 animate-in fade-in slide-in-from-top-2">
                <label className="block text-xs uppercase font-bold text-blue-300 mb-1">New Department Name</label>
                <div className="flex gap-2">
                    <input 
                        type="text" 
                        value={newDeptName}
                        onChange={e => setNewDeptName(e.target.value)}
                        placeholder="e.g. Arts & Humanities"
                        className="flex-1 px-3 py-2 rounded bg-slate-800 border border-slate-600 text-white focus:outline-none focus:border-blue-400"
                        autoFocus
                    />
                    <button type="submit" className="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded text-white font-medium">Save</button>
                    <button type="button" onClick={() => setIsCreating(false)} className="text-gray-400 hover:text-white px-2">Cancel</button>
                </div>
            </form>
        )}
      </div>

      {selectedDept && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Faculty Card */}
            <button 
              onClick={() => onSelectRole('faculty', selectedDept)}
              className="group relative bg-white/5 hover:bg-white/10 border border-white/10 hover:border-blue-400 transition-all duration-300 rounded-2xl p-8 text-left flex flex-col h-full"
            >
              <div className="bg-blue-500/20 p-3 rounded-xl w-fit mb-6 group-hover:scale-110 transition-transform">
                <Users className="w-8 h-8 text-blue-300" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Faculty Portal</h2>
              <p className="text-gray-400 text-sm mb-6 flex-1">
                Submit your teaching preferences for <span className="text-white font-semibold">{departments.find(d => d.id === selectedDept)?.name}</span>.
              </p>
              <div className="flex items-center text-blue-300 font-semibold group-hover:translate-x-2 transition-transform">
                Enter Portal &rarr;
              </div>
            </button>

            {/* Admin Card */}
            <button 
              onClick={() => onSelectRole('admin', selectedDept)}
              className="group relative bg-white/5 hover:bg-white/10 border border-white/10 hover:border-emerald-400 transition-all duration-300 rounded-2xl p-8 text-left flex flex-col h-full"
            >
              <div className="bg-emerald-500/20 p-3 rounded-xl w-fit mb-6 group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-8 h-8 text-emerald-300" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Department Schedule Developer</h2>
              <p className="text-gray-400 text-sm mb-6 flex-1">
                Manage master schedule and faculty requests for <span className="text-white font-semibold">{departments.find(d => d.id === selectedDept)?.name}</span>.
              </p>
              <div className="flex items-center text-emerald-300 font-semibold group-hover:translate-x-2 transition-transform">
                Access Dashboard &rarr;
              </div>
            </button>
          </div>
      )}

      <div className="mt-16 text-center text-sm text-gray-400">
        <div>&copy; {new Date().getFullYear()} {schoolConfig ? schoolConfig.schoolName : 'AcademicPro'} Scheduling Systems. All rights reserved.</div>
        {schoolConfig && (
            <div className="mt-1">Technical Support: <a href={`mailto:${schoolConfig.helpContactEmail}`} className="text-blue-400 hover:text-blue-300">{schoolConfig.helpContactEmail}</a> ({schoolConfig.helpContactName})</div>
        )}
      </div>
    </div>
  );
};

export default LandingPage;
