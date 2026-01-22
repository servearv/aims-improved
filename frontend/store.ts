import { create } from 'zustand';
import { User, UserRole, RegistrationRequest, RegistrationStatus, Course } from './types';
import { MOCK_USERS, INITIAL_REQUESTS, MOCK_COURSES } from './constants';

interface AppState {
  theme: 'light' | 'dark';
  isAuthenticated: boolean;
  currentUser: User;
  token: string | null;
  courses: Course[];
  requests: RegistrationRequest[];

  // Actions
  init: () => void;
  toggleTheme: () => void;
  login: (email: string, user?: User, token?: string) => void;
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
  token: null,
  courses: MOCK_COURSES,
  requests: INITIAL_REQUESTS,

  init: () => {
    // Sync across tabs
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'auth_token') {
        if (!e.newValue) {
          set({ isAuthenticated: false, token: null });
        } else {
          const userStr = localStorage.getItem('user');
          if (userStr) {
            set({
              isAuthenticated: true,
              token: e.newValue,
              currentUser: JSON.parse(userStr)
            });
          }
        }
      }
    };
    window.addEventListener('storage', handleStorageChange);

    // Initial load
    const token = localStorage.getItem('auth_token');
    const userStr = localStorage.getItem('user');
    if (token && userStr) {
      set({
        isAuthenticated: true,
        token,
        currentUser: JSON.parse(userStr)
      });
    }

    // Return cleanup (though in this singleton store it's usually fine)
    return () => window.removeEventListener('storage', handleStorageChange);
  },

  toggleTheme: () => {
    set((state) => ({ theme: state.theme === 'dark' ? 'light' : 'dark' }));
  },

  login: (email: string, user?: User, token?: string) => {
    if (user && token) {
      // Backend authentication - use actual user data
      set({
        isAuthenticated: true,
        currentUser: user,
        token: token
      });
      // Store token in localStorage
      localStorage.setItem('auth_token', token);
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      // Fallback to mock logic for demo
      let userToSet = MOCK_USERS.student;

      if (email.includes('prof') || email.includes('dr')) {
        userToSet = MOCK_USERS.instructor;
      } else if (email.includes('advisor')) {
        userToSet = MOCK_USERS.advisor;
      } else if (email.includes('admin')) {
        userToSet = MOCK_USERS.admin;
      }

      const finalUser = { ...userToSet, email: email, availableRoles: [userToSet.role] };

      set({
        isAuthenticated: true,
        currentUser: finalUser,
        token: null
      });
      localStorage.setItem('user', JSON.stringify(finalUser));
    }
  },

  logout: () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    set({
      isAuthenticated: false,
      token: null
    });
  },

  switchRole: (role) => {
    const { currentUser } = get();
    // Only allow switching if the role is available to this user
    if (currentUser.availableRoles && !currentUser.availableRoles.includes(role)) {
      console.warn(`Unauthorized role switch attempt to ${role}`);
      return;
    }

    set((state) => ({
      currentUser: { ...state.currentUser, role }
    }));
    // Sync to localStorage so other tabs know the current role
    localStorage.setItem('user', JSON.stringify({ ...currentUser, role }));
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

// Initialize store immediately to recover session before first render
useAppStore.getState().init();