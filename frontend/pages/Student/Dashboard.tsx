import React, { useEffect, useState } from 'react';
import { Card, Button } from '../../components/ui';
import {
    ArrowUpRight, Users, BookOpen, Clock, AlertCircle, Loader2
} from 'lucide-react';
import { getDashboardStats } from '../../utils/api';

// --- Shared Components (Duplicated for independence) ---
const StatCard: React.FC<any> = ({ title, value, subtitle, change, color, icon: Icon }) => (
    <Card className="p-5 flex flex-col justify-between h-32 hover:border-secondary transition-colors group relative overflow-hidden">
        <div className="flex justify-between items-start z-10">
            <span className="text-secondary text-sm font-medium">{title}</span>
            {Icon && <Icon size={16} className="text-secondary group-hover:text-primary transition-colors" />}
        </div>
        <div className="z-10">
            <div className="flex items-end gap-2">
                <span className={`text-3xl font-bold tracking-tight ${color || 'text-primary'}`}>{value}</span>
                {change && (
                    <span className={`text-xs font-medium mb-1 ${change.startsWith('+') ? 'text-green-500' : (color || 'text-red-500')}`}>
                        {change}
                    </span>
                )}
            </div>
            {subtitle && <p className="text-xs text-secondary mt-1">{subtitle}</p>}
        </div>
        {/* Decorative background element */}
        <div className="absolute -bottom-4 -right-4 text-primary/5 transform rotate-12">
            {Icon && <Icon size={64} />}
        </div>
    </Card>
);

const Notices = () => (
    <div className="space-y-4 mb-8">
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex gap-4">
            <div className="flex-shrink-0">
                <AlertCircle className="text-red-500" size={24} />
            </div>
            <div className="space-y-2">
                <h3 className="text-red-500 font-semibold text-lg">Academic Information Management System</h3>
                <p className="text-secondary text-sm">
                    Please proceed by choosing a menu item from the sidebar. Before contacting support, please check the User Guide.
                </p>
            </div>
        </div>
    </div>
);

const EventsList = () => (
    <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 text-primary">Upcoming Events</h3>
        <div className="space-y-4">
            {[
                { title: "Mid-Sem Exam: CS201", date: "Mar 15, 10:00 AM", type: "Exam" },
                { title: "Project Submission", date: "Mar 20, 11:59 PM", type: "Deadline" },
                { title: "Guest Lecture", date: "Mar 22, 02:00 PM", type: "Event" },
            ].map((event, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-glass border border-glassBorder hover:bg-glass/50 transition-colors">
                    <div className="w-10 h-10 rounded-lg bg-surface border border-border flex flex-col items-center justify-center text-xs">
                        <span className="font-bold text-secondary">{event.date.split(' ')[0]}</span>
                        <span className="font-bold text-primary">{event.date.split(' ')[1].replace(',', '')}</span>
                    </div>
                    <div>
                        <p className="font-medium text-sm text-primary">{event.title}</p>
                        <p className="text-xs text-secondary">{event.date.split(',')[1]}</p>
                    </div>
                </div>
            ))}
        </div>
    </Card>
);

const StudentDashboard = ({ stats: initialStats }: { stats?: any }) => {
    const [stats, setStats] = useState<any>(initialStats);
    const [loading, setLoading] = useState(!initialStats);

    useEffect(() => {
        if (!initialStats) {
            fetchStats();
        }
    }, []);

    const fetchStats = async () => {
        try {
            setLoading(true);
            const data = await getDashboardStats();
            setStats(data.stats);
        } catch (err) {
            console.error('Failed to fetch stats:', err);
        } finally {
            setLoading(false);
        }
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
            <Notices />
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <StatCard
                    title="CGPA"
                    value={stats?.cgpa?.toFixed(2) || '0.00'}
                    icon={ArrowUpRight}
                />
                <StatCard
                    title="Credits Earned"
                    value={stats?.creditsEarned || 0}
                    subtitle={`/ ${stats?.creditsRequired || 160} Required`}
                    icon={BookOpen}
                />
                <StatCard
                    title="Active Courses"
                    value={stats?.activeCourses || 0}
                    subtitle={stats?.currentSession || 'Current Session'}
                    icon={Users}
                />
                <StatCard
                    title="Pending Approvals"
                    value={stats?.pendingApprovals || 0}
                    subtitle="Registration Requests"
                    icon={Clock}
                    color={stats?.pendingApprovals > 0 ? "text-yellow-500" : undefined}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2 p-6">
                    <h3 className="text-lg font-semibold mb-6 text-primary">Academic Summary</h3>
                    <div className="grid grid-cols-2 gap-6">
                        <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                            <p className="text-secondary text-sm">Entry Number</p>
                            <p className="text-xl font-bold text-primary mt-1">{stats?.entryNo || 'N/A'}</p>
                        </div>
                        <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                            <p className="text-secondary text-sm">Batch</p>
                            <p className="text-xl font-bold text-primary mt-1">{stats?.batch || 'N/A'}</p>
                        </div>
                        <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                            <p className="text-secondary text-sm">Current Session</p>
                            <p className="text-xl font-bold text-primary mt-1">{stats?.currentSession || 'N/A'}</p>
                        </div>
                        <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                            <p className="text-secondary text-sm">Credits Progress</p>
                            <p className="text-xl font-bold text-primary mt-1">
                                {Math.round(((stats?.creditsEarned || 0) / (stats?.creditsRequired || 160)) * 100)}%
                            </p>
                        </div>
                    </div>
                </Card>
                <EventsList />
            </div>
        </div>
    );
};

export default StudentDashboard;
