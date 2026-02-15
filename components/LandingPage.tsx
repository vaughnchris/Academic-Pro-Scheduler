
import React, { useState } from 'react';
import { Users, ShieldCheck, BookOpen, Calendar, Building, PlusCircle, Info, ChevronRight } from 'lucide-react';
import { Department, SchoolConfig } from '../types';

interface Props {
  scheduleTitle: string;
  departments: Department[];
  schoolConfig?: SchoolConfig; // Make optional for type safety if needed, though App will pass it
  onSelectRole: (role: 'admin' | 'faculty', deptId: string) => void;
  onCreateDepartment: (name: string) => void;
  onShowProduct?: () => void;
}

const LandingPage: React.FC<Props> = ({ scheduleTitle, departments, schoolConfig, onSelectRole, onCreateDepartment, onShowProduct }) => {
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-blue-900 flex flex-col items-center justify-center p-6 text-white font-sans relative overflow-hidden">
      
      {/* Product Info Link */}
      {onShowProduct && (
        <div className="absolute top-6 right-6 z-10">
          <button 
            onClick={onShowProduct}
            className="flex items-center space-x-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-full text-sm font-medium transition-all border border-white/20 backdrop-blur-sm group"
          >
            <Info className="w-4 h-4 text-blue-300 group-hover:text-blue-200" />
            <span>Product Tour & Features</span>
            <ChevronRight className="w-3 h-3 text-gray-400 group-hover:text-white group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      )}

      <div className="text-center mb-8 relative z-0">
        <div className="flex justify-center mb-4">
            <div className="bg-white/10 p-4 rounded-full backdrop-blur-sm shadow-xl ring-1 ring-white/20">
                <Calendar className="w-12 h-12 text-blue-300" />
            </div>
        </div>
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-3 text-transparent bg-clip-text bg-gradient-to-r from-white to-blue-200">
          {schoolConfig ? schoolConfig.schoolName : 'AcademicPro Scheduler'}
        </h1>
        <p className="text-xl text-blue-300 font-medium mb-2 uppercase tracking-widest text-sm">{scheduleTitle}</p>
        <p className="text-lg text-blue-100 max-w-2xl mx-auto font-light">
          Intelligent Department Scheduling System
        </p>
      </div>

      <div className="w-full max-w-md mb-8 relative z-0">
        <label className="block text-sm font-medium text-blue-200 mb-2 uppercase tracking-wide text-xs">Select Your Department</label>
        <div className="relative group">
            <Building className="absolute left-3 top-3.5 text-blue-300 w-5 h-5 pointer-events-none group-focus-within:text-white transition-colors" />
            <select 
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                className="w-full pl-10 pr-4 py-3.5 bg-slate-800/50 border border-blue-400/30 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-400 appearance-none text-lg shadow-lg hover:bg-slate-800/70 transition-all cursor-pointer"
            >
                <option value="" disabled className="bg-slate-900 text-gray-400">-- Choose Department --</option>
                {departments.map(d => (
                    <option key={d.id} value={d.id} className="bg-slate-900 text-white">{d.name}</option>
                ))}
            </select>
        </div>
        
        {!isCreating && (
             <button 
                onClick={() => setIsCreating(true)}
                className="mt-3 text-sm text-blue-300 hover:text-white flex items-center justify-center w-full hover:bg-white/5 py-1 rounded transition-colors"
             >
                <PlusCircle className="w-4 h-4 mr-1.5" /> Create New Department
             </button>
        )}

        {isCreating && (
            <form onSubmit={handleCreate} className="mt-4 bg-slate-900/80 p-4 rounded-lg border border-blue-400/30 animate-in fade-in slide-in-from-top-2 backdrop-blur-md">
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
                    <button type="submit" className="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded text-white font-medium shadow-lg">Save</button>
                    <button type="button" onClick={() => setIsCreating(false)} className="text-gray-400 hover:text-white px-2">Cancel</button>
                </div>
            </form>
        )}
      </div>

      {selectedDept && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl w-full animate-in fade-in slide-in-from-bottom-4 duration-500 relative z-0">
            {/* Faculty Card */}
            <button 
              onClick={() => onSelectRole('faculty', selectedDept)}
              className="group relative bg-white/5 hover:bg-white/10 border border-white/10 hover:border-blue-400 transition-all duration-300 rounded-2xl p-8 text-left flex flex-col h-full backdrop-blur-sm"
            >
              <div className="bg-blue-500/20 p-3 rounded-xl w-fit mb-6 group-hover:scale-110 transition-transform shadow-inner ring-1 ring-blue-500/30">
                <Users className="w-8 h-8 text-blue-300" />
              </div>
              <h2 className="text-2xl font-bold mb-2 text-white">Faculty Portal</h2>
              <p className="text-blue-100/70 text-sm mb-6 flex-1 leading-relaxed">
                Submit your teaching preferences, define your load, and verify your assignments for <span className="text-white font-semibold">{departments.find(d => d.id === selectedDept)?.name}</span>.
              </p>
              <div className="flex items-center text-blue-300 font-semibold group-hover:translate-x-2 transition-transform">
                Enter Portal <ChevronRight className="w-4 h-4 ml-1" />
              </div>
            </button>

            {/* Admin Card */}
            <button 
              onClick={() => onSelectRole('admin', selectedDept)}
              className="group relative bg-white/5 hover:bg-white/10 border border-white/10 hover:border-emerald-400 transition-all duration-300 rounded-2xl p-8 text-left flex flex-col h-full backdrop-blur-sm"
            >
              <div className="bg-emerald-500/20 p-3 rounded-xl w-fit mb-6 group-hover:scale-110 transition-transform shadow-inner ring-1 ring-emerald-500/30">
                <ShieldCheck className="w-8 h-8 text-emerald-300" />
              </div>
              <h2 className="text-2xl font-bold mb-2 text-white">Schedule Developer</h2>
              <p className="text-blue-100/70 text-sm mb-6 flex-1 leading-relaxed">
                Manage master schedule, assign requests, detect conflicts, and publish schedules for <span className="text-white font-semibold">{departments.find(d => d.id === selectedDept)?.name}</span>.
              </p>
              <div className="flex items-center text-emerald-300 font-semibold group-hover:translate-x-2 transition-transform">
                Access Dashboard <ChevronRight className="w-4 h-4 ml-1" />
              </div>
            </button>
          </div>
      )}

      <div className="mt-16 text-center text-sm text-slate-400/80">
        <div>&copy; {new Date().getFullYear()} {schoolConfig ? schoolConfig.schoolName : 'AcademicPro'} Scheduling Systems. All rights reserved.</div>
        {schoolConfig && (
            <div className="mt-1">Technical Support: <a href={`mailto:${schoolConfig.helpContactEmail}`} className="text-blue-400 hover:text-blue-300 transition-colors">{schoolConfig.helpContactEmail}</a> ({schoolConfig.helpContactName})</div>
        )}
      </div>
    </div>
  );
};

export default LandingPage;
