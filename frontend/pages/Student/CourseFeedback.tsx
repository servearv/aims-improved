
import React, { useState } from 'react';
import { Card, Button, Input } from '../../components/ui';
import { useAppStore } from '../../store';
import { submitCourseFeedback } from '../../utils/api';

const CourseFeedback: React.FC = () => {
  const { courses } = useAppStore();
  const [feedbackType, setFeedbackType] = useState('');
  const [selectedInstructor, setSelectedInstructor] = useState('');
  const [courseId, setCourseId] = useState('');

  const [ratings, setRatings] = useState({
    communication: 5,
    knowledge: 5,
    helpfulness: 5,
    punctuality: 5,
    overall: 5
  });
  const [comments, setComments] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Extract unique instructor/course combos
  const instructorOptions = courses.map(c => ({
    value: `${c.id}|${c.instructorId}`, // Hack to store both
    label: `${c.code} - ${c.instructorName}`,
    courseId: c.id,
    instructorId: c.instructorId // Assuming course object has this
  }));

  const handleInstructorChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (!val) {
      setCourseId('');
      setSelectedInstructor('');
      return;
    }
    const [cId, iId] = val.split('|');
    setCourseId(cId);
    setSelectedInstructor(iId);
  }

  const handleSubmit = async () => {
    if (!feedbackType || !selectedInstructor || !courseId) {
      setMessage({ type: 'error', text: 'Please fill all required fields' });
      return;
    }

    setSubmitting(true);
    setMessage(null);

    try {
      await submitCourseFeedback(courseId, {
        feedbackType,
        instructorId: selectedInstructor,
        ratings,
        comments
      });
      setMessage({ type: 'success', text: 'Feedback submitted successfully!' });
      // Reset form
      setComments('');
      setRatings({ communication: 5, knowledge: 5, helpfulness: 5, punctuality: 5, overall: 5 });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to submit feedback' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight text-white">Course Feedback</h1>
        <p className="text-gray-400 text-sm">Anonymous feedback submission for course instructors.</p>
      </div>

      <Card className="p-0 bg-[#18181b] border-white/10 overflow-hidden min-h-[400px]">
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
              <li>ALL feedback is anonymous.</li>
            </ul>
          </div>

          <hr className="border-white/5" />

          {message && (
            <div className={`p-3 rounded text-sm ${message.type === 'success' ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>
              {message.text}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
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
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-400 flex gap-1">
                <span className="text-red-500">*</span> Select the course instructor
              </label>
              <div className="relative">
                <select
                  className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white focus:border-blue-500/50 outline-none appearance-none"
                  onChange={handleInstructorChange}
                  defaultValue=""
                >
                  <option value="">--Select--</option>
                  {instructorOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {(feedbackType && selectedInstructor) && (
            <div className="mt-8 pt-8 border-t border-white/5 animate-in fade-in space-y-6">
              <h3 className="text-white font-semibold">Rate the Instructor (1-5)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(ratings).map(([key, value]) => (
                  <div key={key} className="space-y-1">
                    <label className="text-xs uppercase text-gray-400 font-bold">{key}</label>
                    <input
                      type="range"
                      min="1" max="5"
                      value={value}
                      onChange={(e) => setRatings({ ...ratings, [key]: parseInt(e.target.value) })}
                      className="w-full accent-blue-500"
                    />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Poor</span>
                      <span>Excellent ({value})</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-400">Comments (Optional)</label>
                <textarea
                  className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500/50 outline-none min-h-[100px]"
                  value={comments}
                  onChange={e => setComments(e.target.value)}
                  placeholder="Share your experience..."
                />
              </div>

              <Button onClick={handleSubmit} disabled={submitting} className="w-full md:w-auto">
                {submitting ? 'Submitting...' : 'Submit Feedback'}
              </Button>

            </div>
          )}

        </div>
      </Card>
    </div>
  );
};

export default CourseFeedback;
