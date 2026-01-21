
import React, { useState } from 'react';
import { Card } from '../components/ui';
import { MOCK_COURSES } from '../constants';

const CourseFeedback: React.FC = () => {
  const [feedbackType, setFeedbackType] = useState('');
  const [selectedInstructor, setSelectedInstructor] = useState('');

  // Extract unique instructor/course combos for the dropdown
  const instructorOptions = MOCK_COURSES.map(c => ({
    value: c.id,
    label: `${c.code} - ${c.instructorName}`
  }));

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight text-white">Course Feedback</h1>
        <p className="text-gray-400 text-sm">Anonymous feedback submission for course instructors.</p>
      </div>

      <Card className="p-0 bg-[#18181b] border-white/10 overflow-hidden min-h-[400px]">
        {/* Header matching screenshot */}
        <div className="p-4 border-b border-white/10 bg-white/5">
          <h2 className="text-base font-semibold text-white">Course Instructor Feedback</h2>
        </div>

        <div className="p-6 space-y-8">
          
          {/* Notes Section */}
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-gray-200">Please note the following before submitting:</h3>
            <ul className="list-disc list-inside text-xs text-gray-400 space-y-1.5 ml-1">
              <li>All fields marked with a '*' are mandatory.</li>
              <li>Feedback for one course instructor can be submitted only once.</li>
              <li>When there are more than one instructors teaching a course, please choose only those instructors (one at a time) whose classes your attended.</li>
              <li>ALL feedback is anonymous.</li>
            </ul>
          </div>

          <hr className="border-white/5" />

          {/* Form Fields Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            
            {/* Feedback Type */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-400 flex gap-1">
                <span className="text-red-500">*</span> Feedback type
              </label>
              <div className="relative">
                <select 
                  className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white focus:border-blue-500/50 outline-none appearance-none"
                  value={feedbackType}
                  onChange={(e) => setFeedbackType(e.target.value)}
                >
                  <option value="">--Select--</option>
                  <option value="MID_SEM">Mid Semester Feedback</option>
                  <option value="END_SEM">End Semester Feedback</option>
                </select>
                {/* Custom chevron for consistent styling */}
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1 1L5 5L9 1" stroke="#71717a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>
            </div>

            {/* Course Instructor */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-400 flex gap-1">
                <span className="text-red-500">*</span> Select the course instructor
              </label>
              <div className="relative">
                <select 
                  className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white focus:border-blue-500/50 outline-none appearance-none"
                  value={selectedInstructor}
                  onChange={(e) => setSelectedInstructor(e.target.value)}
                >
                  <option value="">--Select--</option>
                  {instructorOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1 1L5 5L9 1" stroke="#71717a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>
            </div>

          </div>

          {/* Placeholder for Dynamic Form Content */}
          {feedbackType && selectedInstructor && (
            <div className="mt-8 pt-8 border-t border-white/5 animate-in fade-in">
              <div className="text-center p-8 border border-dashed border-white/10 rounded-xl bg-white/[0.02]">
                <p className="text-sm text-gray-500">Feedback form questions for the selected instructor would appear here.</p>
              </div>
            </div>
          )}

        </div>
      </Card>
    </div>
  );
};

export default CourseFeedback;
