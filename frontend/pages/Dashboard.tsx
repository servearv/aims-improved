import React, { useEffect, useState } from 'react';
import { useAppStore } from '../store';
import { UserRole } from '../types';
import { Card, Button, Badge } from '../components/ui';
import {
   ArrowUpRight, Users, BookOpen, Clock, AlertCircle, AlertTriangle,
   TrendingUp, Calendar, FileText, CheckCircle, PieChart, GraduationCap, Loader2
} from 'lucide-react';
import {
   BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
   LineChart, Line, AreaChart, Area, Pie, Cell, PieChart as RePieChart
} from 'recharts';
import { getDashboardStats } from '../utils/api';

interface DashboardStats {
   role: string;
   stats: any;
}

const Dashboard: React.FC = () => {
   const { currentUser } = useAppStore();
   const [stats, setStats] = useState<any>(null);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState<string | null>(null);

   useEffect(() => {
      fetchStats();
   }, [currentUser.role]);

   const fetchStats = async () => {
      try {
         setLoading(true);
         setError(null);
         const data = await getDashboardStats();
         setStats(data.stats);
      } catch (err: any) {
         console.error('Failed to fetch dashboard stats:', err);
         setError(err.message);
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

   if (error) {
      return (
         <div className="p-8 text-center">
            <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-500" />
            <p className="text-red-400">{error}</p>
            <Button onClick={fetchStats} className="mt-4">Retry</Button>
         </div>
      );
   }

   return (
      <div className="animate-in fade-in duration-500">
         {currentUser.role === UserRole.STUDENT && <StudentDashboard stats={stats} />}
         {currentUser.role === UserRole.INSTRUCTOR && <FacultyDashboard stats={stats} />}
         {currentUser.role === UserRole.ADVISOR && <AdvisorDashboard stats={stats} />}
         {currentUser.role === UserRole.ADMIN && <AdminDashboard stats={stats} />}
      </div>
   );
};

// --- Student View ---
const StudentDashboard = ({ stats }: { stats: any }) => {
   const semesterData = [
      { sem: 'Sem 1', sgpa: stats?.cgpa || 0 },
   ];

   return (
      <div className="space-y-6">
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

// --- Faculty View ---
const FacultyDashboard = ({ stats }: { stats: any }) => {
   return (
      <div className="space-y-6">
         <div className="flex justify-between items-center">
            <div>
               <h1 className="text-2xl font-bold text-primary">Instructor Overview</h1>
               <p className="text-secondary text-sm">{stats?.currentSession || 'Current Session'}</p>
            </div>
            <Button>
               <FileText size={16} className="mr-2" /> Upload Grades
            </Button>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <StatCard
               title="Total Students"
               value={stats?.totalStudents || 0}
               subtitle={`Across ${stats?.courseCount || 0} Courses`}
               icon={Users}
            />
            <StatCard
               title="Active Offerings"
               value={stats?.activeOfferings || 0}
               subtitle={stats?.currentSession || 'Current Session'}
               icon={BookOpen}
            />
            <StatCard
               title="Pending Approvals"
               value={stats?.pendingApprovals || 0}
               subtitle="Course Requests"
               color={stats?.pendingApprovals > 0 ? "text-yellow-500" : undefined}
               icon={Clock}
            />
            <StatCard
               title="Department"
               value={stats?.department || 'N/A'}
               icon={GraduationCap}
            />
         </div>

         <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6">
               <h3 className="text-lg font-semibold mb-4 text-primary">Quick Actions</h3>
               <div className="space-y-3">
                  <Button variant="secondary" className="w-full justify-start">
                     <Users size={16} className="mr-3" /> View Enrollment Requests
                  </Button>
                  <Button variant="secondary" className="w-full justify-start">
                     <BookOpen size={16} className="mr-3" /> Manage Course Offerings
                  </Button>
                  <Button variant="secondary" className="w-full justify-start">
                     <FileText size={16} className="mr-3" /> Enter Grades
                  </Button>
               </div>
            </Card>
            <Card className="p-6">
               <h3 className="text-lg font-semibold mb-4 text-primary">Statistics Summary</h3>
               <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                     <span className="text-secondary">Courses Taught</span>
                     <span className="font-bold text-primary">{stats?.courseCount || 0}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                     <span className="text-secondary">Active Offerings</span>
                     <span className="font-bold text-primary">{stats?.activeOfferings || 0}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                     <span className="text-secondary">Total Enrollments</span>
                     <span className="font-bold text-primary">{stats?.totalStudents || 0}</span>
                  </div>
               </div>
            </Card>
         </div>
      </div>
   );
};

// --- Advisor View ---
const AdvisorDashboard = ({ stats }: { stats: any }) => {
   const studentStatus = [
      { name: 'Good Standing', value: Math.max(0, (stats?.adviseeCount || 0) - (stats?.atRiskStudents || 0)), color: '#22c55e' },
      { name: 'At Risk', value: stats?.atRiskStudents || 0, color: '#ef4444' },
   ];

   return (
      <div className="space-y-6">
         <div className="flex justify-between items-center">
            <div>
               <h1 className="text-2xl font-bold text-primary">Advisor Dashboard</h1>
               <p className="text-secondary text-sm">Managing {stats?.adviseeCount || 0} Advisees</p>
            </div>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-6 flex items-center justify-between">
               <div>
                  <p className="text-secondary text-sm">Pending Approvals</p>
                  <h2 className="text-3xl font-bold text-primary mt-1">{stats?.pendingApprovals || 0}</h2>
               </div>
               <div className="w-12 h-12 bg-yellow-500/10 text-yellow-500 rounded-full flex items-center justify-center">
                  <AlertTriangle size={24} />
               </div>
            </Card>
            <Card className="p-6 flex items-center justify-between">
               <div>
                  <p className="text-secondary text-sm">Total Advisees</p>
                  <h2 className="text-3xl font-bold text-primary mt-1">{stats?.adviseeCount || 0}</h2>
               </div>
               <div className="w-12 h-12 bg-blue-500/10 text-blue-500 rounded-full flex items-center justify-center">
                  <Users size={24} />
               </div>
            </Card>
            <Card className="p-6 flex items-center justify-between">
               <div>
                  <p className="text-secondary text-sm">At Risk Students</p>
                  <h2 className="text-3xl font-bold text-red-500 mt-1">{stats?.atRiskStudents || 0}</h2>
               </div>
               <div className="w-12 h-12 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center">
                  <AlertCircle size={24} />
               </div>
            </Card>
         </div>

         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="p-6">
               <h3 className="text-lg font-semibold mb-4 text-primary">Advisee Status</h3>
               <div className="h-64 flex items-center justify-center">
                  {stats?.adviseeCount > 0 ? (
                     <ResponsiveContainer width="100%" height="100%">
                        <RePieChart>
                           <Pie
                              data={studentStatus}
                              innerRadius={60}
                              outerRadius={80}
                              paddingAngle={5}
                              dataKey="value"
                           >
                              {studentStatus.map((entry, index) => (
                                 <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                           </Pie>
                           <Tooltip />
                        </RePieChart>
                     </ResponsiveContainer>
                  ) : (
                     <p className="text-gray-500">No advisees assigned</p>
                  )}
               </div>
               <div className="flex justify-center gap-4 text-xs text-secondary mt-2">
                  {studentStatus.map(s => (
                     <div key={s.name} className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }}></div>
                        {s.name}
                     </div>
                  ))}
               </div>
            </Card>

            <Card className="lg:col-span-2 p-6">
               <h3 className="text-lg font-semibold mb-4 text-primary">Quick Actions</h3>
               <div className="grid grid-cols-2 gap-4">
                  <Button variant="secondary" className="justify-start h-auto py-4">
                     <div className="text-left">
                        <p className="font-semibold">View Advisees</p>
                        <p className="text-xs text-gray-400 mt-1">Manage student records</p>
                     </div>
                  </Button>
                  <Button variant="secondary" className="justify-start h-auto py-4">
                     <div className="text-left">
                        <p className="font-semibold">Pending Requests</p>
                        <p className="text-xs text-gray-400 mt-1">{stats?.pendingApprovals || 0} awaiting approval</p>
                     </div>
                  </Button>
                  <Button variant="secondary" className="justify-start h-auto py-4">
                     <div className="text-left">
                        <p className="font-semibold">At-Risk Students</p>
                        <p className="text-xs text-gray-400 mt-1">Review students needing attention</p>
                     </div>
                  </Button>
                  <Button variant="secondary" className="justify-start h-auto py-4">
                     <div className="text-left">
                        <p className="font-semibold">Department</p>
                        <p className="text-xs text-gray-400 mt-1">{stats?.department || 'N/A'}</p>
                     </div>
                  </Button>
               </div>
            </Card>
         </div>
      </div>
   );
};

// --- Admin View ---
const AdminDashboard = ({ stats }: { stats: any }) => {
   return (
      <div className="space-y-6">
         <div className="flex justify-between items-center">
            <div>
               <h1 className="text-2xl font-bold text-primary">System Overview</h1>
               <p className="text-secondary text-sm">Session: {stats?.currentSession || 'N/A'}</p>
            </div>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <StatCard
               title="Total Users"
               value={stats?.userCounts?.total || 0}
               icon={Users}
            />
            <StatCard
               title="Active Courses"
               value={stats?.totalCourses || 0}
               icon={BookOpen}
            />
            <StatCard
               title="Active Offerings"
               value={stats?.activeOfferings || 0}
               subtitle={stats?.currentSession}
               icon={TrendingUp}
            />
            <StatCard
               title="Pending Approvals"
               value={stats?.pendingApprovals || 0}
               subtitle="Course Requests"
               color={stats?.pendingApprovals > 0 ? "text-yellow-500" : undefined}
               icon={Clock}
            />
         </div>

         <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6">
               <h3 className="text-lg font-semibold mb-6 text-primary">User Breakdown</h3>
               <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                     <span className="text-blue-400">Students</span>
                     <span className="font-bold text-white">{stats?.userCounts?.students || 0}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                     <span className="text-green-400">Instructors</span>
                     <span className="font-bold text-white">{stats?.userCounts?.instructors || 0}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
                     <span className="text-yellow-400">Advisors</span>
                     <span className="font-bold text-white">{stats?.userCounts?.advisors || 0}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-purple-500/10 rounded-lg border border-purple-500/20">
                     <span className="text-purple-400">Admins</span>
                     <span className="font-bold text-white">{stats?.userCounts?.admins || 0}</span>
                  </div>
               </div>
            </Card>

            <Card className="p-6">
               <h3 className="text-lg font-semibold mb-6 text-primary">Enrollment Statistics</h3>
               <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                     <span className="text-secondary">Total Enrollments</span>
                     <span className="font-bold text-white">{stats?.enrollments?.total || 0}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                     <span className="text-green-400">Approved</span>
                     <span className="font-bold text-white">{stats?.enrollments?.approved || 0}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
                     <span className="text-yellow-400">Pending</span>
                     <span className="font-bold text-white">{stats?.enrollments?.pending || 0}</span>
                  </div>
               </div>
            </Card>
         </div>
      </div>
   );
}

// --- Shared Components ---
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

export default Dashboard;