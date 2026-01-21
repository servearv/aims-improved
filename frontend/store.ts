import { create } from 'zustand';
import { User, UserRole, RegistrationRequest, RegistrationStatus, Course } from './types';
import { MOCK_USERS, INITIAL_REQUESTS, MOCK_COURSES } from './constants';

interface AppState {
  theme: 'light' | 'dark';
  isAuthenticated: boolean;
  currentUser: User;
  courses: Course[];
  requests: RegistrationRequest[];
  
  // Actions
  toggleTheme: () => void;
  login: (email: string) => void;
  logout: () => void;
  switchRole: (role: UserRole) => void;
  
  // Registration Actions
  addRequest: (courseId: string) => void;
  updateRequestStatus: (requestId: string, newStatus: RegistrationStatus) => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  theme: 'dark', // Default
  isAuthenticated: false, // Default to false to show Login screen first
  currentUser: MOCK_USERS.student,
  courses: MOCK_COURSES,
  requests: INITIAL_REQUESTS,

  toggleTheme: () => {
    set((state) => ({ theme: state.theme === 'dark' ? 'light' : 'dark' }));
  },

  login: (email: string) => {
    // Simple mock logic to map emails to roles for the demo
    let userToSet = MOCK_USERS.student;
    
    if (email.includes('prof') || email.includes('dr')) {
      userToSet = MOCK_USERS.instructor;
    } else if (email.includes('advisor')) {
      userToSet = MOCK_USERS.advisor;
    } else if (email.includes('admin')) {
      userToSet = MOCK_USERS.admin;
    }

    set({ 
      isAuthenticated: true, 
      currentUser: { ...userToSet, email: email } 
    });
  },

  logout: () => {
    set({ isAuthenticated: false });
  },

  switchRole: (role) => {
    let newUser = MOCK_USERS.student;
    if (role === UserRole.INSTRUCTOR) newUser = MOCK_USERS.instructor;
    if (role === UserRole.ADVISOR) newUser = MOCK_USERS.advisor;
    if (role === UserRole.ADMIN) newUser = MOCK_USERS.admin;
    set({ currentUser: newUser });
  },

  addRequest: (courseId) => {
    const { currentUser, courses, requests } = get();
    const course = courses.find(c => c.id === courseId);
    if (!course) return;

    // Check if already exists
    if (requests.find(r => r.courseId === courseId && r.studentId === currentUser.id)) {
      return;
    }

    const newRequest: RegistrationRequest = {
      id: `req-${Date.now()}`,
      studentId: currentUser.id,
      studentName: currentUser.name,
      courseId: course.id,
      courseName: course.name,
      status: RegistrationStatus.PENDING_INSTRUCTOR, // Initial state
      timestamp: new Date().toISOString()
    };

    set({ requests: [...requests, newRequest] });
  },

  updateRequestStatus: (requestId, newStatus) => {
    set((state) => ({
      requests: state.requests.map(r => 
        r.id === requestId ? { ...r, status: newStatus } : r
      )
    }));
  }
}));