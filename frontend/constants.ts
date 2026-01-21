
import { Course, RegistrationRequest, RegistrationStatus, User, UserRole, Advisee, StudentGradeRecord } from "./types";

export const MOCK_USERS: Record<string, User> = {
  student: {
    id: "s1",
    name: "Aravind Verma",
    email: "aravind.v@iitrpr.ac.in",
    role: UserRole.STUDENT,
    avatarUrl: "https://picsum.photos/seed/student/200/200",
    department: "CSE",
    status: 'Active'
  },
  instructor: {
    id: "i1",
    name: "Dr. S. K. Das",
    email: "skdas@iitrpr.ac.in",
    role: UserRole.INSTRUCTOR,
    avatarUrl: "https://picsum.photos/seed/prof/200/200",
    department: "CSE",
    status: 'Active'
  },
  advisor: {
    id: "a1",
    name: "Prof. R. Gupta",
    email: "rgupta@iitrpr.ac.in",
    role: UserRole.ADVISOR,
    avatarUrl: "https://picsum.photos/seed/advisor/200/200",
    department: "ME",
    status: 'Active'
  },
  admin: {
    id: "admin1",
    name: "Admin Office",
    email: "admin@iitrpr.ac.in",
    role: UserRole.ADMIN,
    avatarUrl: "https://picsum.photos/seed/admin/200/200",
    status: 'Active'
  }
};

export const MOCK_COURSES: Course[] = [
  { 
    id: "c1", code: "CS101", name: "Intro to Programming", credits: 4, 
    instructorId: "i1", instructorName: "Dr. S. K. Das", schedule: "Mon, Wed 10:00 AM",
    department: "CSE", ltp: "3-0-2", session: "2024-II", status: "Offered"
  },
  { 
    id: "c2", code: "CS201", name: "Data Structures", credits: 4, 
    instructorId: "i2", instructorName: "Dr. P. Kumar", schedule: "Tue, Thu 11:30 AM",
    department: "CSE", ltp: "3-1-0", session: "2024-II", status: "Offered"
  },
  { 
    id: "c3", code: "MA102", name: "Linear Algebra", credits: 3, 
    instructorId: "i1", instructorName: "Dr. S. K. Das", schedule: "Mon, Wed 02:00 PM",
    department: "Math", ltp: "3-0-0", session: "2024-II", status: "Offered"
  },
  { 
    id: "c4", code: "PH101", name: "Physics I", credits: 4, 
    instructorId: "i3", instructorName: "Dr. A. Singh", schedule: "Fri 09:00 AM",
    department: "Physics", ltp: "3-0-2", session: "2024-II", status: "Offered"
  },
];

export const INITIAL_REQUESTS: RegistrationRequest[] = [
  {
    id: "r1",
    studentId: "s1",
    studentName: "Aravind Verma",
    courseId: "c2",
    courseName: "Data Structures",
    status: RegistrationStatus.PENDING_INSTRUCTOR,
    timestamp: new Date().toISOString()
  },
  {
    id: "r2",
    studentId: "s2",
    studentName: "Rahul Sharma",
    courseId: "c1",
    courseName: "Intro to Programming",
    status: RegistrationStatus.PENDING_ADVISOR, 
    timestamp: new Date().toISOString()
  },
  {
    id: "r3",
    studentId: "s1",
    studentName: "Aravind Verma",
    courseId: "c4",
    courseName: "Physics I",
    status: RegistrationStatus.APPROVED,
    timestamp: new Date(Date.now() - 86400000).toISOString()
  }
];

export const MOCK_ADVISEES: Advisee[] = [
  { id: '1', name: 'Aravind Verma', rollNo: '2023CSB1103', cgpa: 8.62, creditsEarned: 88, creditsRequired: 120, status: 'Good Standing', lastMeeting: '2024-01-15' },
  { id: '2', name: 'Priya Singh', rollNo: '2023CSB1105', cgpa: 9.1, creditsEarned: 92, creditsRequired: 120, status: 'Good Standing', lastMeeting: '2024-02-01' },
  { id: '3', name: 'Rahul Kumar', rollNo: '2023CSB1112', cgpa: 6.8, creditsEarned: 70, creditsRequired: 120, status: 'Probation', lastMeeting: '2023-11-20' },
  { id: '4', name: 'Sneha Gupta', rollNo: '2023CSB1115', cgpa: 8.2, creditsEarned: 85, creditsRequired: 120, status: 'Good Standing', lastMeeting: '2024-01-10' },
  { id: '5', name: 'Vikram Malhotra', rollNo: '2023CSB1120', cgpa: 5.4, creditsEarned: 60, creditsRequired: 120, status: 'Critical', lastMeeting: '2023-10-05' },
];

export const MOCK_GRADES: StudentGradeRecord[] = [
  { studentId: '1', name: 'Aravind Verma', rollNo: '2023CSB1103', midSem: 25, endSem: 45, internal: 18, total: 88, grade: 'A-' },
  { studentId: '2', name: 'Priya Singh', rollNo: '2023CSB1105', midSem: 28, endSem: 48, internal: 19, total: 95, grade: 'A' },
  { studentId: '3', name: 'Rahul Kumar', rollNo: '2023CSB1112', midSem: 15, endSem: 30, internal: 12, total: 57, grade: 'C' },
  { studentId: '4', name: 'Sneha Gupta', rollNo: '2023CSB1115', midSem: 22, endSem: 40, internal: 16, total: 78, grade: 'B' },
];