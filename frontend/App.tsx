
import React, { useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Registration from './pages/Academics/Registration';
import Finance from './pages/Finance';

import Help from './pages/Help';
import Login from './pages/Login';
import AcademicEvents from './pages/Academics/AcademicEvents';
import CoursesOffered from './pages/Academics/CoursesOffered';
import UserManagement from './pages/Admin/UserManagement';
import PendingApprovals from './pages/Admin/PendingApprovals';
import GradingPortal from './pages/Faculty/GradingPortal';
import OfferedCoursesGrid from './pages/Faculty/OfferedCoursesGrid';
import CourseOfferingDetails from './pages/Faculty/CourseOfferingDetails';
import UploadGrades from './pages/Faculty/UploadGrades';
import AdviseeList from './pages/Advisor/AdviseeList';
import EnrollmentRequests from './pages/Faculty/EnrollmentRequests';
import { useAppStore } from './store';

// Student Imports
import StudentDashboard from './pages/Student/Dashboard';
import StudentRegistration from './pages/Student/CourseRegistration';
import StudentGrades from './pages/Student/Grades';
import StudentTimeTable from './pages/Student/TimeTable';
import StudentCourses from './pages/Student/CoursesOffered';
import StudentFeedback from './pages/Student/CourseFeedback';

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

  // Note: For '/' route, we keep the main Dashboard which handles role-switching.
  // But for direct links, we point to specific student pages.

  return (
    <HashRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />

            {/* Student Routes */}
            <Route path="student">
              <Route path="dashboard" element={<StudentDashboard />} />
              <Route path="registration" element={<StudentRegistration />} />
              <Route path="courses" element={<StudentCourses />} />
              <Route path="grades" element={<StudentGrades />} />
              <Route path="timetable" element={<StudentTimeTable />} />
              <Route path="feedback" element={<StudentFeedback />} />
            </Route>

            {/* Academic Routes (Legacy/Shared) */}
            <Route path="academics">
              <Route path="registration" element={<Registration />} />
              <Route path="courses-offered" element={<CoursesOffered />} />
              <Route path="events" element={<AcademicEvents />} />
              <Route path="grades" element={<StudentGrades />} />
              <Route path="timetable" element={<StudentTimeTable />} />
            </Route>

            {/* Admin Routes */}
            <Route path="admin">
              <Route path="users" element={<UserManagement />} />
              <Route path="analytics" element={<Dashboard />} />
              <Route path="pending-approvals" element={<PendingApprovals />} />
            </Route>

            {/* Faculty Routes */}
            <Route path="faculty">
              <Route path="grading" element={<GradingPortal />} />
              <Route path="offerings" element={<OfferedCoursesGrid />} />
              <Route path="offerings/new" element={<CourseOfferingDetails />} />
              <Route path="offerings/:id" element={<CourseOfferingDetails />} />
              <Route path="approvals" element={<EnrollmentRequests />} />
              <Route path="grades/upload" element={<UploadGrades />} />
            </Route>

            {/* Advisor Routes */}
            <Route path="advisor">
              <Route path="advisees" element={<AdviseeList />} />
              <Route path="audit" element={<AdviseeList />} />
            </Route>

            <Route path="finance" element={<Finance />} />

            <Route path="course-feedback" element={<StudentFeedback />} />
            <Route path="help" element={<Help />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  );
};

export default App;