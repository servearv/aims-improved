
import React, { useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Registration from './pages/Academics/Registration';
import Grades from './pages/Academics/Grades';
import Finance from './pages/Finance';
import TimeTable from './pages/Academics/TimeTable';
import StudentRecord from './pages/StudentRecord';
import CourseFeedback from './pages/CourseFeedback';
import Help from './pages/Help';
import Login from './pages/Login';
import AcademicEvents from './pages/Academics/AcademicEvents';
import CoursesOffered from './pages/Academics/CoursesOffered';
import UserManagement from './pages/Admin/UserManagement';
import GradingPortal from './pages/Faculty/GradingPortal';
import AdviseeList from './pages/Advisor/AdviseeList';
import { useAppStore } from './store';

// Auth Guard
const ProtectedRoute = () => {
  const { isAuthenticated } = useAppStore();
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

const App: React.FC = () => {
  const { theme } = useAppStore();

  // Sync theme with HTML class
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  return (
    <HashRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            
            {/* Academic Routes */}
            <Route path="academics">
              <Route path="registration" element={<Registration />} />
              <Route path="courses-offered" element={<CoursesOffered />} />
              <Route path="events" element={<AcademicEvents />} />
              <Route path="grades" element={<Grades />} />
              <Route path="timetable" element={<TimeTable />} />
            </Route>

            {/* Admin Routes */}
            <Route path="admin">
              <Route path="users" element={<UserManagement />} />
              <Route path="analytics" element={<Dashboard />} />
            </Route>

            {/* Faculty Routes */}
            <Route path="faculty">
              <Route path="grading" element={<GradingPortal />} />
            </Route>

            {/* Advisor Routes */}
            <Route path="advisor">
              <Route path="advisees" element={<AdviseeList />} />
              <Route path="audit" element={<AdviseeList />} />
            </Route>

            <Route path="finance" element={<Finance />} />
            <Route path="student-record" element={<StudentRecord />} />
            <Route path="course-feedback" element={<CourseFeedback />} />
            <Route path="help" element={<Help />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  );
};

export default App;