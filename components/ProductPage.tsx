
import React, { useState } from 'react';
import { ArrowLeft, CheckCircle, Calendar, Users, Zap, Shield, BarChart3, Layout, MousePointerClick, FileText, Bell, Sparkles } from 'lucide-react';

interface Props {
  onBack: () => void;
}

const ProductPage: React.FC<Props> = ({ onBack }) => {
  const [showFeatures, setShowFeatures] = useState(false);

  if (showFeatures) {
    return (
      <div className="min-h-screen bg-slate-50 font-sans text-gray-900 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <button 
            onClick={() => setShowFeatures(false)}
            className="group flex items-center text-blue-600 hover:text-blue-800 font-semibold mb-8 transition-colors px-4 py-2 bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md"
          >
            <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
            Return to Overview
          </button>

          <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
            <div className="bg-blue-900 py-10 px-8 text-center">
              <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-4">Detailed Features</h1>
              <p className="text-blue-200 text-lg max-w-2xl mx-auto">
                Everything you need to streamline your academic scheduling process.
              </p>
            </div>

            <div className="p-8 md:p-12 space-y-12">
              
              {/* Section 1: For Faculty */}
              <div>
                <div className="flex items-center mb-6">
                  <div className="bg-blue-100 p-3 rounded-lg mr-4">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">Faculty Portal Features</h2>
                </div>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    "Secure Login & Profile Management",
                    "Define Desired Course Load",
                    "Rank Course Preferences (1-7)",
                    "Set Teaching Availability (Days/Times)",
                    "Indicate Modality Willingness",
                    "Select Textbook Cost Options (OER/Low Cost)",
                    "One-Click 'Same as Last Year' Request",
                    "Mobile-Friendly Interface"
                  ].map((item, i) => (
                    <li key={i} className="flex items-start">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="border-t border-gray-100"></div>

              {/* Section 2: For Schedulers */}
              <div>
                <div className="flex items-center mb-6">
                  <div className="bg-emerald-100 p-3 rounded-lg mr-4">
                    <Layout className="w-6 h-6 text-emerald-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">Scheduler & Admin Tools</h2>
                </div>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    "Master Schedule Visual Builder",
                    "Load from Archived Schedules (Rollover)",
                    "Drag-and-Drop Faculty Requests",
                    "Real-Time Conflict Detection",
                    "Auto-Assign AI Algorithm",
                    "Import Schedule from CSV/Excel",
                    "Export Final Schedule to Excel",
                    "Customizable Global Lists (Textbooks/Campuses)"
                  ].map((item, i) => (
                    <li key={i} className="flex items-start">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="border-t border-gray-100"></div>

              {/* Section 3: Workflow & Intelligence */}
              <div>
                <div className="flex items-center mb-6">
                  <div className="bg-purple-100 p-3 rounded-lg mr-4">
                    <Sparkles className="w-6 h-6 text-purple-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">Workflow & Intelligence</h2>
                </div>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    "Automated Email Reminders",
                    "Faculty Verification/Approval Dashboard",
                    "Digital Sign-Off Tracking",
                    "Smart Assistant (AI Chat)",
                    "Seniority-Based Sorting",
                    "Department Partitioning",
                    "Collapsible Notification Tools",
                    "Status Tracking (New, Keep, Change)"
                  ].map((item, i) => (
                    <li key={i} className="flex items-start">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

            </div>
            
            <div className="bg-gray-50 px-8 py-6 border-t border-gray-200 flex justify-center">
               <button 
                onClick={onBack}
                className="bg-blue-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-blue-700 transition-colors shadow-md"
              >
                Ready to Start? Launch App
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <span className="text-xl font-bold tracking-tight text-gray-900">ACADEMIC<span className="text-blue-600">PRO</span></span>
            </div>
            <button 
              onClick={onBack}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-sm"
            >
              Launch App
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative overflow-hidden bg-slate-900 pt-16 pb-32">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1557804506-669a67965ba0?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80')] opacity-10 bg-cover bg-center"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/50 to-slate-900"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-12">
          <h1 className="text-4xl md:text-6xl font-extrabold text-white tracking-tight mb-6">
            Stop Wrestling with <br/>
            <span className="text-blue-400">Spreadsheets & Emails</span>
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-xl text-slate-300">
            The all-in-one solution for Department Chairs and Schedule Developers to collect faculty requests, detect conflicts, and build the perfect semester schedule.
          </p>
          <div className="mt-10 flex justify-center gap-4">
            <button 
              onClick={onBack}
              className="px-8 py-4 bg-blue-600 text-white rounded-lg font-bold text-lg hover:bg-blue-500 transition-all shadow-lg hover:shadow-blue-500/25 flex items-center"
            >
              Get Started <span className="ml-2">→</span>
            </button>
            <button 
              onClick={() => setShowFeatures(true)} 
              className="px-8 py-4 bg-slate-800 text-white border border-slate-700 rounded-lg font-bold text-lg hover:bg-slate-700 transition-all"
            >
              See Features
            </button>
          </div>
        </div>
      </div>

      {/* Value Proposition Stats */}
      <div className="bg-slate-50 border-y border-slate-200">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-3 text-center">
            <div>
              <div className="text-4xl font-extrabold text-blue-600">75%</div>
              <div className="mt-2 text-sm font-medium text-gray-500 uppercase tracking-wide">Time Saved</div>
            </div>
            <div>
              <div className="text-4xl font-extrabold text-blue-600">0</div>
              <div className="mt-2 text-sm font-medium text-gray-500 uppercase tracking-wide">Double Bookings</div>
            </div>
            <div>
              <div className="text-4xl font-extrabold text-blue-600">100%</div>
              <div className="mt-2 text-sm font-medium text-gray-500 uppercase tracking-wide">Faculty Satisfaction</div>
            </div>
          </div>
        </div>
      </div>

      {/* Feature Highlights Grid (Preview) */}
      <div className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center mb-16">
            <h2 className="text-base text-blue-600 font-semibold tracking-wide uppercase">Why AcademicPro?</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              A better way to build the schedule.
            </p>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
              Replace the chaos of sticky notes, email threads, and fragmented Excel files with a unified intelligent platform.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {/* Feature 1 */}
            <div className="relative p-8 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-xl transition-shadow">
              <div className="absolute top-0 -mt-6 left-1/2 -ml-6 bg-blue-600 rounded-xl p-3 shadow-lg">
                <Users className="w-6 h-6 text-white" />
              </div>
              <h3 className="mt-8 text-xl font-bold text-gray-900 text-center">Faculty Request Portal</h3>
              <p className="mt-4 text-gray-500 text-center">
                Faculty log in to a dedicated portal to submit load desires, course preferences, and time availability. No more manual data entry from emails.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="relative p-8 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-xl transition-shadow">
              <div className="absolute top-0 -mt-6 left-1/2 -ml-6 bg-emerald-600 rounded-xl p-3 shadow-lg">
                <Layout className="w-6 h-6 text-white" />
              </div>
              <h3 className="mt-8 text-xl font-bold text-gray-900 text-center">Visual Scheduling</h3>
              <p className="mt-4 text-gray-500 text-center">
                See your master schedule and faculty requests side-by-side. Drag and drop requests directly into time slots.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="relative p-8 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-xl transition-shadow">
              <div className="absolute top-0 -mt-6 left-1/2 -ml-6 bg-purple-600 rounded-xl p-3 shadow-lg">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <h3 className="mt-8 text-xl font-bold text-gray-900 text-center">Smart Assistant</h3>
              <p className="mt-4 text-gray-500 text-center">
                Built-in AI and logic checks to prevent errors before they happen. Ensure room availability and faculty qualification.
              </p>
            </div>
          </div>

          <div className="mt-12 text-center">
              <button 
                  onClick={() => setShowFeatures(true)}
                  className="inline-flex items-center text-blue-600 font-bold hover:text-blue-800 transition-colors"
              >
                  View Full Feature List <MousePointerClick className="ml-2 w-4 h-4" />
              </button>
          </div>
        </div>
      </div>

      {/* Workflow Section */}
      <div className="bg-slate-50 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-extrabold text-gray-900">How it Works</h2>
            <p className="mt-4 text-lg text-gray-500">From rollover to finalization in four easy steps.</p>
          </div>

          <div className="relative">
             {/* Connector Line (Desktop) */}
            <div className="hidden md:block absolute top-1/2 left-0 w-full h-1 bg-slate-200 -z-10 transform -translate-y-1/2"></div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="bg-white p-6 rounded-lg shadow-sm text-center relative">
                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4 border-4 border-white">1</div>
                <h3 className="font-bold text-gray-900 mb-2">Import & Roll</h3>
                <p className="text-sm text-gray-600">Import CSV or load an Archived Schedule to create a template.</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm text-center relative">
                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4 border-4 border-white">2</div>
                <h3 className="font-bold text-gray-900 mb-2">Request</h3>
                <p className="text-sm text-gray-600">Faculty submit their preferences via the secure portal.</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm text-center relative">
                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4 border-4 border-white">3</div>
                <h3 className="font-bold text-gray-900 mb-2">Build</h3>
                <p className="text-sm text-gray-600">Drag requests to slots. Use Auto-Assign to fill gaps.</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm text-center relative">
                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4 border-4 border-white">4</div>
                <h3 className="font-bold text-gray-900 mb-2">Verify</h3>
                <p className="text-sm text-gray-600">Send drafts to faculty for digital sign-off. Export to Excel.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="bg-blue-900 py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-6">Ready to simplify your semester?</h2>
          <p className="text-blue-200 text-lg mb-8">
            Join the department chairs who have switched from spreadsheet chaos to organized efficiency.
          </p>
          <button 
            onClick={onBack}
            className="px-8 py-4 bg-white text-blue-900 rounded-lg font-bold text-lg hover:bg-gray-100 transition-colors shadow-lg"
          >
            Launch the Scheduler
          </button>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-slate-950 text-slate-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <span className="text-xl font-bold text-white mb-4 block">ACADEMIC<span className="text-blue-500">PRO</span></span>
            <p className="text-sm">Empowering higher education departments with intelligent scheduling tools.</p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Features</h4>
            <ul className="space-y-2 text-sm">
              <li>Master Schedule Builder</li>
              <li>Faculty Verification</li>
              <li>Conflict Detection</li>
              <li>Excel Integration</li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Support</h4>
            <ul className="space-y-2 text-sm">
              <li>Documentation</li>
              <li>Contact Admin</li>
              <li>Privacy Policy</li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 mt-12 pt-8 border-t border-slate-800 text-center text-sm">
          &copy; {new Date().getFullYear()} AcademicPro Scheduling Systems. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default ProductPage;
