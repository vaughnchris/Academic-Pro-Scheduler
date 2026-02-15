
import React, { useState } from 'react';
import { FacultyRequest, ClassSection, PreferenceRow, Instructor, SectionStatus } from '../types';
import { ChevronDown, ChevronRight, GripVertical, CheckCircle2, AlertCircle, Eye, X, User, Phone, RotateCcw, CheckCircle, XCircle, Mail, Layers, ChevronsDown, ChevronsUp, Check } from 'lucide-react';

interface Props {
  requests: FacultyRequest[];
  schedule: ClassSection[];
  instructors: Instructor[];
}

const DraggableFacultyList: React.FC<Props> = ({ requests, schedule, instructors }) => {
  const [openIds, setOpenIds] = useState<Set<string>>(new Set());
  const [viewingRequest, setViewingRequest] = useState<FacultyRequest | null>(null);

  const toggle = (id: string) => {
    const newSet = new Set(openIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setOpenIds(newSet);
  };

  const allOpen = requests.length > 0 && openIds.size === requests.length;

  const toggleAll = () => {
    if (allOpen) {
      setOpenIds(new Set());
    } else {
      setOpenIds(new Set(requests.map(r => r.id)));
    }
  };

  const getAssignedCount = (facultyName: string) => {
    // Count active sections only (exclude Delete and Imported/Unconfirmed)
    // We want the request to remain "draggable" until the user explicitly confirms the assignment (changing status to KEEP/CHANGE)
    return schedule.filter(s => 
        s.faculty === facultyName && 
        s.status !== SectionStatus.DELETE && 
        s.status !== SectionStatus.IMPORTED
    ).length;
  };

  const getPreferenceAssignmentCount = (facultyName: string, preferenceTitle: string) => {
    return schedule.filter(section => {
      // Exclude deleted and imported sections from this count
      if (section.status === SectionStatus.DELETE || section.status === SectionStatus.IMPORTED) return false;
      
      if (section.faculty !== facultyName) return false;
      
      const secTitle = section.title.toLowerCase();
      const prefTitle = preferenceTitle.toLowerCase();
      return secTitle.includes(prefTitle) || prefTitle.includes(secTitle);
    }).length;
  };

  const handleDragStart = (e: React.DragEvent, facultyName: string, preference: PreferenceRow) => {
    const dragData = JSON.stringify({ facultyName, preference });
    e.dataTransfer.setData('faculty-request', dragData);
    e.dataTransfer.effectAllowed = 'copy';
  };

  if (requests.length === 0) {
    return <div className="text-gray-500 text-sm text-center p-4">No requests found.</div>;
  }

  return (
    <>
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm h-full overflow-hidden flex flex-col">
        <div className="p-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
          <div>
            <h2 className="font-bold text-gray-800">Faculty Requests</h2>
            <p className="text-xs text-gray-500">Drag requests to schedule</p>
          </div>
          <button 
            onClick={toggleAll}
            className="p-1.5 hover:bg-gray-200 rounded text-gray-500 hover:text-gray-700 transition-colors"
            title={allOpen ? "Collapse All" : "Expand All"}
          >
            {allOpen ? <ChevronsUp className="w-5 h-5" /> : <ChevronsDown className="w-5 h-5" />}
          </button>
        </div>
        
        <div className="overflow-y-auto flex-1 p-2 space-y-2">
          {requests.map(req => {
            const isOpen = openIds.has(req.id);
            const assignedCount = getAssignedCount(req.name);
            // The logic: disable requests only if full load is met.
            const loadMet = assignedCount >= req.loadDesired;
            
            // Find seniority for display
            const instructor = instructors.find(i => i.name === req.name);

            return (
              <div 
                key={req.id} 
                className={`border rounded-md overflow-hidden transition-all duration-300 ${
                    loadMet 
                    ? 'border-gray-200 bg-gray-100 opacity-75' 
                    : 'border-gray-200 bg-white shadow-sm hover:shadow'
                }`}
              >
                <div 
                    className={`flex items-center justify-between transition-colors ${
                        loadMet 
                            ? 'bg-gray-100 text-gray-500' 
                            : isOpen ? 'bg-gray-50' : 'hover:bg-gray-50'
                    }`}
                >
                    <button 
                        onClick={() => toggle(req.id)}
                        className="flex-1 flex items-center p-3 text-left focus:outline-none"
                    >
                        <div className="flex items-center overflow-hidden w-full">
                            {isOpen ? <ChevronDown className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0" /> : <ChevronRight className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0" />}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                    <div className={`font-semibold text-sm truncate flex items-center ${loadMet ? 'text-gray-500 line-through decoration-gray-400' : 'text-gray-800'}`}>
                                        {req.name}
                                        {instructor?.seniority && (
                                            <span className={`ml-2 text-[10px] px-1.5 py-0.5 rounded-full border font-mono ${loadMet ? 'bg-gray-200 text-gray-500 border-gray-300' : 'bg-gray-100 text-gray-600 border-gray-200'}`} title="Seniority Rank">
                                                #{instructor.seniority}
                                            </span>
                                        )}
                                    </div>
                                    {loadMet && (
                                        <div className="flex items-center text-[10px] font-bold text-green-600 bg-green-100 px-2 py-0.5 rounded-full ml-2">
                                            <Check className="w-3 h-3 mr-1" /> Satisfied
                                        </div>
                                    )}
                                </div>
                                <div className={`text-xs flex items-center space-x-2 ${loadMet ? 'text-gray-400' : 'text-gray-500'}`}>
                                    <span>Load: {assignedCount}/{req.loadDesired}</span>
                                    {loadMet && <CheckCircle2 className="w-3 h-3 text-green-500" />}
                                </div>
                            </div>
                        </div>
                    </button>
                    <button 
                        onClick={(e) => { e.stopPropagation(); setViewingRequest(req); }}
                        className="p-3 text-gray-400 hover:text-blue-600 hover:bg-blue-50 border-l border-gray-100 transition-colors"
                        title="View Full Request"
                    >
                        <Eye className="w-4 h-4" />
                    </button>
                </div>

                {isOpen && (
                  <div className={`p-2 border-t border-gray-200 space-y-2 ${loadMet ? 'bg-gray-100' : 'bg-gray-50'}`}>
                     {req.specialInstructions && (
                         <div className={`text-xs italic p-2 rounded border mb-2 ${loadMet ? 'text-gray-500 bg-gray-200 border-gray-300' : 'text-gray-600 bg-yellow-50 border-yellow-100'}`}>
                             "{req.specialInstructions}"
                         </div>
                     )}
                     
                     {req.preferences.map((pref, idx) => {
                       const assignmentCount = getPreferenceAssignmentCount(req.name, pref.classTitle);
                       // We disable only if the total load is met
                       const isDisabled = loadMet;
                       const isSame = pref.sameAsLastYear;
                       
                       return (
                         <div 
                           key={idx}
                           draggable={!isDisabled}
                           onDragStart={(e) => handleDragStart(e, req.name, pref)}
                           className={`
                             flex items-start p-2 rounded border text-xs relative group transition-colors
                             ${isDisabled 
                               ? 'bg-gray-200 border-gray-300 text-gray-400 cursor-not-allowed' 
                               : isSame 
                                  ? 'bg-green-50 border-green-300 text-green-900 cursor-grab hover:bg-green-100 hover:shadow-sm active:cursor-grabbing'
                                  : 'bg-white border-blue-100 text-gray-700 cursor-grab hover:border-blue-300 hover:shadow-sm active:cursor-grabbing'
                             }
                           `}
                         >
                           <div className="mr-2 mt-0.5 font-bold opacity-70">{pref.rank}.</div>
                           <div className="flex-1">
                             <div className={`font-medium ${isDisabled ? 'line-through' : ''}`}>
                               {pref.classTitle}
                             </div>
                             <div className="mt-1 flex flex-wrap gap-1">
                                  <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] ${isSame && !isDisabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>{pref.modality}</span>
                                  {pref.modality !== 'Online' && pref.daysAvailable.length > 0 && (
                                      <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] ${isSame && !isDisabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>{pref.daysAvailable.join(', ')}</span>
                                  )}
                             </div>
                             {pref.sameAsLastYear && (
                                <div className={`text-[10px] flex items-center mt-1 font-medium ${isDisabled ? 'text-gray-400' : 'text-green-700'}`}>
                                    <RotateCcw className="w-3 h-3 mr-1" /> Keep Same
                                </div>
                             )}
                           </div>
                           
                           {!isDisabled && <GripVertical className="w-4 h-4 text-gray-400 absolute right-1 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100" />}
                           
                           {/* Show check if load met, OR show count if partially assigned but load not met */}
                           {loadMet ? (
                             <CheckCircle2 className="w-4 h-4 text-green-600 absolute right-2 top-2" />
                           ) : assignmentCount > 0 ? (
                             <div className="absolute right-2 top-2 bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded text-[10px] font-bold flex items-center" title={`${assignmentCount} section(s) assigned`}>
                                <Layers className="w-3 h-3 mr-1" /> {assignmentCount}
                             </div>
                           ) : null}
                         </div>
                       );
                     })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {viewingRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[100] flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="bg-blue-900 text-white p-4 flex justify-between items-center sticky top-0 z-10">
                    <h2 className="text-lg font-bold">Faculty Request Details</h2>
                    <button onClick={() => setViewingRequest(null)} className="text-white hover:text-gray-300 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <div className="p-6">
                    <div className="flex flex-col md:flex-row justify-between items-start mb-6 border-b border-gray-100 pb-4">
                        <div>
                            <h3 className="text-2xl font-bold text-gray-800 flex items-center">
                                <User className="w-6 h-6 mr-2 text-blue-600"/>
                                {viewingRequest.name}
                            </h3>
                             <div className="text-sm text-gray-500 mt-1 flex flex-col gap-1">
                                <div className="flex items-center">
                                    <Mail className="w-4 h-4 mr-1"/> {viewingRequest.email || 'N/A'}
                                </div>
                                <div className="flex items-center">
                                    <Phone className="w-4 h-4 mr-1"/> {viewingRequest.contactNumber}
                                </div>
                             </div>
                             <div className="text-xs text-gray-400 mt-1">
                                Submitted: {new Date(viewingRequest.submittedAt).toLocaleDateString()}
                             </div>
                        </div>
                        <div className="text-right mt-4 md:mt-0 bg-blue-50 px-4 py-2 rounded-lg">
                             <div className="text-xs text-blue-500 uppercase font-bold tracking-wider">Desired Load</div>
                             <div className="text-2xl font-bold text-blue-900">{viewingRequest.loadDesired} Classes</div>
                        </div>
                    </div>
                    
                    {/* Qualifications Grid */}
                    <div className="grid grid-cols-2 gap-4 mb-6 bg-gray-50 p-4 rounded-lg text-sm border border-gray-100">
                        <div className="flex items-center justify-between">
                            <span className="text-gray-600">Certified Online</span>
                            {viewingRequest.certifiedOnline ? <CheckCircle className="w-5 h-5 text-green-500" /> : <XCircle className="w-5 h-5 text-red-400" />}
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-gray-600">Willing: Live</span>
                            {viewingRequest.willingToTeach.live ? <CheckCircle className="w-5 h-5 text-green-500" /> : <XCircle className="w-5 h-5 text-gray-300" />}
                        </div>
                         <div className="flex items-center justify-between">
                            <span className="text-gray-600">Willing: Hybrid</span>
                            {viewingRequest.willingToTeach.hybrid ? <CheckCircle className="w-5 h-5 text-green-500" /> : <XCircle className="w-5 h-5 text-gray-300" />}
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-gray-600">Willing: Online</span>
                            {viewingRequest.willingToTeach.online ? <CheckCircle className="w-5 h-5 text-green-500" /> : <XCircle className="w-5 h-5 text-gray-300" />}
                        </div>
                    </div>

                    {/* Special Instructions */}
                    {viewingRequest.specialInstructions && (
                        <div className="mb-6">
                            <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Special Instructions</h4>
                            <p className="bg-yellow-50 border border-yellow-200 p-3 rounded text-gray-800 italic text-sm">
                                "{viewingRequest.specialInstructions}"
                            </p>
                        </div>
                    )}

                    {/* Preferences Table */}
                    <div>
                        <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Class Preferences</h4>
                        <div className="border border-gray-200 rounded-lg overflow-hidden">
                            <table className="min-w-full text-sm">
                                <thead className="bg-gray-100 text-gray-500 text-xs uppercase">
                                    <tr>
                                        <th className="p-3 text-center w-12">Rank</th>
                                        <th className="p-3 text-left">Course Details</th>
                                        <th className="p-3 text-left w-1/3">Notes & Modality</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {viewingRequest.preferences.map(p => (
                                        <tr key={p.rank} className="bg-white">
                                            <td className="p-3 font-bold text-center text-gray-500 align-top">{p.rank}</td>
                                            <td className="p-3 align-top">
                                                <div className="font-semibold text-gray-800">{p.classTitle}</div>
                                                <div className="text-xs text-gray-500 mt-1">
                                                    {p.modality === 'Online' ? (
                                                        <span className="italic">Online</span>
                                                    ) : (
                                                        <>
                                                            {p.daysAvailable.length > 0 && <span className="mr-2">Days: {p.daysAvailable.join(', ')}</span>}
                                                            {p.timesAvailable.length > 0 && <span>Times: {p.timesAvailable.join(', ')}</span>}
                                                        </>
                                                    )}
                                                </div>
                                                <div className="text-xs text-gray-500">Campus: {p.campus}</div>
                                                <div className="text-xs text-gray-500">Textbook: {p.textbookCost}</div>
                                            </td>
                                            <td className="p-3 align-top text-xs">
                                                <div className="font-medium text-gray-700 bg-gray-100 inline-block px-2 py-0.5 rounded mb-1">{p.modality}</div>
                                                {p.sameAsLastYear && (
                                                    <div className="text-blue-600 flex items-center my-1 font-medium">
                                                        <RotateCcw className="w-3 h-3 mr-1"/> Same as last year
                                                    </div>
                                                )}
                                                {p.notes && <div className="italic text-gray-600 mt-1">"{p.notes}"</div>}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
                <div className="p-4 bg-gray-50 border-t flex justify-end">
                    <button onClick={() => setViewingRequest(null)} className="px-5 py-2 bg-gray-200 text-gray-800 rounded font-medium hover:bg-gray-300 transition-colors">
                        Close
                    </button>
                </div>
            </div>
        </div>
      )}
    </>
  );
};

export default DraggableFacultyList;
