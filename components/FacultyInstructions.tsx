
import React from 'react';
import { ArrowRight, CheckCircle2, Clock, Calendar, FileText } from 'lucide-react';

interface Props {
  scheduleTitle: string;
  onStart: () => void;
  onBack: () => void;
}

const FacultyInstructions: React.FC<Props> = ({ scheduleTitle, onStart, onBack }) => {
  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="mb-8">
        <button onClick={onBack} className="text-sm text-gray-500 hover:text-blue-600 mb-4">&larr; Back to Home</button>
        <h1 className="text-3xl font-bold text-gray-900">Faculty Request Instructions</h1>
        <p className="text-gray-600 mt-2 text-lg">Please review the following guidelines before submitting your schedule request for {scheduleTitle}.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center mb-4 text-blue-700">
                <FileText className="w-6 h-6 mr-2" />
                <h2 className="font-bold text-lg">1. Identify Yourself</h2>
            </div>
            <p className="text-gray-600 text-sm">
                Select your name from the faculty dropdown list. Your email will populate automatically. Please verify and enter a valid contact phone number where you can be reached regarding schedule changes.
            </p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center mb-4 text-blue-700">
                <Clock className="w-6 h-6 mr-2" />
                <h2 className="font-bold text-lg">2. Define Your Load</h2>
            </div>
            <p className="text-gray-600 text-sm">
                Indicate the total number of class sections you wish to teach this semester. This helps us balance the department's needs with your availability.
            </p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center mb-4 text-blue-700">
                <Calendar className="w-6 h-6 mr-2" />
                <h2 className="font-bold text-lg">3. Course Preferences</h2>
            </div>
            <div className="text-gray-600 text-sm">
                List courses in order of priority (Rank 1 being your top choice). 
                <ul className="list-disc pl-5 mt-2 space-y-1">
                    <li>Use <strong>"Same as Last Year"</strong> if you want to keep your previous schedule slot.</li>
                    <li className="font-semibold text-blue-800">Multiple Sections: If you wish to teach multiple sections of the same course, please list the course multiple times in your ranking.</li>
                    <li>Select multiple days/times if you are flexible.</li>
                    <li>Check your preferred teaching modality (Live, Hybrid, Online).</li>
                </ul>
            </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center mb-4 text-blue-700">
                <CheckCircle2 className="w-6 h-6 mr-2" />
                <h2 className="font-bold text-lg">4. Final Submission</h2>
            </div>
            <p className="text-gray-600 text-sm">
                Add any special notes regarding room requirements or back-to-back constraints in the "Special Instructions" box. Once you submit, the Department Schedule Developer will review your request against the master schedule.
            </p>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-100 p-6 rounded-xl mb-8">
        <h3 className="font-bold text-blue-900 mb-2">Deadlines</h3>
        <p className="text-blue-800 text-sm">
            All requests must be submitted by <strong>November 15th</strong>. Late submissions will be assigned courses based on remaining availability.
        </p>
      </div>

      <div className="flex justify-end">
        <button 
            onClick={onStart}
            className="flex items-center bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-lg shadow-lg transition-all transform hover:scale-105"
        >
            Start Request Form <ArrowRight className="ml-2 w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default FacultyInstructions;
