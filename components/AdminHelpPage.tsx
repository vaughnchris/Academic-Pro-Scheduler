
import React from 'react';
import { HelpCircle, Upload, Users, CheckSquare, Settings, Shield } from 'lucide-react';

const AdminHelpPage: React.FC = () => {
  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-8 flex items-center border-b pb-4">
        <HelpCircle className="w-10 h-10 text-blue-600 mr-4" />
        <div>
            <h1 className="text-3xl font-bold text-gray-800">Administrator Help & Documentation</h1>
            <p className="text-gray-500">Guide to using the AcademicPro Scheduler</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Getting Started */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <Upload className="w-5 h-5 mr-2 text-blue-500" />
                Getting Started (Import)
            </h2>
            <p className="text-gray-600 text-sm mb-3">
                Start by importing the previous year's schedule CSV. This creates your "template" for the current semester.
            </p>
            <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
                <li>Go to <strong>Master Schedule</strong>.</li>
                <li>Click the <strong>Import</strong> button.</li>
                <li>Select your CSV file. Faculty names are preserved to allow for "Same as Last Year" matching.</li>
                <li>Imported sections appear in <span className="text-gray-500 italic">Gray/Italic</span> until they are confirmed or edited.</li>
            </ul>
        </div>

        {/* Faculty Requests */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <Users className="w-5 h-5 mr-2 text-green-500" />
                Managing Requests
            </h2>
            <p className="text-gray-600 text-sm mb-3">
                Faculty submit requests via the Faculty Portal. You can view these on the dashboard sidebar or the dedicated list view.
            </p>
            <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
                <li><strong>Drag & Drop:</strong> In the Dashboard, drag a request from the right sidebar onto a schedule slot to assign it.</li>
                <li><strong>Auto-Assign:</strong> Toggle "Auto-Assign" to let the system match requests to existing sections based on course titles and preferences.</li>
                <li><strong>Load Tracking:</strong> The sidebar shows how many classes have been assigned vs. desired load.</li>
            </ul>
        </div>

        {/* Verification */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <CheckSquare className="w-5 h-5 mr-2 text-purple-500" />
                Schedule Verification
            </h2>
            <p className="text-gray-600 text-sm mb-3">
                Once the schedule is drafted, you need faculty to sign off on their assignments.
            </p>
            <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
                <li>Go to the <strong>Verification</strong> tab.</li>
                <li>Click "Publish / Send Review Emails" to notify faculty.</li>
                <li>Faculty log in, view their specific schedule, and Accept or Reject with comments.</li>
                <li>You can track approval status (Approved/Rejected) in real-time.</li>
            </ul>
        </div>

        {/* Settings */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <Settings className="w-5 h-5 mr-2 text-orange-500" />
                Settings & Configuration
            </h2>
            <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
                <li><strong>Master Admin:</strong> Set the School Name, Semester Title (e.g., Spring 2027), and Help Contact info globaly.</li>
                <li><strong>Admin Settings:</strong> Manage Courses, Rooms, Time Blocks, and Faculty lists specific to your department.</li>
                <li><strong>Instructors:</strong> You can drag-and-drop instructors in the settings table to change their seniority rank.</li>
            </ul>
        </div>

      </div>

      <div className="mt-8 bg-blue-50 p-6 rounded-lg border border-blue-100">
          <h3 className="font-bold text-blue-900 mb-2 flex items-center">
              <Shield className="w-5 h-5 mr-2" />
              Support & Contact
          </h3>
          <p className="text-sm text-blue-800">
              If you encounter technical issues or need to reset the system, please contact the Master Admin listed in the settings.
          </p>
      </div>
    </div>
  );
};

export default AdminHelpPage;
