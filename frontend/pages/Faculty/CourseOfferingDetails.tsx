import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Button, Badge, Input } from '../../components/ui';
import { Save, X, Plus, Trash2, Search, Loader2 } from 'lucide-react';
import * as api from '../../utils/api';

interface Instructor {
    instructor_id: string;
    email: string;
    dept: string;
    is_coordinator: boolean;
}

// CreditingCategory interface removed - feature disabled

interface Session {
    session_id: string;
    name: string;
    start_date: string;
    end_date: string;
    is_current: boolean;
}

interface Department {
    dept_code: string;
    name: string;
}

interface CourseSearchResult {
    course_id: string;
    title: string;
    credits: number;
    ltp: string;
}

const CourseOfferingDetails: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const isNew = !id || id === 'new';

    // Form state
    const [courseId, setCourseId] = useState('');
    const [courseTitle, setCourseTitle] = useState('');
    const [courseLtp, setCourseLtp] = useState('');
    const [status, setStatus] = useState('Proposed');
    const [sessionId, setSessionId] = useState('2025-II');
    const [offeringDept, setOfferingDept] = useState('');
    const [slotId, setSlotId] = useState<number | null>(null);

    // Reference data
    const [sessions, setSessions] = useState<Session[]>([]);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [slots, setSlots] = useState<any[]>([]);

    // Instructors
    const [instructors, setInstructors] = useState<Instructor[]>([]);
    const [instructorSearch, setInstructorSearch] = useState('');
    const [instructorResults, setInstructorResults] = useState<any[]>([]);
    const [searchingInstructors, setSearchingInstructors] = useState(false);

    // Crediting feature removed

    // Course search
    const [courseSearch, setCourseSearch] = useState('');
    const [courseResults, setCourseResults] = useState<CourseSearchResult[]>([]);
    const [searchingCourses, setSearchingCourses] = useState(false);
    const [showCourseLookup, setShowCourseLookup] = useState(false);

    // UI State
    const [activeTab, setActiveTab] = useState<'main' | 'enrollments' | 'stats' | 'notes'>('main');
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [offeringId, setOfferingId] = useState<number | null>(null);

    // Enrollments for the enrollments tab
    const [enrollments, setEnrollments] = useState<any[]>([]);

    useEffect(() => {
        loadReferenceData();
        if (!isNew && id) {
            loadOffering(parseInt(id));
        }
    }, [id]);

    const loadReferenceData = async () => {
        try {
            const [sessionsData, deptsData] = await Promise.all([
                api.getAcademicSessions(),
                api.getDepartments()
            ]);
            setSessions(sessionsData.sessions || []);
            setDepartments(deptsData.departments || []);

            // Set current session as default for new offerings
            if (isNew) {
                setSessionId('2025-II');
            }
        } catch (err) {
            console.error('Error loading reference data:', err);
        }
    };

    const loadOffering = async (offeringIdParam: number) => {
        setLoading(true);
        try {
            const data = await api.getOfferingById(offeringIdParam);
            const offering = data.offering;

            setOfferingId(offering.id);
            setCourseId(offering.course_id);
            setCourseTitle(offering.title);
            setCourseLtp(offering.ltp || '');
            setStatus(offering.status);
            setSessionId(offering.session_id);
            setOfferingDept(offering.offering_dept);
            setSlotId(offering.slot_id);
            setInstructors(offering.instructors || []);
        } catch (err) {
            console.error('Error loading offering:', err);
            alert('Failed to load offering');
        } finally {
            setLoading(false);
        }
    };

    // Course search
    const handleCourseSearch = useCallback(async (query: string) => {
        // if (query.length < 2) {
        //     setCourseResults([]);
        //     return;
        // }
        setSearchingCourses(true);
        try {
            const data = await api.searchCourses(query);
            setCourseResults(data.courses || []);
        } catch (err) {
            console.error('Error searching courses:', err);
        } finally {
            setSearchingCourses(false);
        }
    }, []);

    const selectCourse = (course: CourseSearchResult) => {
        setCourseId(course.course_id);
        setCourseTitle(course.title);
        setCourseLtp(course.ltp || '');
        setShowCourseLookup(false);
        setCourseSearch('');
        setCourseResults([]);
    };

    // Instructor search
    const handleInstructorSearch = useCallback(async (query: string) => {
        if (query.length < 2) {
            setInstructorResults([]);
            return;
        }
        setSearchingInstructors(true);
        try {
            const data = await api.searchInstructors(query);
            setInstructorResults(data.instructors || []);
        } catch (err) {
            console.error('Error searching instructors:', err);
        } finally {
            setSearchingInstructors(false);
        }
    }, []);

    const addInstructor = async (instructor: any) => {
        if (!offeringId) {
            // For new offerings, just add to local state
            if (!instructors.find(i => i.instructor_id === instructor.instructor_id)) {
                setInstructors([...instructors, {
                    instructor_id: instructor.instructor_id,
                    email: instructor.email,
                    dept: instructor.dept,
                    is_coordinator: instructors.length === 0
                }]);
            }
        } else {
            try {
                await api.addOfferingInstructor(offeringId, instructor.instructor_id, instructors.length === 0);
                loadOffering(offeringId);
            } catch (err) {
                console.error('Error adding instructor:', err);
                alert('Failed to add instructor');
            }
        }
        setInstructorSearch('');
        setInstructorResults([]);
    };

    const removeInstructor = async (instructorId: string) => {
        if (!offeringId) {
            setInstructors(instructors.filter(i => i.instructor_id !== instructorId));
        } else {
            try {
                await api.removeOfferingInstructor(offeringId, instructorId);
                loadOffering(offeringId);
            } catch (err) {
                console.error('Error removing instructor:', err);
                alert('Failed to remove instructor');
            }
        }
    };

    const toggleCoordinator = async (instructorId: string) => {
        if (!offeringId) {
            setInstructors(instructors.map(i => ({
                ...i,
                is_coordinator: i.instructor_id === instructorId ? !i.is_coordinator : i.is_coordinator
            })));
        } else {
            const instructor = instructors.find(i => i.instructor_id === instructorId);
            if (instructor) {
                try {
                    await api.updateOfferingInstructor(offeringId, instructorId, !instructor.is_coordinator);
                    loadOffering(offeringId);
                } catch (err) {
                    console.error('Error updating instructor:', err);
                }
            }
        }
    };

    // Crediting functions removed

    // Save
    const handleSave = async () => {
        if (!courseId || !sessionId || !offeringDept) {
            alert('Please fill in required fields (Course, Session, Department)');
            return;
        }

        setSaving(true);
        try {
            if (isNew) {
                // For new offerings, submit as proposal for admin approval
                const instructorIds = instructors.map(i => i.instructor_id);
                await api.proposeOffering({
                    courseId,
                    sessionId,
                    offeringDept,
                    slotId: slotId || undefined,
                    instructorIds
                });

                alert('Course proposal submitted for admin approval!');
                navigate('/faculty/offerings');
            } else if (offeringId) {
                await api.updateOfferingApi(offeringId, {
                    courseId,
                    sessionId,
                    offeringDept,
                    slotId: slotId || undefined,
                    status
                });
                alert('Offering saved successfully');
                loadOffering(offeringId);
            }
        } catch (err: any) {
            console.error('Error saving offering:', err);
            alert(err.message || 'Failed to save offering');
        } finally {
            setSaving(false);
        }
    };

    const handleClear = () => {
        setCourseId('');
        setCourseTitle('');
        setCourseLtp('');
        setStatus('Proposed');
        setSlotId(null);
        setInstructors([]);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex flex-col gap-1">
                <h1 className="text-2xl font-bold tracking-tight text-white">Course Offering Details</h1>
            </div>

            {/* Tabs */}
            <div className="flex gap-6 border-b border-white/10">
                {(['main', 'enrollments', 'stats', 'notes'] as const).map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`pb-3 text-sm font-medium transition-colors ${activeTab === tab
                            ? 'text-blue-400 border-b-2 border-blue-400'
                            : 'text-gray-400 hover:text-white'
                            }`}
                    >
                        {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                ))}
            </div>

            {activeTab === 'main' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column - Course Details */}
                    <div className="lg:col-span-2 space-y-6">
                        <Card className="p-5 bg-[#18181b] border-white/10">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Course Selection */}
                                <div className="md:col-span-2">
                                    <label className="text-xs text-gray-500 mb-1.5 block">Course</label>
                                    <div className="flex gap-2">
                                        <div className="flex-1 relative">
                                            <Input
                                                value={courseId ? `${courseId} :: ${courseTitle}(${courseLtp})` : ''}
                                                placeholder="Title or code. Type atleast..."
                                                className="h-[38px]"
                                                readOnly
                                            />
                                        </div>
                                        <Button
                                            variant="secondary"
                                            onClick={() => {
                                                const newState = !showCourseLookup;
                                                setShowCourseLookup(newState);
                                                if (newState) {
                                                    setCourseSearch('');
                                                    handleCourseSearch('');
                                                }
                                            }}
                                        >
                                            {showCourseLookup ? 'Cancel' : 'Lookup'}
                                        </Button>
                                    </div>

                                    {showCourseLookup && (
                                        <div className="mt-2 p-3 bg-black/30 rounded-lg border border-white/10">
                                            <Input
                                                value={courseSearch}
                                                onChange={(e) => {
                                                    setCourseSearch(e.target.value);
                                                    handleCourseSearch(e.target.value);
                                                }}
                                                placeholder="Search by code or title..."
                                                className="mb-2"
                                            />
                                            {searchingCourses && <p className="text-xs text-gray-500">Searching...</p>}
                                            <div className="max-h-40 overflow-auto space-y-1">
                                                {courseResults.map(course => (
                                                    <div
                                                        key={course.course_id}
                                                        onClick={() => selectCourse(course)}
                                                        className="p-2 hover:bg-white/5 rounded cursor-pointer text-sm"
                                                    >
                                                        <span className="text-blue-400 font-mono">{course.course_id}</span>
                                                        <span className="text-gray-300 ml-2">{course.title}</span>
                                                        <span className="text-gray-500 ml-2">({course.ltp})</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Course Status */}
                                <div>
                                    <label className="text-xs text-gray-500 mb-1.5 block">Course Status</label>
                                    <select
                                        value={status}
                                        onChange={(e) => setStatus(e.target.value)}
                                        className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500/50 outline-none"
                                    >
                                        <option value="Proposed">Proposed</option>
                                        <option value="Offered">Offered</option>
                                        <option value="Enrolling">Enrolling</option>
                                        <option value="Withdrawn">Withdrawn</option>
                                    </select>
                                </div>

                                {/* Offering Department */}
                                <div>
                                    <label className="text-xs text-gray-500 mb-1.5 block">Offering Department</label>
                                    <select
                                        value={offeringDept}
                                        onChange={(e) => setOfferingDept(e.target.value)}
                                        className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500/50 outline-none"
                                    >
                                        <option value="">Select...</option>
                                        {departments.map(d => (
                                            <option key={d.dept_code} value={d.dept_code}>{d.name}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Academic Session */}
                                <div>
                                    <label className="text-xs text-gray-500 mb-1.5 block">Academic Session</label>
                                    <div className="flex items-center gap-2">
                                        <select
                                            value="2025-II"
                                            disabled
                                            className="flex-1 bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500/50 outline-none opacity-60 cursor-not-allowed"
                                        >
                                            <option value="2025-II">2025-II</option>
                                        </select>
                                    </div>
                                </div>



                                {/* Slot */}
                                <div>
                                    <label className="text-xs text-gray-500 mb-1.5 block">Slot</label>
                                    <select
                                        value={slotId || ''}
                                        onChange={(e) => setSlotId(e.target.value ? parseInt(e.target.value) : null)}
                                        className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500/50 outline-none"
                                    >
                                        <option value="">Select...</option>
                                        <option value="1">Buffer slot</option>
                                        <option value="2">Lab Courses</option>
                                        <option value="3">Program elec or open elec for 3-4 year B.Tech</option>
                                    </select>
                                </div>
                            </div>
                        </Card>



                        {/* Action Buttons */}
                        <div className="flex gap-3">
                            <Button onClick={handleSave} disabled={saving}>
                                <Save size={16} className="mr-2" />
                                {saving ? 'Saving...' : 'Save'}
                            </Button>
                            <Button variant="secondary" onClick={handleClear}>
                                <X size={16} className="mr-2" />
                                Clear
                            </Button>
                        </div>
                    </div>

                    {/* Right Column - Instructors */}
                    <div className="space-y-6">
                        <Card className="p-5 bg-[#18181b] border-white/10">
                            <div className="mb-4">
                                <Input
                                    value={instructorSearch}
                                    onChange={(e) => {
                                        setInstructorSearch(e.target.value);
                                        handleInstructorSearch(e.target.value);
                                    }}
                                    placeholder="Lookup instructor by name"
                                    className="h-[38px]"
                                />

                                {searchingInstructors && <p className="text-xs text-gray-500 mt-1">Searching...</p>}

                                {instructorResults.length > 0 && (
                                    <div className="mt-2 max-h-32 overflow-auto bg-black/30 rounded border border-white/10">
                                        {instructorResults.map(instructor => (
                                            <div
                                                key={instructor.instructor_id}
                                                onClick={() => addInstructor(instructor)}
                                                className="p-2 hover:bg-white/5 cursor-pointer text-sm text-gray-300"
                                            >
                                                {instructor.email} ({instructor.dept})
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Instructors Table */}
                            <div className="bg-[#1a2e1a] rounded-lg overflow-hidden">
                                <div className="grid grid-cols-12 gap-2 text-xs font-medium text-white bg-[#2a3e2a] px-3 py-2">
                                    <span className="col-span-1">S#</span>
                                    <span className="col-span-6">Instructor</span>
                                    <span className="col-span-3">Is Coord.</span>
                                    <span className="col-span-2">Delete</span>
                                </div>

                                {instructors.length === 0 ? (
                                    <p className="text-xs text-gray-500 p-3">No instructors added</p>
                                ) : (
                                    <div className="divide-y divide-white/5">
                                        {instructors.map((instructor, index) => (
                                            <div key={instructor.instructor_id} className="grid grid-cols-12 gap-2 text-xs text-gray-300 px-3 py-2">
                                                <span className="col-span-1">{index + 1}</span>
                                                <span className="col-span-6">{instructor.email.split('@')[0]}</span>
                                                <span className="col-span-3">
                                                    <input
                                                        type="checkbox"
                                                        checked={instructor.is_coordinator}
                                                        onChange={() => toggleCoordinator(instructor.instructor_id)}
                                                        className="rounded border-white/20"
                                                    />
                                                </span>
                                                <span className="col-span-2">
                                                    <button
                                                        onClick={() => removeInstructor(instructor.instructor_id)}
                                                        className="text-red-400 hover:text-red-300"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </Card>
                    </div>
                </div>
            )}

            {activeTab === 'enrollments' && (
                <Card className="p-5 bg-[#18181b] border-white/10">
                    <h3 className="text-lg font-semibold text-white mb-4">Enrolled Students</h3>
                    <p className="text-gray-500">Enrollment data will be displayed here when the offering is active.</p>
                </Card>
            )}

            {activeTab === 'stats' && (
                <Card className="p-5 bg-[#18181b] border-white/10">
                    <h3 className="text-lg font-semibold text-white mb-4">Statistics</h3>
                    <p className="text-gray-500">Enrollment statistics and charts will be displayed here.</p>
                </Card>
            )}

            {activeTab === 'notes' && (
                <Card className="p-5 bg-[#18181b] border-white/10">
                    <h3 className="text-lg font-semibold text-white mb-4">Course Notes</h3>
                    <p className="text-gray-500">Course announcements and notes will be displayed here.</p>
                </Card>
            )}
        </div>
    );
};

export default CourseOfferingDetails;
