import React from 'react';
import { useAppStore } from '../../store';
import { UserRole, RegistrationStatus, Course } from '../../types';
import { Card, Button, Badge } from '../../components/ui';
import { Check, X, Clock, AlertTriangle, Search, ChevronRight, Filter, User, Book, Users } from 'lucide-react';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import * as api from '../../utils/api';

const Registration: React.FC = () => {
  const { currentUser } = useAppStore();

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-1.5">
        <h1 className="text-3xl font-bold tracking-tight text-white">Course Registration</h1>
        <p className="text-gray-400 text-sm">Session 2025-II • Phase I</p>
      </div>

      {currentUser.role === UserRole.STUDENT && <StudentRegistrationView />}
      {currentUser.role === UserRole.INSTRUCTOR && <InstructorApprovalView />}
      {currentUser.role === UserRole.ADVISOR && <AdvisorApprovalView />}
      {currentUser.role === UserRole.ADMIN && <div className="p-8 text-center text-gray-500 border border-dashed border-white/10 rounded-xl">Admin view not implemented for demo.</div>}
    </div>
  );
};

// --- Student View Components ---

const StudentRegistrationView: React.FC = () => {
  const [offerings, setOfferings] = React.useState<any[]>([]);
  const [requests, setRequests] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [currentSession] = React.useState('2025-II');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [offeringsData, reqsData] = await Promise.all([
        // Fetch offerings for the specific session that are approved/offered
        api.getOfferings({ sessionId: currentSession, status: 'Offered' }),
        api.getStudentCourses()
      ]);
      setOfferings(offeringsData.offerings || []);
      setRequests(reqsData.enrollments || []);
    } catch (err) {
      console.error('Failed to fetch student data', err);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchData();
  }, []);

  const handleEnroll = async (courseId: string) => {
    try {
      await api.enrollInCourse(courseId, currentSession);
      await fetchData();
      alert('Enrollment request submitted successfully!');
    } catch (err: any) {
      console.error('Enrollment failed', err);
      // Show specific error from backend (Conflict, Credit Limit, etc.)
      const errorMessage = err.response?.data?.error || err.message || 'Enrollment failed';
      const errorDetails = err.response?.data?.details || '';
      alert(`Error: ${errorMessage}\n${errorDetails}`);
    }
  };

  const getRequestForCourse = (courseId: string) => requests.find(r => r.course_id === courseId);

  if (loading) return <div className="p-12 text-center text-gray-500">Loading academics...</div>;

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
      {/* Course List */}
      <Card className="xl:col-span-2 p-0 overflow-hidden border-white/10 bg-[#18181b]">
        <div className="p-5 border-b border-white/10 bg-white/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h3 className="font-semibold text-white">Available Courses</h3>
            <p className="text-xs text-gray-400 mt-1">Select electives for the current semester.</p>
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search by code or name..."
              className="w-full bg-black/40 border border-white/10 rounded-lg pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500/50 transition-colors placeholder-gray-600"
            />
          </div>
        </div>
        <div className="divide-y divide-white/5">

          {offerings.map(offering => {
            // Mapping offering data to render
            const courseId = offering.course_id;
            const title = offering.title; // derived from join in getOfferings
            const credits = offering.credits;
            const instructors = offering.instructors || [];
            const instructorNames = instructors.length > 0
              ? instructors.map((i: any) => i.email.split('@')[0]).join(', ')
              : 'TBA';

            const existingRequest = getRequestForCourse(courseId);
            const isPending = existingRequest && existingRequest.status !== RegistrationStatus.APPROVED && !existingRequest.status.includes('REJECTED');
            const isApproved = existingRequest?.status === RegistrationStatus.APPROVED;

            return (
              <div key={courseId} className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-white/[0.02] transition-colors group">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-white/10 text-gray-300 border border-white/5">{courseId}</span>
                    <h4 className="font-medium text-white group-hover:text-blue-200 transition-colors">{title}</h4>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-gray-500 mt-2">
                    <div className="flex items-center gap-1.5">
                      <User size={12} />
                      {instructorNames}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Book size={12} />
                      {credits} Credits
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock size={12} />
                      {offering.slot_timings || 'TBA'}
                    </div>
                  </div>
                </div>
                <div>
                  {existingRequest ? (
                    <div className="flex items-center gap-2">
                      {isApproved && <span className="flex items-center gap-1 text-xs text-green-500 font-medium"><Check size={14} /> Enrolled</span>}
                      {isPending && <span className="flex items-center gap-1 text-xs text-yellow-500 font-medium"><Clock size={14} /> Processing</span>}
                      {existingRequest.status.includes('REJECTED') && <span className="flex items-center gap-1 text-xs text-red-500 font-medium"><X size={14} /> Rejected</span>}
                    </div>
                  ) : (
                    <Button size="sm" onClick={() => handleEnroll(courseId)} className="w-full sm:w-auto">Enroll</Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Status Tracker */}
      <div className="space-y-6">
        <h3 className="font-semibold text-lg">My Requests</h3>
        {requests.length === 0 && (
          <div className="p-8 rounded-xl border border-dashed border-white/10 text-center text-gray-500 bg-[#18181b]/50">
            <Book className="w-8 h-8 mx-auto mb-3 opacity-20" />
            <p className="text-sm">No courses selected yet.</p>
          </div>
        )}

        <AnimatePresence>
          {requests.map(req => (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              key={req.id}
              className="bg-[#18181b] rounded-xl border border-white/10 p-5 shadow-lg relative overflow-hidden"
            >
              {req.status === RegistrationStatus.APPROVED && (
                <div className="absolute top-0 right-0 w-16 h-16 overflow-hidden">
                  <div className="absolute top-0 right-0 transform translate-x-1/2 -translate-y-1/2 rotate-45 bg-green-500/20 w-full h-2 bg-green-500"></div>
                </div>
              )}

              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="font-medium text-white">{req.course_title || req.course_id}</h4>
                  <p className="text-xs text-gray-500 mt-0.5">Semester: {req.semester}</p>
                </div>
                <StatusBadge status={req.status} />
              </div>

              {/* Workflow Stepper */}
              <div className="relative pt-2">
                <div className="absolute top-1/2 left-0 w-full h-0.5 bg-white/5 -translate-y-1/2 rounded-full"></div>
                <div className="relative flex justify-between text-[10px] font-medium text-gray-500">
                  <StepIndicator
                    label="Instructor"
                    state={getStepState(req.status, 'instructor')}
                  />
                  <StepIndicator
                    label="Advisor"
                    state={getStepState(req.status, 'advisor')}
                  />
                  <StepIndicator
                    label="Registered"
                    state={getStepState(req.status, 'final')}
                    isLast
                  />
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

// Helper for stepper logic
const getStepState = (status: RegistrationStatus, step: 'instructor' | 'advisor' | 'final') => {
  const isRejected = status.includes('REJECTED');
  if (isRejected) return 'error';

  if (step === 'instructor') {
    if (status === RegistrationStatus.PENDING_INSTRUCTOR) return 'current';
    return 'completed'; // Pending advisor or approved means passed instructor
  }
  if (step === 'advisor') {
    if (status === RegistrationStatus.PENDING_INSTRUCTOR) return 'waiting';
    if (status === RegistrationStatus.PENDING_ADVISOR) return 'current';
    return 'completed';
  }
  if (step === 'final') {
    if (status === RegistrationStatus.APPROVED) return 'completed';
    return 'waiting';
  }
  return 'waiting';
};

const StepIndicator = ({ label, state, isLast }: { label: string, state: 'waiting' | 'current' | 'completed' | 'error', isLast?: boolean }) => {
  const bg =
    state === 'completed' ? 'bg-green-500 border-green-500 text-black' :
      state === 'current' ? 'bg-blue-500 border-blue-500 text-white animate-pulse' :
        state === 'error' ? 'bg-red-500 border-red-500 text-white' :
          'bg-[#09090b] border-gray-700 text-gray-500';

  const icon =
    state === 'completed' ? <Check size={10} strokeWidth={4} /> :
      state === 'error' ? <X size={10} strokeWidth={4} /> :
        <div className="w-1.5 h-1.5 bg-current rounded-full" />;

  return (
    <div className="flex flex-col items-center gap-2 relative z-10">
      <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors duration-300 ${bg}`}>
        {icon}
      </div>
      <span className={`${state === 'current' ? 'text-blue-400' : state === 'completed' ? 'text-green-500' : ''}`}>
        {label}
      </span>
    </div>
  );
};

const StatusBadge = ({ status }: { status: RegistrationStatus }) => {
  if (status === RegistrationStatus.APPROVED) return <Badge color="green">Registered</Badge>;
  if (status.includes('PENDING')) return <Badge color="yellow">In Progress</Badge>;
  if (status.includes('REJECTED')) return <Badge color="red">Action Required</Badge>;
  return <Badge color="gray">Unknown</Badge>;
};

// --- Instructor View ---

const InstructorApprovalView: React.FC = () => {
  const [requests, setRequests] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [showBatchModal, setShowBatchModal] = React.useState(false);
  const [batchYear, setBatchYear] = React.useState('2023');
  const [selectedCourseId, setSelectedCourseId] = React.useState('');
  const [courses, setCourses] = React.useState<Course[]>([]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [reqsData, coursesData] = await Promise.all([
        api.getRegistrationRequests({ status: RegistrationStatus.PENDING_INSTRUCTOR }),
        api.getAllCourses()
      ]);
      setRequests(reqsData.requests);
      setCourses(coursesData.courses);
      if (coursesData.courses.length > 0) setSelectedCourseId(coursesData.courses[0].id);
    } catch (err) {
      console.error('Failed to fetch instructor data', err);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchData();
  }, []);

  const handleBatchEnroll = async () => {
    if (!selectedCourseId || !batchYear) return;
    try {
      await api.enrollBatch(selectedCourseId, parseInt(batchYear), '2023-24 Autumn');
      setShowBatchModal(false);
      await fetchData();
    } catch (err) {
      console.error('Batch enrollment failed', err);
    }
  };

  if (loading) return <div className="p-12 text-center text-gray-500">Loading...</div>;

  return (
    <div className="space-y-6">
      <Card className="p-0 overflow-hidden border-white/10 bg-[#18181b]">
        <div className="p-6 border-b border-white/10 bg-white/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h3 className="font-semibold text-white">Pending Course Approvals</h3>
            <p className="text-xs text-gray-400 mt-1">Review student enrollment requests for your courses.</p>
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <Button size="sm" variant="secondary" onClick={() => setShowBatchModal(true)}>
              <Users size={14} className="mr-2" /> Batch Enroll
            </Button>
          </div>
        </div>

        {requests.length === 0 ? (
          <div className="p-16 text-center text-gray-500 flex flex-col items-center">
            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
              <Check className="w-8 h-8 opacity-40 text-green-500" />
            </div>
            <p className="font-medium text-white">All caught up!</p>
            <p className="text-sm mt-1">There are no pending requests for your courses.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-black/20 text-gray-400 border-b border-white/5">
                <tr>
                  <th className="px-6 py-4 font-medium">Student Name</th>
                  <th className="px-6 py-4 font-medium">Course Requested</th>
                  <th className="px-6 py-4 font-medium">Batch</th>
                  <th className="px-6 py-4 font-medium text-right">Decision</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {requests.map(req => (
                  <motion.tr
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    key={req.id}
                    className="hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="px-6 py-4 font-medium text-white">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center text-xs font-bold">
                          {req.student_email.charAt(0).toUpperCase()}
                        </div>
                        {req.student_email.split('@')[0]}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-300">
                      <div className="flex flex-col">
                        <span>{req.course_title}</span>
                        <span className="text-[10px] text-gray-500 font-mono">{req.course_id}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge color="blue">Batch {req.batch}</Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-3">
                        <button
                          onClick={() => api.updateRegistrationStatus(req.id, RegistrationStatus.REJECTED_INSTRUCTOR).then(fetchData)}
                          className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                        >
                          <X size={18} />
                        </button>
                        <button
                          onClick={() => api.updateRegistrationStatus(req.id, RegistrationStatus.PENDING_ADVISOR).then(fetchData)}
                          className="px-4 py-2 bg-white text-black text-xs font-bold rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
                        >
                          <Check size={14} /> Approve
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Batch Modal */}
      {showBatchModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md bg-[#18181b] border border-white/10 rounded-2xl p-6 shadow-2xl"
          >
            <h3 className="text-xl font-bold text-white mb-4">Batch Enrollment</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider">Select Course</label>
                <select
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500/50"
                  value={selectedCourseId}
                  onChange={(e) => setSelectedCourseId(e.target.value)}
                >
                  {courses.map(c => (
                    <option key={c.id} value={c.id}>{c.code} - {c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider">Batch Year</label>
                <input
                  type="number"
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500/50"
                  placeholder="e.g. 2023"
                  value={batchYear}
                  onChange={(e) => setBatchYear(e.target.value)}
                />
              </div>
              <div className="flex gap-3 pt-4">
                <Button variant="ghost" onClick={() => setShowBatchModal(false)} className="flex-1">Cancel</Button>
                <Button onClick={handleBatchEnroll} className="flex-1 bg-blue-600 hover:bg-blue-500">Enroll Batch</Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

// --- Advisor View ---

const AdvisorApprovalView: React.FC = () => {
  const { currentUser } = useAppStore();
  const [requests, setRequests] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [selectedIds, setSelectedIds] = React.useState<string[]>([]);
  const [lastSelectedId, setLastSelectedId] = React.useState<string | null>(null);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const data = await api.getRegistrationRequests({ status: RegistrationStatus.PENDING_ADVISOR });
      setRequests(data.requests);
    } catch (err) {
      console.error('Failed to fetch requests', err);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchRequests();
  }, []);

  const handleToggleSelect = (id: string, event: React.MouseEvent | React.ChangeEvent) => {
    const isShiftKey = (event as React.MouseEvent).shiftKey;

    if (isShiftKey && lastSelectedId) {
      const currentIndex = requests.findIndex(r => r.id === id);
      const lastIndex = requests.findIndex(r => r.id === lastSelectedId);

      const start = Math.min(currentIndex, lastIndex);
      const end = Math.max(currentIndex, lastIndex);

      const idsInRange = requests.slice(start, end + 1).map(r => r.id);

      setSelectedIds(prev => {
        const newSet = new Set([...prev, ...idsInRange]);
        return Array.from(newSet);
      });
    } else {
      setSelectedIds(prev =>
        prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
      );
    }
    setLastSelectedId(id);
  };

  const handleSelectAll = () => {
    if (selectedIds.length === requests.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(requests.map(r => r.id));
    }
  };

  const handleBulkAction = async (status: RegistrationStatus) => {
    if (selectedIds.length === 0) return;

    try {
      await Promise.all(selectedIds.map(id => api.updateRegistrationStatus(parseInt(id), status)));
      await fetchRequests();
      setSelectedIds([]);
    } catch (err) {
      console.error('Bulk action failed', err);
    }
  };

  if (loading) {
    return <div className="p-12 text-center text-gray-500">Loading requests...</div>;
  }

  return (
    <Card className="p-0 overflow-hidden border-white/10 bg-[#18181b]">
      <div className="p-6 border-b border-white/10 bg-white/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h3 className="font-semibold text-white">Final Approval Queue</h3>
          <p className="text-xs text-gray-400 mt-1">Review approved courses for your advisees. ({requests.length} pending)</p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          {selectedIds.length > 0 && (
            <div className="flex gap-2 animate-in fade-in slide-in-from-right-4">
              <Button size="sm" variant="ghost" onClick={() => handleBulkAction(RegistrationStatus.REJECTED_ADVISOR)} className="text-red-400 hover:text-red-300">Reject ({selectedIds.length})</Button>
              <Button size="sm" onClick={() => handleBulkAction(RegistrationStatus.APPROVED)} className="bg-green-600 hover:bg-green-500">Approve ({selectedIds.length})</Button>
            </div>
          )}
          <div className="flex items-center gap-2 text-xs text-yellow-500 bg-yellow-500/10 px-3 py-1.5 rounded-lg border border-yellow-500/10 whitespace-nowrap">
            <AlertTriangle size={14} />
            <span>Deadline: Mar 25</span>
          </div>
        </div>
      </div>

      {requests.length === 0 ? (
        <div className="p-16 text-center text-gray-500 flex flex-col items-center">
          <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
            <Check className="w-8 h-8 opacity-40 text-blue-500" />
          </div>
          <p className="font-medium text-white">Queue Empty</p>
          <p className="text-sm mt-1">No advisee requests pending final approval.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-black/20 text-gray-400 border-b border-white/5">
              <tr>
                <th className="px-6 py-4 font-medium w-12">
                  <input
                    type="checkbox"
                    className="rounded border-white/10 bg-white/5"
                    checked={selectedIds.length === requests.length && requests.length > 0}
                    onChange={handleSelectAll}
                  />
                </th>
                <th className="px-6 py-4 font-medium">Student</th>
                <th className="px-6 py-4 font-medium">Course Details</th>
                <th className="px-6 py-4 font-medium">Batch</th>
                <th className="px-6 py-4 font-medium">Credits</th>
                <th className="px-6 py-4 font-medium text-right">Final Decision</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {requests.map(req => (
                <tr
                  key={req.id}
                  className={`hover:bg-white/[0.02] transition-colors ${selectedIds.includes(req.id) ? 'bg-blue-500/5' : ''}`}
                  onClick={(e) => handleToggleSelect(req.id, e)}
                >
                  <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      className="rounded border-white/10 bg-white/5"
                      checked={selectedIds.includes(req.id)}
                      onChange={(e) => handleToggleSelect(req.id, e)}
                    />
                  </td>
                  <td className="px-6 py-4 font-medium text-white">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-indigo-500/10 text-indigo-500 flex items-center justify-center text-xs font-bold">
                        {req.student_email.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="truncate max-w-[150px]">{req.student_email.split('@')[0]}</p>
                        <p className="text-[10px] text-gray-500">{req.entry_no || '2023CSBXXXX'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-300">
                    <div className="flex flex-col">
                      <span>{req.course_title}</span>
                      <span className="text-[10px] text-gray-500 font-mono">{req.course_id}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <Badge color="blue">Batch {req.batch}</Badge>
                  </td>
                  <td className="px-6 py-4 text-gray-500">{req.credits}</td>
                  <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex justify-end gap-3">
                      <button
                        onClick={() => api.updateRegistrationStatus(req.id, RegistrationStatus.REJECTED_ADVISOR).then(fetchRequests)}
                        className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                      >
                        <X size={18} />
                      </button>
                      <button
                        onClick={() => api.updateRegistrationStatus(req.id, RegistrationStatus.APPROVED).then(fetchRequests)}
                        className="px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-500 transition-colors shadow-lg shadow-blue-500/20"
                      >
                        Finalize
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
};

export default Registration;
