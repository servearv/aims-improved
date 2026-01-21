
// Role Definitions
export enum UserRole {
  STUDENT = 'STUDENT',
  INSTRUCTOR = 'INSTRUCTOR',
  ADVISOR = 'ADVISOR',
  ADMIN = 'ADMIN'
}

// Course Registration State Machine
export enum RegistrationStatus {
  NOT_REGISTERED = 'NOT_REGISTERED',
  PENDING_INSTRUCTOR = 'PENDING_INSTRUCTOR',
  REJECTED_INSTRUCTOR = 'REJECTED_INSTRUCTOR',
  PENDING_ADVISOR = 'PENDING_ADVISOR',
  REJECTED_ADVISOR = 'REJECTED_ADVISOR',
  APPROVED = 'APPROVED'
}

// Domain Entities
export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  status?: 'Active' | 'Inactive';
  department?: string;
}

export interface Course {
  id: string;
  code: string;
  name: string;
  credits: number;
  instructorId: string;
  instructorName: string;
  schedule: string;
  department?: string;
  ltp?: string; 
  session?: string;
  status?: 'Offered' | 'Withdrawn' | 'Proposed';
}

export interface RegistrationRequest {
  id: string;
  studentId: string;
  studentName: string;
  courseId: string;
  courseName: string;
  status: RegistrationStatus;
  timestamp: string;
  grade?: string;
}

export interface Advisee {
  id: string;
  name: string;
  rollNo: string;
  cgpa: number;
  creditsEarned: number;
  creditsRequired: number;
  status: 'Good Standing' | 'Probation' | 'Critical';
  lastMeeting?: string;
}

export interface StudentGradeRecord {
  studentId: string;
  name: string;
  rollNo: string;
  midSem: number;
  endSem: number;
  internal: number;
  total: number;
  grade: string;
}

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}