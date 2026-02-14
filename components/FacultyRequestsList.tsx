
import React from 'react';
import { FacultyRequest } from '../types';
import { User, Phone, CheckCircle, XCircle, RotateCcw, Mail } from 'lucide-react';

interface Props {
  requests: FacultyRequest[];
}

const FacultyRequestsList: React.FC<Props> = ({ requests }) => {
  if (requests.length === 0) {
    return (
      <div className="p-12 text-center text-gray-500 flex flex-col items-center justify-center h-full">
        <User className="w-16 h-16 mb-4 text-gray-300" />
        <h2 className="text-xl font-semibold">No Requests Found</h2>
        <p>Faculty requests submitted via the form will appear here.</p>
      </div>
    );
  }

  return (
    <div className="w-full p-8 space-y-6">
        <div className="flex justify-between items-end mb-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-800">Submitted Requests</h1>
                <p className="text-gray-500">Review preferences submitted by faculty members.</p>
            </div>
            <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full font-bold text-sm">
                Total: {requests.length}
            </div>
        </div>
        
        {requests.map((req) => (
            <div key={req.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                <div className="bg-gray-50 p-4 border-b border-gray-200 flex flex-col md:flex-row justify-between md:items-center gap-4">
                    <div>
                        <div className="flex items-center">
                            <User className="w-5 h-5 text-blue-600 mr-2" />
                            <h2 className="text-xl font-bold text-gray-800">{req.name}</h2>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center text-gray-600 mt-1 text-sm gap-2 sm:gap-4">
                             <div className="flex items-center">
                                <Mail className="w-4 h-4 mr-1 text-gray-400" />
                                {req.email || 'N/A'}
                             </div>
                             <div className="hidden sm:block text-gray-300">|</div>
                             <div className="flex items-center">
                                <Phone className="w-4 h-4 mr-1 text-gray-400" />
                                {req.contactNumber}
                             </div>
                             <div className="hidden sm:block text-gray-300">|</div>
                             <span className="text-xs">Submitted: {new Date(req.submittedAt).toLocaleDateString()}</span>
                        </div>
                    </div>
                    <div className="flex items-center space-x-4">
                         <div className="flex flex-col items-end">
                            <span className="text-xs text-gray-500 uppercase font-semibold">Desired Load</span>
                            <span className="text-lg font-bold text-gray-800">{req.loadDesired} Classes</span>
                         </div>
                    </div>
                </div>

                <div className="p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                        <div className="lg:col-span-1 space-y-4">
                            <div>
                                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Qualifications & Willingness</h3>
                                <ul className="text-sm text-gray-700 space-y-2">
                                    <li className="flex items-center justify-between border-b border-gray-100 pb-1">
                                        <span>Certified Online</span>
                                        {req.certifiedOnline ? <CheckCircle className="w-4 h-4 text-green-500" /> : <XCircle className="w-4 h-4 text-red-400" />}
                                    </li>
                                    <li className="flex items-center justify-between border-b border-gray-100 pb-1">
                                        <span>Willing: Live</span>
                                        {req.willingToTeach.live ? <CheckCircle className="w-4 h-4 text-green-500" /> : <XCircle className="w-4 h-4 text-gray-300" />}
                                    </li>
                                    <li className="flex items-center justify-between border-b border-gray-100 pb-1">
                                        <span>Willing: Hybrid</span>
                                        {req.willingToTeach.hybrid ? <CheckCircle className="w-4 h-4 text-green-500" /> : <XCircle className="w-4 h-4 text-gray-300" />}
                                    </li>
                                    <li className="flex items-center justify-between border-b border-gray-100 pb-1">
                                        <span>Willing: Online</span>
                                        {req.willingToTeach.online ? <CheckCircle className="w-4 h-4 text-green-500" /> : <XCircle className="w-4 h-4 text-gray-300" />}
                                    </li>
                                </ul>
                            </div>
                            
                            {req.specialInstructions && (
                                <div>
                                    <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Notes</h3>
                                    <p className="text-sm text-gray-600 bg-yellow-50 p-3 rounded border border-yellow-100 italic">
                                        "{req.specialInstructions}"
                                    </p>
                                </div>
                            )}
                        </div>

                        <div className="lg:col-span-2">
                             <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Course Preferences</h3>
                             <div className="overflow-x-auto border border-gray-200 rounded-lg">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Rank</th>
                                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Course</th>
                                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Days</th>
                                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Times</th>
                                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Campus</th>
                                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Textbook</th>
                                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Info</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {req.preferences.map((pref, idx) => (
                                            <tr key={idx} className="hover:bg-gray-50">
                                                <td className="px-3 py-2 text-sm font-bold text-gray-500 text-center">{pref.rank}</td>
                                                <td className="px-3 py-2 text-sm text-gray-900 font-medium">{pref.classTitle}</td>
                                                <td className="px-3 py-2 text-xs text-gray-600">{pref.daysAvailable.join(', ') || 'Any'}</td>
                                                <td className="px-3 py-2 text-xs text-gray-600">{pref.timesAvailable.join(', ') || 'Any'}</td>
                                                <td className="px-3 py-2 text-xs text-gray-600">{pref.campus || 'Any'}</td>
                                                <td className="px-3 py-2 text-xs text-gray-600">{pref.textbookCost}</td>
                                                <td className="px-3 py-2 text-xs text-gray-600">
                                                  <div className="flex flex-col space-y-1">
                                                    <span className="font-medium">{pref.modality}</span>
                                                    {pref.sameAsLastYear && (
                                                      <span className="flex items-center text-blue-600" title="Same section, time, room as last year">
                                                        <RotateCcw className="w-3 h-3 mr-1" /> Same
                                                      </span>
                                                    )}
                                                    {pref.notes && <span className="italic text-gray-500">"{pref.notes}"</span>}
                                                  </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        ))}
    </div>
  );
};

export default FacultyRequestsList;
