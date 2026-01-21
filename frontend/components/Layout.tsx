import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  BookOpen, 
  GraduationCap, 
  CalendarDays, 
  CreditCard, 
  Settings, 
  LogOut, 
  Bell,
  Menu,
  Search,
  ChevronRight,
  FileText,
  MessageSquare,
  HelpCircle,
  CalendarRange,
  ListFilter,
  Sun,
  Moon,
  Sparkles,
  Users,
  ClipboardCheck,
  FileBarChart,
  ShieldAlert,
  Server
} from 'lucide-react';
import { useAppStore } from '../store';
import { UserRole } from '../types';
import GeminiAssistant from './GeminiAssistant';
import CommandPalette from './CommandPalette';

const Layout: React.FC = () => {
  const { currentUser, switchRole, logout, theme, toggleTheme } = useAppStore();
  
  // UI States
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // CMD/CTRL + K for Palette
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsPaletteOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Define navigation items per role
  const getNavItems = (role: UserRole) => {
    const common = [
      { label: 'Help & Support', icon: HelpCircle, path: '/help' },
    ];

    switch (role) {
      case UserRole.ADMIN:
        return [
          { label: 'Admin Dashboard', icon: LayoutDashboard, path: '/' },
          { label: 'User Management', icon: Users, path: '/admin/users' },
          { label: 'Course Catalog', icon: BookOpen, path: '/academics/courses-offered' },
          { label: 'System Analytics', icon: Server, path: '/admin/analytics' },
          { label: 'Finance Overview', icon: CreditCard, path: '/finance' },
          ...common
        ];
      case UserRole.INSTRUCTOR:
        return [
          { label: 'Faculty Dashboard', icon: LayoutDashboard, path: '/' },
          { label: 'My Courses', icon: BookOpen, path: '/academics/courses-offered' },
          { label: 'Grading Portal', icon: ClipboardCheck, path: '/faculty/grading' },
          { label: 'Student Approvals', icon: FileBarChart, path: '/academics/registration' },
          { label: 'Schedule', icon: CalendarDays, path: '/academics/timetable' },
          ...common
        ];
      case UserRole.ADVISOR:
        return [
          { label: 'Advisor Dashboard', icon: LayoutDashboard, path: '/' },
          { label: 'Advisee List', icon: Users, path: '/advisor/advisees' },
          { label: 'Registration Approval', icon: ClipboardCheck, path: '/academics/registration' },
          { label: 'Degree Audit', icon: GraduationCap, path: '/advisor/audit' },
          ...common
        ];
      case UserRole.STUDENT:
      default:
        return [
          { label: 'Dashboard', icon: LayoutDashboard, path: '/' },
          { label: 'Academics', icon: BookOpen, path: '/academics/registration' },
          { label: 'Courses Offered', icon: ListFilter, path: '/academics/courses-offered' },
          { label: 'Academic Events', icon: CalendarRange, path: '/academics/events' },
          { label: 'Grades', icon: GraduationCap, path: '/academics/grades' },
          { label: 'Timetable', icon: CalendarDays, path: '/academics/timetable' },
          { label: 'Student Record', icon: FileText, path: '/student-record' },
          { label: 'Course Feedback', icon: MessageSquare, path: '/course-feedback' },
          { label: 'Finance', icon: CreditCard, path: '/finance' },
          ...common
        ];
    }
  };

  const navItems = getNavItems(currentUser.role);

  return (
    <div className="min-h-screen bg-background text-primary flex overflow-hidden font-sans selection:bg-blue-500/30 transition-colors duration-300">
      
      {/* Global Overlays */}
      <GeminiAssistant isOpen={isAssistantOpen} onClose={() => setIsAssistantOpen(false)} />
      <CommandPalette isOpen={isPaletteOpen} onClose={() => setIsPaletteOpen(false)} />

      {/* Sidebar (Desktop) */}
      <aside className={`fixed md:relative inset-y-0 left-0 w-72 bg-background border-r border-border transform transition-transform duration-300 z-30 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className="h-16 flex items-center px-6 gap-3 border-b border-border">
          <div className="w-8 h-8 rounded-lg bg-primary text-background flex items-center justify-center shadow-lg">
            <span className="font-bold text-lg tracking-tighter">A</span>
          </div>
          <span className="font-semibold text-lg tracking-tight">
            AIMS Portal
          </span>
          <button onClick={() => setIsMobileMenuOpen(false)} className="md:hidden ml-auto text-secondary">
             <Menu size={20} />
          </button>
        </div>

        <div className="p-4 flex-1 overflow-y-auto h-[calc(100vh-8rem)]">
           {/* Role Switcher for Demo */}
           <div className="mb-8">
             <div className="px-3 mb-2 flex items-center justify-between">
               <label className="text-[10px] font-semibold text-secondary uppercase tracking-wider">Stakeholder View</label>
             </div>
             <div className="relative group">
               <select 
                 className="w-full appearance-none bg-surface border border-border rounded-xl px-4 py-2.5 text-xs text-primary outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all cursor-pointer hover:bg-glass"
                 value={currentUser.role}
                 onChange={(e) => switchRole(e.target.value as UserRole)}
               >
                 <option value={UserRole.STUDENT}>Student Account</option>
                 <option value={UserRole.INSTRUCTOR}>Faculty Instructor</option>
                 <option value={UserRole.ADVISOR}>Faculty Advisor</option>
                 <option value={UserRole.ADMIN}>Administrator</option>
               </select>
               <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-secondary">
                 <Settings size={12} />
               </div>
             </div>
           </div>

           <div className="px-3 mb-2">
             <label className="text-[10px] font-semibold text-secondary uppercase tracking-wider">Main Menu</label>
           </div>
           <nav className="space-y-1">
             {navItems.map((item) => (
               <NavLink
                 key={item.path}
                 to={item.path}
                 onClick={() => setIsMobileMenuOpen(false)}
                 className={({ isActive }) => `
                   group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 border border-transparent
                   ${isActive 
                     ? 'bg-glass text-primary border-glassBorder shadow-sm' 
                     : 'text-secondary hover:text-primary hover:bg-glass'}
                 `}
               >
                 {({ isActive }) => (
                   <>
                     <item.icon size={18} className={isActive ? "text-blue-500" : "text-secondary group-hover:text-primary"} />
                     {item.label}
                     {isActive && (
                       <ChevronRight size={14} className="ml-auto text-secondary" />
                     )}
                   </>
                 )}
               </NavLink>
             ))}
           </nav>
        </div>

        <div className="absolute bottom-0 left-0 w-full p-4 border-t border-border bg-background">
          <div className="flex items-center gap-3 p-2.5 rounded-xl bg-surface border border-border hover:border-glassBorder transition-colors cursor-pointer group">
            <div className="relative">
              <img src={currentUser.avatarUrl} alt="Avatar" className="w-9 h-9 rounded-full bg-gray-700 object-cover" />
              <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 border-2 border-surface rounded-full"></div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate text-primary group-hover:text-blue-500 transition-colors">{currentUser.name}</p>
              <p className="text-xs text-secondary truncate capitalize">{currentUser.role.toLowerCase()}</p>
            </div>
            <button onClick={logout} className="p-1 hover:bg-glass rounded-lg transition-colors" title="Log Out">
               <LogOut size={16} className="text-secondary hover:text-red-500 transition-colors" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 relative bg-background">
        {/* Top Header */}
        <header className="h-16 border-b border-border bg-background/80 backdrop-blur-xl sticky top-0 z-20 flex items-center justify-between px-6 md:px-8 transition-colors duration-300">
          <div className="flex items-center gap-4 flex-1">
             <button onClick={() => setIsMobileMenuOpen(true)} className="md:hidden text-secondary hover:text-primary">
               <Menu size={20} />
             </button>
             
             {/* Command Palette Trigger */}
             <div 
               onClick={() => setIsPaletteOpen(true)}
               className="hidden md:flex items-center gap-3 px-3 py-2 rounded-lg bg-surface border border-border text-secondary text-sm w-full max-w-md cursor-pointer hover:border-glassBorder hover:text-primary transition-all group"
             >
               <Search size={14} className="text-secondary group-hover:text-primary" />
               <span>Search...</span>
               <div className="ml-auto flex gap-1">
                 <span className="text-[10px] bg-glass px-1.5 py-0.5 rounded border border-glassBorder">⌘</span>
                 <span className="text-[10px] bg-glass px-1.5 py-0.5 rounded border border-glassBorder">K</span>
               </div>
             </div>
          </div>

          <div className="flex items-center gap-3 ml-4">
             {currentUser.role === UserRole.ADMIN && (
               <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-red-500/10 text-red-500 rounded-full border border-red-500/20 text-xs font-bold uppercase tracking-wider">
                 <ShieldAlert size={12} /> Admin Mode
               </div>
             )}
            
             <button 
               onClick={() => setIsAssistantOpen(true)}
               className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-full text-xs font-medium shadow-lg shadow-blue-500/20 transition-all hover:scale-105"
             >
               <Sparkles size={14} />
               <span className="hidden sm:inline">Ask AI</span>
             </button>

             <div className="h-6 w-px bg-border mx-1"></div>

             <button 
               onClick={toggleTheme}
               className="p-2 text-secondary hover:text-primary hover:bg-glass rounded-full transition-colors"
               title={theme === 'dark' ? "Switch to Light Mode" : "Switch to Dark Mode"}
             >
               {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
             </button>
             
             <button className="relative p-2 text-secondary hover:text-primary hover:bg-glass rounded-full transition-colors">
               <Bell size={18} />
               <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-background"></span>
             </button>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 scroll-smooth">
           <div className="max-w-7xl mx-auto">
             <Outlet />
           </div>
        </div>
      </main>
    </div>
  );
};

export default Layout;