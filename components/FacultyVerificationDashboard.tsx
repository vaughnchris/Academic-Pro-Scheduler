
import React, { useState } from 'react';
import { Instructor, ClassSection, SectionStatus } from '../types';
import { Mail, CheckCircle, XCircle, Clock, Eye, Send, AlertTriangle, MessageSquare, X } from 'lucide-react';

interface Props {
  instructors: Instructor[];
  schedule: ClassSection[];
  onUpdateInstructor: (id: string, updates: Partial<Instructor>) => void;
  scheduleTitle: string;
}

const FacultyVerificationDashboard: React.FC<Props> = ({ instructors, schedule, onUpdateInstructor, scheduleTitle }) => {
  const [selectedInstructorId, setSelectedInstructorId] = useState<string | null>(null);

  // Filter out Staff
  const validInstructors = instructors.filter(i => i.name !== 'Staff').sort((a,b) => (a.seniority || 99) - (b.seniority || 99));

  // Calculations
  const getAssignedLoad = (name: string) => schedule.filter(s => 
    s.faculty === name && 
    s.status !== SectionStatus.DELETE &&
    s.status !== SectionStatus.IMPORTED
  ).length;
  
  const selectedInstructor = instructors.find(i => i.id === selectedInstructorId);
  const selectedSchedule = selectedInstructor 
    ? schedule.filter(s => s.faculty === selectedInstructor.name && s.status !== SectionStatus.DELETE && s.status !== SectionStatus.IMPORTED)
    : [];

  const handleSendEmails = () => {
    const pending = validInstructors.filter(i => i.approvalStatus === 'Pending' || i.approvalStatus === 'Sent');
    if (pending.length === 0) {
        alert("No pending instructors to notify.");
        return;
    }
    
    const emails = pending.map(i => i.email).join(',');
    const subject = encodeURIComponent(`Action Required: Review Your ${scheduleTitle} Schedule`);
    const body = encodeURIComponent(`Dear Faculty,\n\nThe draft schedule for ${scheduleTitle} is now available for your review. Please log in to the faculty portal to view your assigned classes and either accept the schedule or provide comments for necessary changes.\n\nThank you.`);
    
    // Update status to 'Sent' for pending
    pending.forEach(i => {
        if(i.approvalStatus === 'Pending') {
            onUpdateInstructor(i.id, { approvalStatus: 'Sent' });
        }
    });

    window.location.href = `mailto:${emails}?subject=${subject}&body=${body}`;
  };

  const getStatusBadge = (status: string) => {
      switch(status) {
          case 'Approved': return <span className="flex items-center text-green-700 bg-green-100 px-2 py-1 rounded text-xs font-bold"><CheckCircle className="w-3 h-3 mr-1"/> Accepted</span>;
          case 'Rejected': return <span className="flex items-center text-red-700 bg-red-100 px-2 py-1 rounded text-xs font-bold"><XCircle className="w-3 h-3 mr-1"/> Rejected</span>;
          case 'Sent': return <span className="flex items-center text-blue-700 bg-blue-100 px-2 py-1 rounded text-xs font-bold"><Mail className="w-3 h-3 mr-1"/> Sent</span>;
          default: return <span className="flex items-center text-gray-600 bg-gray-100 px-2 py-1 rounded text-xs font-bold"><Clock className="w-3 h-3 mr-1"/> Pending</span>;
      }
  };

  return (
    <div className="p-8 h-full flex flex-col">
       <div className="flex justify-between items-center mb-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-800">Schedule Verification</h1>
                <p className="text-gray-500">Track faculty acceptance of the final schedule.</p>
            </div>
            <button 
                onClick={handleSendEmails}
                className="flex items-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded shadow transition-colors"
            >
                <Send className="w-4 h-4 mr-2" />
                Publish / Send Review Emails
            </button>
       </div>

       <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden flex-1 flex flex-col">
            <div className="overflow-y-auto flex-1">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50 sticky top-0">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Faculty</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned Load</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Comments</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {validInstructors.map(inst => (
                            <tr key={inst.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900">{inst.name}</div>
                                    <div className="text-xs text-gray-500">{inst.email}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {inst.type}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center font-bold">
                                    {getAssignedLoad(inst.name)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {getStatusBadge(inst.approvalStatus)}
                                    {inst.approvalDate && (
                                        <div className="text-[10px] text-gray-400 mt-1">
                                            {new Date(inst.approvalDate).toLocaleDateString()}
                                        </div>
                                    )}
                                </td>
                                <td className="px-6 py-4">
                                    {inst.approvalComment ? (
                                        <div className="text-xs text-gray-600 italic bg-yellow-50 p-2 rounded border border-yellow-100 max-w-xs">
                                            "{inst.approvalComment}"
                                        </div>
                                    ) : (
                                        <span className="text-xs text-gray-400">-</span>
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button 
                                        onClick={() => setSelectedInstructorId(inst.id)}
                                        className="text-blue-600 hover:text-blue-900 flex items-center justify-end ml-auto"
                                    >
                                        <Eye className="w-4 h-4 mr-1" /> View Schedule
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
       </div>

       {/* Schedule Viewer Modal */}
       {selectedInstructor && (
           <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
               <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[80vh] flex flex-col">
                   <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50 rounded-t-xl">
                       <div>
                           <h2 className="text-xl font-bold text-gray-800">{selectedInstructor.name} - Assigned Schedule</h2>
                           <p className="text-sm text-gray-500">{getAssignedLoad(selectedInstructor.name)} Sections Assigned</p>
                       </div>
                       <button onClick={() => setSelectedInstructorId(null)} className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-200 rounded-full">
                           <X className="w-5 h-5" />
                       </button>
                   </div>
                   
                   <div className="p-6 overflow-y-auto">
                        {selectedSchedule.length === 0 ? (
                            <div className="text-center py-10 text-gray-500">
                                <AlertTriangle className="w-10 h-10 mx-auto mb-2 text-yellow-400" />
                                No active sections assigned to this instructor.
                            </div>
                        ) : (
                            <table className="min-w-full divide-y divide-gray-200 border border-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-2 text-left text-xs font-bold text-gray-500 uppercase">Course</th>
                                        <th className="px-4 py-2 text-left text-xs font-bold text-gray-500 uppercase">Title</th>
                                        <th className="px-4 py-2 text-left text-xs font-bold text-gray-500 uppercase">Days/Time</th>
                                        <th className="px-4 py-2 text-left text-xs font-bold text-gray-500 uppercase">Room</th>
                                        <th className="px-4 py-2 text-left text-xs font-bold text-gray-500 uppercase">Method</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {selectedSchedule.map(s => (
                                        <tr key={s.id}>
                                            <td className="px-4 py-3 text-sm font-medium text-gray-900">{s.subject} {s.courseNumber}-{s.section}</td>
                                            <td className="px-4 py-3 text-sm text-gray-600">{s.title}</td>
                                            <td className="px-4 py-3 text-sm text-gray-600">
                                                <div className="font-medium">{s.meetingDays}</div>
                                                <div className="text-xs">{s.beginTime} - {s.endTime}</div>
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-600">{s.room}</td>
                                            <td className="px-4 py-3 text-sm text-gray-600">{s.method}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                        
                        {selectedInstructor.approvalStatus === 'Rejected' && (
                            <div className="mt-6 bg-red-50 border border-red-100 p-4 rounded-lg">
                                <h3 className="text-sm font-bold text-red-800 flex items-center mb-2">
                                    <MessageSquare className="w-4 h-4 mr-2" />
                                    Rejection Comments
                                </h3>
                                <p className="text-sm text-red-700 italic">"{selectedInstructor.approvalComment}"</p>
                            </div>
                        )}
                   </div>
                   
                   <div className="p-4 border-t border-gray-100 bg-gray-50 rounded-b-xl text-right">
                       <button onClick={() => setSelectedInstructorId(null)} className="px-4 py-2 bg-white border border-gray-300 rounded text-gray-700 font-medium hover:bg-gray-100">
                           Close
                       </button>
                   </div>
               </div>
           </div>
       )}
    </div>
  );
};

export default FacultyVerificationDashboard;
