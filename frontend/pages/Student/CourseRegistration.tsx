import React from 'react';
import { RegistrationStatus, Course } from '../../types';
import { Card, Button, Badge } from '../../components/ui';
import { Check, X, Clock, Search, User, Book } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import * as api from '../../utils/api';

const CourseRegistration: React.FC = () => {
    const [courses, setCourses] = React.useState<Course[]>([]);
    const [requests, setRequests] = React.useState<any[]>([]);
    const [loading, setLoading] = React.useState(true);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [coursesData, reqsData] = await Promise.all([
                api.getAllCourses(),
                api.getStudentCourses()
            ]);
            setCourses(coursesData.courses);
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
            await api.enrollInCourse(courseId, '2025-II'); // Updated to current real session
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
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
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
                    {courses.map(course => {
                        const existingRequest = getRequestForCourse(course.course_id);
                        const isPending = existingRequest && existingRequest.status !== RegistrationStatus.APPROVED && !existingRequest.status.includes('REJECTED');
                        const isApproved = existingRequest?.status === RegistrationStatus.APPROVED;

                        return (
                            <div key={course.course_id} className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-white/[0.02] transition-colors group">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-1">
                                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-white/10 text-gray-300 border border-white/5">{course.course_id}</span>
                                        <h4 className="font-medium text-white group-hover:text-blue-200 transition-colors">{course.title}</h4>
                                    </div>
                                    <div className="flex items-center gap-4 text-xs text-gray-500 mt-2">
                                        <div className="flex items-center gap-1.5">
                                            <User size={12} />
                                            {course.instructor_email || course.instructor_dept || 'TBA'}
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <Book size={12} />
                                            {course.credits} Credits
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <Clock size={12} />
                                            {course.timings || course.ltp || 'N/A'}
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
                                        <Button size="sm" onClick={() => handleEnroll(course.course_id)} className="w-full sm:w-auto">Enroll</Button>
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

export default CourseRegistration;
