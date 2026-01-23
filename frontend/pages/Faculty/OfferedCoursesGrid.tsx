import React, { useState, useEffect } from 'react';
import { Card, Button, Badge, Input } from '../../components/ui';
import { useNavigate } from 'react-router-dom';
import { Search, Eraser, ChevronRight, Users, BookOpen, Clock, GraduationCap } from 'lucide-react';
import * as api from '../../utils/api';

interface Offering {
    id: number;
    course_id: string;
    title: string;
    credits: number;
    ltp: string;
    status: string;
    session_id: string;
    session_name: string;
    offering_dept: string;
    dept_name: string;
    section: string;
    slot_timings: string;
    enrolment_count: number;
    instructors: Array<{
        instructor_id: string;
        email: string;
        dept: string;
        is_coordinator: boolean;
    }>;
}

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

const OfferedCoursesGrid: React.FC = () => {
    const navigate = useNavigate();
    const [offerings, setOfferings] = useState<Offering[]>([]);
    const [sessions, setSessions] = useState<Session[]>([]);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [loading, setLoading] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);

    const [filters, setFilters] = useState({
        deptCode: '',
        courseId: '',
        title: '',
        sessionId: '',
        ltp: '',
        instructor: '',
        status: ''
    });

    useEffect(() => {
        loadInitialData();
    }, []);

    const loadInitialData = async () => {
        try {
            const [sessionsData, deptsData] = await Promise.all([
                api.getAcademicSessions(),
                api.getDepartments()
            ]);
            setSessions(sessionsData.sessions || []);
            setDepartments(deptsData.departments || []);

            // Set current session as default
            const currentSession = sessionsData.sessions?.find((s: Session) => s.is_current);
            if (currentSession) {
                setFilters(prev => ({ ...prev, sessionId: currentSession.session_id }));
            }
        } catch (err) {
            console.error('Error loading initial data:', err);
        }
    };

    const handleSearch = async () => {
        try {
            setHasSearched(true);
            setLoading(true);

            const data = await api.getOfferings({
                sessionId: filters.sessionId || undefined,
                deptCode: filters.deptCode || undefined,
                status: filters.status || undefined,
                courseId: filters.courseId || undefined,
                title: filters.title || undefined
            });

            setOfferings(data.offerings || []);
        } catch (err) {
            console.error('Error fetching offerings:', err);
            setOfferings([]);
        } finally {
            setLoading(false);
        }
    };

    const handleReset = () => {
        const currentSession = sessions.find(s => s.is_current);
        setFilters({
            deptCode: '',
            courseId: '',
            title: '',
            sessionId: currentSession?.session_id || '',
            ltp: '',
            instructor: '',
            status: ''
        });
        setOfferings([]);
        setHasSearched(false);
    };

    const handleChange = (field: string, value: string) => {
        setFilters(prev => ({ ...prev, [field]: value }));
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Enrolling': return 'green';
            case 'Offered': return 'blue';
            case 'Proposed': return 'yellow';
            case 'Withdrawn': return 'red';
            default: return 'gray';
        }
    };

    const getInstructorNames = (instructors: Offering['instructors']) => {
        if (!instructors || instructors.length === 0) return 'TBA';
        return instructors.map(i => i.email.split('@')[0]).join(', ');
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

            {/* Page Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white">Offered Courses</h1>
                    <p className="text-gray-400 text-sm">Search and manage courses offered for enrollment.</p>
                </div>
                <Button onClick={() => navigate('/faculty/offerings/new')}>
                    + Offer New Course
                </Button>
            </div>

            {/* Filter Section */}
            <Card className="p-5 bg-[#18181b] border-white/10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8 gap-4 items-end">

                    <div className="xl:col-span-1">
                        <label className="text-xs text-gray-500 mb-1.5 block">Offering Department</label>
                        <select
                            className="w-full bg-black/20 border border-white/10 rounded-lg px-2 py-2 text-xs text-white focus:border-blue-500/50 outline-none"
                            value={filters.deptCode}
                            onChange={(e) => handleChange('deptCode', e.target.value)}
                        >
                            <option value="">All</option>
                            {departments.map(d => (
                                <option key={d.dept_code} value={d.dept_code}>{d.dept_code}</option>
                            ))}
                        </select>
                    </div>

                    <div className="xl:col-span-1">
                        <label className="text-xs text-gray-500 mb-1.5 block">Code</label>
                        <Input
                            placeholder=""
                            className="h-[34px] text-xs"
                            value={filters.courseId}
                            onChange={(e) => handleChange('courseId', e.target.value)}
                        />
                    </div>

                    <div className="xl:col-span-2">
                        <label className="text-xs text-gray-500 mb-1.5 block">Title</label>
                        <Input
                            placeholder=""
                            className="h-[34px] text-xs"
                            value={filters.title}
                            onChange={(e) => handleChange('title', e.target.value)}
                        />
                    </div>

                    <div className="xl:col-span-1">
                        <label className="text-xs text-gray-500 mb-1.5 block">Acad session</label>
                        <div className="flex gap-2 items-center">
                            <select
                                className="flex-1 bg-black/20 border border-white/10 rounded-lg px-2 py-2 text-xs text-white focus:border-blue-500/50 outline-none"
                                value={filters.sessionId}
                                onChange={(e) => handleChange('sessionId', e.target.value)}
                            >
                                <option value="">All</option>
                                {sessions.map(s => (
                                    <option key={s.session_id} value={s.session_id}>
                                        {s.session_id}
                                    </option>
                                ))}
                            </select>
                            <label className="flex items-center gap-1 text-xs text-gray-400">
                                <input type="checkbox" className="rounded border-white/20 bg-black/20" />
                                Other
                            </label>
                        </div>
                    </div>

                    <div className="xl:col-span-1">
                        <label className="text-xs text-gray-500 mb-1.5 block">L-T-P</label>
                        <Input
                            placeholder=""
                            className="h-[34px] text-xs"
                            value={filters.ltp}
                            onChange={(e) => handleChange('ltp', e.target.value)}
                        />
                    </div>

                    <div className="xl:col-span-1">
                        <label className="text-xs text-gray-500 mb-1.5 block">Instructor</label>
                        <Input
                            placeholder=""
                            className="h-[34px] text-xs"
                            value={filters.instructor}
                            onChange={(e) => handleChange('instructor', e.target.value)}
                        />
                    </div>

                    <div className="xl:col-span-1 flex gap-2">
                        <div className="flex-1">
                            <label className="text-xs text-gray-500 mb-1.5 block">Status</label>
                            <select
                                className="w-full bg-black/20 border border-white/10 rounded-lg px-2 py-2 text-xs text-white focus:border-blue-500/50 outline-none"
                                value={filters.status}
                                onChange={(e) => handleChange('status', e.target.value)}
                            >
                                <option value="">All</option>
                                <option value="Enrolling">Enrolling</option>
                                <option value="Offered">Offered</option>
                                <option value="Proposed">Proposed</option>
                                <option value="Withdrawn">Withdrawn</option>
                            </select>
                        </div>
                    </div>

                </div>

                <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/5">
                    <p className="text-[10px] text-gray-500">
                        If you do not find the desired results, please try specifying fewer criteria. All non-empty search fields are used <strong>together</strong> when searching.
                    </p>
                    <div className="flex gap-2">
                        <button
                            onClick={handleSearch}
                            className="w-8 h-8 rounded border border-green-500/30 bg-green-500/10 text-green-500 hover:bg-green-500/20 flex items-center justify-center transition-colors"
                            title="Search"
                        >
                            <Search size={16} />
                        </button>
                        <button
                            onClick={handleReset}
                            className="w-8 h-8 rounded border border-red-500/30 bg-red-500/10 text-red-500 hover:bg-red-500/20 flex items-center justify-center transition-colors"
                            title="Clear"
                        >
                            <Eraser size={16} />
                        </button>
                    </div>
                </div>
            </Card>

            {/* Results Section */}
            <Card className="p-4 bg-[#18181b] border-white/10">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-sm font-semibold text-white">Results</h3>
                    {offerings.length > 9 && (
                        <Button variant="secondary" size="sm">Next</Button>
                    )}
                </div>

                {loading ? (
                    <div className="flex items-center justify-center h-64 text-gray-500">
                        <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mr-3"></div>
                        Loading...
                    </div>
                ) : !hasSearched ? (
                    <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                        <p>Click Search to load courses.</p>
                    </div>
                ) : offerings.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                        <p>No courses found matching criteria.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {offerings.map((offering, index) => (
                            <div
                                key={offering.id}
                                onClick={() => navigate(`/faculty/offerings/${offering.id}`)}
                                className="bg-black/30 border border-white/10 rounded-lg p-4 hover:border-blue-500/30 hover:bg-black/40 transition-all cursor-pointer group"
                            >
                                <div className="flex items-start justify-between mb-2">
                                    <span className="text-blue-400 font-mono text-sm">{index + 1})</span>
                                    <Badge color={getStatusColor(offering.status)}>{offering.status}</Badge>
                                </div>

                                <h4 className="text-blue-400 font-semibold mb-1 group-hover:underline">
                                    {offering.course_id} | {offering.title} | {offering.ltp || '0-0-0'}
                                </h4>

                                <div className="text-xs text-gray-400 space-y-1 mt-3">
                                    <p>
                                        <span className="text-gray-500">Credits</span> {offering.credits}.
                                        <span className="text-gray-500 ml-2">Session</span> {offering.session_id}.
                                        <span className="text-gray-500 ml-2">Enrolment</span> {offering.enrolment_count}
                                    </p>
                                    <p>
                                        in Sec.-{offering.section || 'A'}.
                                        <span className="text-gray-500 ml-1">Offered by</span> {offering.dept_name || offering.offering_dept}.
                                    </p>
                                    <p>
                                        <span className="text-gray-500">Slot</span> {offering.slot_timings || 'TBA'}.
                                        <span className="text-gray-500 ml-1 uppercase">Instructor(s)</span> {getInstructorNames(offering.instructors)}.
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </Card>
        </div>
    );
};

export default OfferedCoursesGrid;
