
import React, { useState } from 'react';
import { Instructor, ClassSection, SectionStatus } from '../types';
import { CheckCircle, XCircle, Calendar, MessageSquare, AlertTriangle, Printer, Download } from 'lucide-react';

interface Props {
  instructor: Instructor;
  schedule: ClassSection[];
  scheduleTitle: string;
  onUpdateInstructor: (id: string, updates: Partial<Instructor>) => void;
}

const FacultyScheduleView: React.FC<Props> = ({ instructor, schedule, scheduleTitle, onUpdateInstructor }) => {
  const [comments, setComments] = useState('');
  const [isRejecting, setIsRejecting] = useState(false);

  // Filter sections for this instructor
  const mySections = schedule.filter(s => s.faculty === instructor.name && s.status !== SectionStatus.DELETE);
  const totalLoad = mySections.length;

  const handleAccept = () => {
    if (confirm("Are you sure you want to accept this schedule?")) {
        onUpdateInstructor(instructor.id, {
            approvalStatus: 'Approved',
            approvalDate: new Date().toISOString(),
            approvalComment: ''
        });
    }
  };

  const handleRejectSubmit = () => {
    if (!comments.trim()) {
        alert("Please provide a reason for not accepting the schedule.");
        return;
    }
    onUpdateInstructor(instructor.id, {
        approvalStatus: 'Rejected',
        approvalDate: new Date().toISOString(),
        approvalComment: comments
    });
    setIsRejecting(false);
  };

  const getStatusBanner = () => {
      switch(instructor.approvalStatus) {
          case 'Approved':
              return (
                  <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6 rounded shadow-sm flex items-start">
                      <CheckCircle className="w-6 h-6 mr-3 flex-shrink-0" />
                      <div>
                          <p className="font-bold">Schedule Accepted</p>
                          <p className="text-sm">You accepted this schedule on {new Date(instructor.approvalDate!).toLocaleDateString()}. No further action is required.</p>
                      </div>
                  </div>
              );
          case 'Rejected':
              return (
                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded shadow-sm flex items-start">
                    <XCircle className="w-6 h-6 mr-3 flex-shrink-0" />
                    <div>
                        <p className="font-bold">Schedule Rejected</p>
                        <p className="text-sm mb-1">You requested changes on {new Date(instructor.approvalDate!).toLocaleDateString()}. The department will review your comments.</p>
                        <p className="text-xs italic bg-white/50 p-2 rounded">"{instructor.approvalComment}"</p>
                        <button onClick={() => setIsRejecting(true)} className="text-xs underline mt-2 hover:text-red-900">Edit Comment</button>
                    </div>
                </div>
              );
          default:
              return (
                <div className="bg-blue-50 border-l-4 border-blue-500 text-blue-700 p-4 mb-6 rounded shadow-sm flex items-start">
                    <AlertTriangle className="w-6 h-6 mr-3 flex-shrink-0" />
                    <div>
                        <p className="font-bold">Action Required</p>
                        <p className="text-sm">Please review your assigned courses below. Acceptance implies you are committed to teaching these sections at the listed times.</p>
                    </div>
                </div>
              );
      }
  };

  return (
    <div className="max-w-5xl mx-auto p-6 md:p-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-1">My Schedule</h1>
            <p className="text-gray-500 font-medium">{scheduleTitle} Semester</p>
        </div>
        <div className="flex space-x-3 mt-4 md:mt-0">
             <button onClick={() => window.print()} className="flex items-center text-gray-600 bg-white border border-gray-300 hover:bg-gray-50 px-3 py-2 rounded text-sm font-medium transition">
                 <Printer className="w-4 h-4 mr-2" /> Print
             </button>
        </div>
      </div>

      {getStatusBanner()}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-8">
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="font-bold text-gray-700 flex items-center">
                  <Calendar className="w-5 h-5 mr-2 text-blue-600" />
                  Assigned Sections
              </h2>
              <span className="bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1 rounded-full">Total Load: {totalLoad}</span>
          </div>
          
          {mySections.length > 0 ? (
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-white">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Section</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Title</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Days & Time</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Room</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Method</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {mySections.map((s, idx) => (
                            <tr key={s.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                                    {s.subject} {s.courseNumber}-{s.section}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-900">
                                    {s.title}
                                    {s.notes && <div className="text-xs text-gray-500 italic mt-1">{s.notes}</div>}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-700">
                                    <div className="font-semibold">{s.meetingDays || 'TBA'}</div>
                                    <div>{s.beginTime} - {s.endTime}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                    {s.room}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                        {s.method}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
          ) : (
            <div className="p-10 text-center text-gray-500">
                You have no assigned sections for this semester yet.
            </div>
          )}
      </div>

      {/* Action Buttons (Only show if not approved) */}
      {instructor.approvalStatus !== 'Approved' && !isRejecting && (
          <div className="flex flex-col sm:flex-row gap-4 justify-end">
              <button 
                onClick={() => setIsRejecting(true)}
                className="px-6 py-3 bg-white border border-red-200 text-red-600 font-semibold rounded-lg hover:bg-red-50 transition shadow-sm"
              >
                 Request Changes / Reject
              </button>
              <button 
                onClick={handleAccept}
                className="px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition shadow-lg flex items-center justify-center"
              >
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Accept Schedule
              </button>
          </div>
      )}

      {/* Rejection Form */}
      {isRejecting && (
          <div className="bg-white p-6 rounded-xl border border-red-200 shadow-lg animate-in fade-in slide-in-from-bottom-4">
              <h3 className="text-lg font-bold text-gray-800 mb-2">Request Changes</h3>
              <p className="text-sm text-gray-600 mb-4">Please explain why you cannot accept this schedule. Be specific about conflicts or errors.</p>
              <textarea 
                  value={comments}
                  onChange={e => setComments(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-red-500 outline-none mb-4 min-h-[120px]"
                  placeholder="e.g., I have a conflict on Tuesdays at 2pm..."
              />
              <div className="flex justify-end gap-3">
                  <button onClick={() => setIsRejecting(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">Cancel</button>
                  <button onClick={handleRejectSubmit} className="px-6 py-2 bg-red-600 text-white font-bold rounded hover:bg-red-700">Submit Rejection</button>
              </div>
          </div>
      )}

    </div>
  );
};

export default FacultyScheduleView;
