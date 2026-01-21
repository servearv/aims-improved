import React from 'react';
import { useAppStore } from '../store';
import { UserRole } from '../types';
import { Card, Button, Badge } from '../components/ui';
import { 
  ArrowUpRight, Users, BookOpen, Clock, AlertCircle, AlertTriangle, 
  TrendingUp, Calendar, FileText, CheckCircle, PieChart, GraduationCap
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  LineChart, Line, AreaChart, Area, Pie, Cell 
} from 'recharts';

const Dashboard: React.FC = () => {
  const { currentUser } = useAppStore();

  return (
    <div className="animate-in fade-in duration-500">
      {currentUser.role === UserRole.STUDENT && <StudentDashboard />}
      {currentUser.role === UserRole.INSTRUCTOR && <FacultyDashboard />}
      {currentUser.role === UserRole.ADVISOR && <AdvisorDashboard />} 
      {currentUser.role === UserRole.ADMIN && <AdminDashboard />}
    </div>
  );
};

// --- Student View ---
const StudentDashboard = () => (
  <div className="space-y-6">
    <Notices />
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <StatCard title="CGPA" value="8.92" change="+0.2" icon={ArrowUpRight} />
      <StatCard title="Credits Earned" value="84" subtitle="/ 120 Required" icon={BookOpen} />
      <StatCard title="Attendance" value="92%" change="-1.5%" color="text-yellow-500" icon={Clock} />
      <StatCard title="Active Courses" value="5" subtitle="Spring 2024" icon={Users} />
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card className="lg:col-span-2 p-6">
        <h3 className="text-lg font-semibold mb-6 text-primary">Semester Performance</h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={[
              { sem: 'Sem 1', sgpa: 8.5 }, { sem: 'Sem 2', sgpa: 8.8 }, 
              { sem: 'Sem 3', sgpa: 8.7 }, { sem: 'Sem 4', sgpa: 9.1 },
              { sem: 'Sem 5', sgpa: 8.9 }
            ]}>
              <XAxis dataKey="sem" stroke="var(--text-secondary)" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="var(--text-secondary)" fontSize={12} tickLine={false} axisLine={false} domain={[0, 10]} />
              <Tooltip 
                cursor={{fill: 'var(--bg-glass)'}}
                contentStyle={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)', color: 'var(--text-primary)', borderRadius: '8px' }}
              />
              <Bar dataKey="sgpa" fill="var(--text-primary)" radius={[4, 4, 0, 0]} barSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
      <EventsList />
    </div>
  </div>
);

// --- Faculty View ---
const FacultyDashboard = () => {
  const classPerformance = [
    { range: 'S (10)', count: 5 }, { range: 'A (9)', count: 12 }, 
    { range: 'B (8)', count: 18 }, { range: 'C (7)', count: 8 }, 
    { range: 'D (6)', count: 4 }, { range: 'F (0)', count: 1 }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
           <h1 className="text-2xl font-bold text-primary">Instructor Overview</h1>
           <p className="text-secondary text-sm">Spring Semester 2024</p>
        </div>
        <Button>
           <FileText size={16} className="mr-2" /> Upload Grades
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard title="Total Students" value="142" subtitle="Across 3 Courses" icon={Users} />
        <StatCard title="Avg. Attendance" value="88%" change="+2%" icon={CheckCircle} />
        <StatCard title="Pending Approvals" value="12" subtitle="Course Requests" color="text-yellow-500" icon={Clock} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
         <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 text-primary">Class Performance Distribution</h3>
            <div className="h-64">
               <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={classPerformance}>
                     <XAxis dataKey="range" stroke="var(--text-secondary)" fontSize={12} tickLine={false} />
                     <Tooltip 
                        cursor={{fill: 'var(--bg-glass)'}}
                        contentStyle={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)', borderRadius: '8px' }}
                     />
                     <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={30} />
                  </BarChart>
               </ResponsiveContainer>
            </div>
         </Card>
         <Card className="p-6">
             <h3 className="text-lg font-semibold mb-4 text-primary">Teaching Schedule</h3>
             <div className="space-y-3">
                {['CS101 (L1) - Mon 10:00 AM', 'CS201 (Lab) - Tue 2:00 PM', 'CS101 (T1) - Wed 10:00 AM'].map((cls, i) => (
                   <div key={i} className="flex items-center gap-3 p-3 rounded-lg border border-border bg-surface">
                      <div className="w-10 h-10 rounded bg-blue-500/10 flex items-center justify-center text-blue-500 font-bold text-sm">
                         {i + 1}
                      </div>
                      <span className="font-medium text-primary">{cls}</span>
                   </div>
                ))}
             </div>
         </Card>
      </div>
    </div>
  );
};

// --- Advisor View ---
const AdvisorDashboard = () => {
  const studentStatus = [
    { name: 'Good Standing', value: 35, color: '#22c55e' },
    { name: 'Probation', value: 5, color: '#eab308' },
    { name: 'Critical', value: 2, color: '#ef4444' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
           <h1 className="text-2xl font-bold text-primary">Advisor Dashboard</h1>
           <p className="text-secondary text-sm">Managing 42 Advisees</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <Card className="p-6 flex items-center justify-between">
            <div>
               <p className="text-secondary text-sm">Pending Approvals</p>
               <h2 className="text-3xl font-bold text-primary mt-1">8</h2>
            </div>
            <div className="w-12 h-12 bg-yellow-500/10 text-yellow-500 rounded-full flex items-center justify-center">
               <AlertTriangle size={24} />
            </div>
         </Card>
         <Card className="p-6 flex items-center justify-between">
            <div>
               <p className="text-secondary text-sm">Meetings This Week</p>
               <h2 className="text-3xl font-bold text-primary mt-1">4</h2>
            </div>
            <div className="w-12 h-12 bg-blue-500/10 text-blue-500 rounded-full flex items-center justify-center">
               <Calendar size={24} />
            </div>
         </Card>
         <Card className="p-6 flex items-center justify-between">
            <div>
               <p className="text-secondary text-sm">At Risk Students</p>
               <h2 className="text-3xl font-bold text-red-500 mt-1">2</h2>
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
               <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
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
                  </PieChart>
               </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-4 text-xs text-secondary mt-2">
               {studentStatus.map(s => (
                  <div key={s.name} className="flex items-center gap-1">
                     <div className="w-2 h-2 rounded-full" style={{backgroundColor: s.color}}></div>
                     {s.name}
                  </div>
               ))}
            </div>
         </Card>

         <Card className="lg:col-span-2 p-6">
             <h3 className="text-lg font-semibold mb-4 text-primary">Recent Activity</h3>
             <div className="space-y-4">
                {[
                   { name: 'Rahul Kumar', action: 'Requested approval for CS201', time: '2 hours ago', status: 'Pending' },
                   { name: 'Priya Singh', action: 'Degree audit completed', time: '1 day ago', status: 'Completed' },
                   { name: 'Vikram M', action: 'Flagged for low attendance', time: '2 days ago', status: 'Critical' }
                ].map((act, i) => (
                   <div key={i} className="flex items-center justify-between p-3 border-b border-border last:border-0">
                      <div className="flex items-center gap-3">
                         <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${act.status === 'Critical' ? 'bg-red-500/10 text-red-500' : 'bg-blue-500/10 text-blue-500'}`}>
                            {act.name.charAt(0)}
                         </div>
                         <div>
                            <p className="text-sm font-medium text-primary">{act.name}</p>
                            <p className="text-xs text-secondary">{act.action}</p>
                         </div>
                      </div>
                      <span className="text-xs text-secondary">{act.time}</span>
                   </div>
                ))}
             </div>
         </Card>
      </div>
    </div>
  );
};

// --- Admin View ---
const AdminDashboard = () => {
  const data = [
    { name: 'Jan', students: 400, faculty: 24 },
    { name: 'Feb', students: 300, faculty: 13 },
    { name: 'Mar', students: 500, faculty: 38 },
    { name: 'Apr', students: 280, faculty: 39 },
    { name: 'May', students: 590, faculty: 48 },
    { name: 'Jun', students: 800, faculty: 38 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
         <div>
            <h1 className="text-2xl font-bold text-primary">System Overview</h1>
            <p className="text-secondary text-sm">System Health: <span className="text-green-500">Normal</span></p>
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
         <StatCard title="Total Users" value="1,204" change="+12%" icon={Users} />
         <StatCard title="Active Courses" value="48" icon={BookOpen} />
         <StatCard title="System Load" value="34%" change="-5%" color="text-green-500" icon={TrendingUp} />
         <StatCard title="Storage Used" value="1.2 TB" subtitle="of 5 TB" icon={PieChart} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         <Card className="lg:col-span-2 p-6">
            <h3 className="text-lg font-semibold mb-6 text-primary">Traffic & Enrollment Trends</h3>
            <div className="h-72">
               <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                     <defs>
                        <linearGradient id="colorStudents" x1="0" y1="0" x2="0" y2="1">
                           <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                           <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                        </linearGradient>
                     </defs>
                     <XAxis dataKey="name" stroke="var(--text-secondary)" fontSize={12} tickLine={false} />
                     <YAxis stroke="var(--text-secondary)" fontSize={12} tickLine={false} />
                     <Tooltip contentStyle={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)', borderRadius: '8px' }}/>
                     <Area type="monotone" dataKey="students" stroke="#3b82f6" fillOpacity={1} fill="url(#colorStudents)" />
                  </AreaChart>
               </ResponsiveContainer>
            </div>
         </Card>

         <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 text-primary">System Logs</h3>
            <div className="space-y-4 overflow-y-auto max-h-72 pr-2">
               {[
                  { msg: 'New Course "AI101" Created', type: 'info', time: '10m ago' },
                  { msg: 'User login failed (IP: 192...)', type: 'error', time: '25m ago' },
                  { msg: 'Backup completed successfully', type: 'success', time: '1h ago' },
                  { msg: 'Grade sheet uploaded for CS101', type: 'info', time: '2h ago' },
                  { msg: 'System maintenance scheduled', type: 'warning', time: '5h ago' }
               ].map((log, i) => (
                  <div key={i} className="flex gap-3 items-start text-sm border-b border-border pb-2 last:border-0">
                     <span className={`w-2 h-2 mt-1.5 rounded-full ${
                        log.type === 'error' ? 'bg-red-500' : 
                        log.type === 'success' ? 'bg-green-500' : 
                        log.type === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'
                     }`}></span>
                     <div>
                        <p className="text-primary leading-tight">{log.msg}</p>
                        <p className="text-xs text-secondary mt-1">{log.time}</p>
                     </div>
                  </div>
               ))}
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
        <span className="text-3xl font-bold tracking-tight text-primary">{value}</span>
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