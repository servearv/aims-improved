import { create } from 'zustand';
import { User, UserRole, RegistrationRequest, RegistrationStatus, Course } from './types';
import {
  getAllCourses,
  getRegistrationRequests,
  getStudentCourses,
  enrollInCourse,
  updateRegistrationStatus
} from './utils/api';

interface AppState {
  theme: 'light' | 'dark';
  isAuthenticated: boolean;
  currentUser: User;
  token: string | null;
  courses: Course[];
  requests: RegistrationRequest[];

  // Actions
  init: () => Promise<void>;
  toggleTheme: () => void;
  login: (email: string, user: User, token: string) => void;
  logout: () => void;
  switchRole: (role: UserRole) => void;

  // Data Actions
  fetchData: () => Promise<void>;
  enrollCourse: (courseId: string, semester: string) => Promise<void>;
  handleRequestAction: (requestId: string, status: RegistrationStatus) => Promise<void>;
}

export const useAppStore = create<AppState>((set, get) => ({
  theme: 'dark',
  isAuthenticated: false,
  currentUser: {
    id: '',
    name: '',
    email: '',
    role: UserRole.STUDENT,
    status: 'Active'
  } as User,
  token: null,
  courses: [],
  requests: [],

  init: async () => {
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
            get().fetchData();
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
      await get().fetchData();
    }

    return () => window.removeEventListener('storage', handleStorageChange);
  },

  toggleTheme: () => {
    set((state) => ({ theme: state.theme === 'dark' ? 'light' : 'dark' }));
  },

  login: (email, user, token) => {
    set({
      isAuthenticated: true,
      currentUser: user,
      token: token
    });
    localStorage.setItem('auth_token', token);
    localStorage.setItem('user', JSON.stringify(user));
    get().fetchData();
  },

  logout: () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    set({
      isAuthenticated: false,
      token: null,
      courses: [],
      requests: []
    });
  },

  switchRole: (role) => {
    const { currentUser } = get();
    // Only allow switching if the role is available to this user
    if (currentUser.availableRoles && !currentUser.availableRoles.includes(role)) {
      console.warn(`Unauthorized role switch attempt to ${role}`);
      return;
    }

    const updatedUser = { ...currentUser, role };
    set({ currentUser: updatedUser });
    localStorage.setItem('user', JSON.stringify(updatedUser));
    get().fetchData();
  },

  fetchData: async () => {
    const { token, currentUser } = get();
    if (!token) return;

    try {
      // Fetch Courses
      const coursesData = await getAllCourses();
      // Ensure coursesData is array or extract from property
      const coursesList = Array.isArray(coursesData) ? coursesData : (coursesData.courses || []);
      set({ courses: coursesList });

      // Fetch Requests based on role
      if (currentUser.role === UserRole.STUDENT) {
        // For students, requests usually show their enrollments status
        const myCoursesData = await getStudentCourses();
        const myEnrollments = myCoursesData.enrollments || (Array.isArray(myCoursesData) ? myCoursesData : []);

        // Map to RegistrationRequest format
        const requests = myEnrollments.map((c: any) => ({
          id: c.id ? String(c.id) : `req-${Math.random()}`,
          studentId: currentUser.id,
          studentName: currentUser.name,
          courseId: c.course_id,
          courseName: c.course_title || c.course?.title || c.course_id,
          status: c.status,
          timestamp: c.created_at || new Date().toISOString()
        }));
        set({ requests });
      } else if ([UserRole.INSTRUCTOR, UserRole.ADVISOR, UserRole.ADMIN].includes(currentUser.role)) {
        // For staff, requests are those pending their approval
        const statusFilter = currentUser.role === UserRole.INSTRUCTOR ? RegistrationStatus.PENDING_INSTRUCTOR :
          currentUser.role === UserRole.ADVISOR ? RegistrationStatus.PENDING_ADVISOR : undefined;

        const reqsData = await getRegistrationRequests({ status: statusFilter });
        const pendingRequests = reqsData.requests || (Array.isArray(reqsData) ? reqsData : []);
        set({ requests: pendingRequests });
      }
    } catch (e) {
      console.error("Failed to fetch data", e);
    }
  },

  enrollCourse: async (courseId, semester) => {
    try {
      await enrollInCourse(courseId, semester);
      get().fetchData();
    } catch (e) {
      console.error(e);
      throw e;
    }
  },

  handleRequestAction: async (requestId, status) => {
    try {
      // Backend expects number ID usually but let's handle string
      const id = parseInt(requestId);
      if (isNaN(id)) throw new Error("Invalid Request ID");
      await updateRegistrationStatus(id, status);
      get().fetchData();
    } catch (e) {
      console.error(e);
      throw e;
    }
  }
}));

// Initialize store immediately
useAppStore.getState().init();