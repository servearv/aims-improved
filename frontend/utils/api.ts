/**
 * Backend API Client
 * Connects frontend to backend API
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

export async function requestOtpFromBackend(email: string) {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/otp/request`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      let errorMessage = 'Failed to request OTP';
      try {
        const error = await response.json();
        errorMessage = error.error || errorMessage;
      } catch {
        errorMessage = `Server error: ${response.status}`;
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    return { success: true, message: data.message };
  } catch (error: any) {
    console.error('Backend OTP request failed:', error);
    // Re-throw with a user-friendly message if it's a network error
    if (error.message.includes('fetch')) {
      throw new Error('Cannot connect to server. Please check if the backend is running.');
    }
    throw error;
  }
}

export async function verifyOtpWithBackend(email: string, otp: string) {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/otp/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, otp }),
    });

    if (!response.ok) {
      let errorMessage = 'Invalid OTP';
      try {
        const error = await response.json();
        errorMessage = error.error || errorMessage;
      } catch {
        errorMessage = `Server error: ${response.status}`;
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    return {
      success: true,
      token: data.token,
      user: data.user,
    };
  } catch (error: any) {
    console.error('Backend OTP verification failed:', error);
    // Re-throw with a user-friendly message if it's a network error
    if (error.message.includes('fetch')) {
      throw new Error('Cannot connect to server. Please check if the backend is running.');
    }
    throw error;
  }
}

// Get auth token from localStorage
function getAuthToken(): string | null {
  return localStorage.getItem('auth_token');
}

// Student API functions
export async function getStudentRecord(email?: string) {
  const token = getAuthToken();
  if (!token) throw new Error('Not authenticated');

  const url = email ? `${API_BASE_URL}/student/record/${email}` : `${API_BASE_URL}/student/record`;
  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch student record');
  }

  return response.json();
}

export async function getStudentCourses(semester?: string) {
  const token = getAuthToken();
  if (!token) throw new Error('Not authenticated');

  const url = semester
    ? `${API_BASE_URL}/student/courses?semester=${semester}`
    : `${API_BASE_URL}/student/courses`;

  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch courses');
  }

  return response.json();
}

export async function submitCourseFeedback(courseId: string, data: {
  feedbackType: string;
  instructorId: string;
  ratings: any;
  comments: string;
}) {
  const token = getAuthToken();
  if (!token) throw new Error('Not authenticated');

  const response = await fetch(`${API_BASE_URL}/api/courses/${courseId}/feedback`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to submit feedback');
  }

  return response.json();
}

export async function submitPayment(data: {
  sessionId: string;
  amount: number;
  bank: string;
  transactionNo: string;
  transactionDate: string;
  proofUrl: string;
}) {
  const token = getAuthToken();
  if (!token) throw new Error('Not authenticated');

  const response = await fetch(`${API_BASE_URL}/finance/payments`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to submit payment');
  }

  return response.json();
}

export async function getPaymentHistory() {
  const token = getAuthToken();
  if (!token) throw new Error('Not authenticated');

  const response = await fetch(`${API_BASE_URL}/finance/history`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch payment history');
  }
  return response.json();
}

export async function getTimetable() {
  const token = getAuthToken();
  if (!token) throw new Error('Not authenticated');

  const response = await fetch(`${API_BASE_URL}/student/timetable`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch timetable');
  }

  return response.json();
}

// Courses API functions
export async function getAllCourses(filters?: {
  status?: string;
  instructorId?: string;
  type?: string;
}) {
  const token = getAuthToken();
  if (!token) throw new Error('Not authenticated');

  const params = new URLSearchParams();
  if (filters?.status) params.append('status', filters.status);
  if (filters?.instructorId) params.append('instructorId', filters.instructorId);
  if (filters?.type) params.append('type', filters.type);

  const url = `${API_BASE_URL}/courses${params.toString() ? '?' + params.toString() : ''}`;
  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch courses');
  }

  return response.json();
}

export async function getCourseById(courseId: string) {
  const token = getAuthToken();
  if (!token) throw new Error('Not authenticated');

  const response = await fetch(`${API_BASE_URL}/courses/${courseId}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch course');
  }

  return response.json();
}

export async function enrollInCourse(courseId: string, semester: string) {
  const token = getAuthToken();
  if (!token) throw new Error('Not authenticated');

  const response = await fetch(`${API_BASE_URL}/courses/enroll`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ courseId, semester }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to enroll in course');
  }

  return response.json();
}

export async function enrollBatch(courseId: string, batch: number, semester: string) {
  const token = getAuthToken();
  if (!token) throw new Error('Not authenticated');

  const response = await fetch(`${API_BASE_URL}/courses/${courseId}/enroll-batch`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ batch, semester }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed batch enrollment');
  }

  return response.json();
}

export async function getRegistrationRequests(filters?: { status?: string; semester?: string }) {
  const token = getAuthToken();
  if (!token) throw new Error('Not authenticated');

  const params = new URLSearchParams();
  if (filters?.status) params.append('status', filters.status);
  if (filters?.semester) params.append('semester', filters.semester);

  const url = `${API_BASE_URL}/courses/requests${params.toString() ? '?' + params.toString() : ''}`;
  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch registration requests');
  }

  return response.json();
}

export async function updateRegistrationStatus(registrationId: number, status: string) {
  const token = getAuthToken();
  if (!token) throw new Error('Not authenticated');

  // We need to implement this in backend still, but let's assume it exists or we add it to student_courses
  // Actually, we have updateEnrollment in backend models, but need a route.
  const response = await fetch(`${API_BASE_URL}/courses/requests/${registrationId}`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ status }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update registration status');
  }

  return response.json();
}

export async function getCourseEnrollments(courseId: string, semester?: string) {
  const token = getAuthToken();
  if (!token) throw new Error('Not authenticated');

  const params = new URLSearchParams();
  if (semester) params.append('semester', semester);

  const response = await fetch(`${API_BASE_URL}/courses/${courseId}/enrollments${params.toString() ? '?' + params.toString() : ''}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch enrollments');
  }

  return response.json();
}

export async function updateEnrollment(enrollmentId: number, updates: { status?: string; grade?: string; gradePoints?: number; creditsEarned?: number }) {
  const token = getAuthToken();
  if (!token) throw new Error('Not authenticated');

  const response = await fetch(`${API_BASE_URL}/courses/requests/${enrollmentId}`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updates),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update enrollment');
  }

  return response.json();
}

// ============= Academic Sessions =============

// getAcademicSessions moved to Session Management APIs section

export async function getCurrentSession() {
  const token = getAuthToken();
  if (!token) throw new Error('Not authenticated');

  const response = await fetch(`${API_BASE_URL}/api/academic-sessions/current`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch current session');
  }

  return response.json();
}

// ============= Departments =============

export async function getDepartments() {
  const token = getAuthToken();
  if (!token) throw new Error('Not authenticated');

  const response = await fetch(`${API_BASE_URL}/api/departments`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch departments');
  }

  return response.json();
}

// ============= Course Offerings =============

export async function getOfferings(filters?: {
  sessionId?: string;
  deptCode?: string;
  status?: string;
  courseId?: string;
  title?: string;
  instructorId?: string;
}) {
  const token = getAuthToken();
  if (!token) throw new Error('Not authenticated');

  const params = new URLSearchParams();
  if (filters?.sessionId) params.append('sessionId', filters.sessionId);
  if (filters?.deptCode) params.append('deptCode', filters.deptCode);
  if (filters?.status) params.append('status', filters.status);
  if (filters?.courseId) params.append('courseId', filters.courseId);
  if (filters?.title) params.append('title', filters.title);
  if (filters?.instructorId) params.append('instructorId', filters.instructorId);

  const url = `${API_BASE_URL}/api/offerings${params.toString() ? '?' + params.toString() : ''}`;
  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch offerings');
  }

  return response.json();
}

export async function getOfferingById(id: number) {
  const token = getAuthToken();
  if (!token) throw new Error('Not authenticated');

  const response = await fetch(`${API_BASE_URL}/api/offerings/${id}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch offering');
  }

  return response.json();
}

export async function createOffering(data: {
  courseId: string;
  sessionId: string;
  offeringDept: string;
  section?: string;
  slotId?: number;
  status?: string;
}) {
  const token = getAuthToken();
  if (!token) throw new Error('Not authenticated');

  const response = await fetch(`${API_BASE_URL}/api/offerings`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create offering');
  }

  return response.json();
}

export async function updateOfferingApi(id: number, data: Partial<{
  courseId: string;
  sessionId: string;
  offeringDept: string;
  section: string;
  slotId: number;
  status: string;
}>) {
  const token = getAuthToken();
  if (!token) throw new Error('Not authenticated');

  const response = await fetch(`${API_BASE_URL}/api/offerings/${id}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update offering');
  }

  return response.json();
}

export async function deleteOffering(id: number) {
  const token = getAuthToken();
  if (!token) throw new Error('Not authenticated');

  const response = await fetch(`${API_BASE_URL}/api/offerings/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete offering');
  }

  return response.json();
}

// ============= Instructor Management =============

export async function addOfferingInstructor(offeringId: number, instructorId: string, isCoordinator: boolean = false) {
  const token = getAuthToken();
  if (!token) throw new Error('Not authenticated');

  const response = await fetch(`${API_BASE_URL}/api/offerings/${offeringId}/instructors`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ instructorId, isCoordinator }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to add instructor');
  }

  return response.json();
}

export async function removeOfferingInstructor(offeringId: number, instructorId: string) {
  const token = getAuthToken();
  if (!token) throw new Error('Not authenticated');

  const response = await fetch(`${API_BASE_URL}/api/offerings/${offeringId}/instructors/${instructorId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to remove instructor');
  }

  return response.json();
}

export async function updateOfferingInstructor(offeringId: number, instructorId: string, isCoordinator: boolean) {
  const token = getAuthToken();
  if (!token) throw new Error('Not authenticated');

  const response = await fetch(`${API_BASE_URL}/api/offerings/${offeringId}/instructors/${instructorId}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ isCoordinator }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update instructor');
  }

  return response.json();
}

// ============= Crediting Categorization =============

export async function addCreditingCategory(offeringId: number, data: {
  degree: string;
  department: string;
  category: string;
  entryYears: string;
}) {
  const token = getAuthToken();
  if (!token) throw new Error('Not authenticated');

  const response = await fetch(`${API_BASE_URL}/api/offerings/${offeringId}/crediting`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to add crediting');
  }

  return response.json();
}

export async function removeCreditingCategory(offeringId: number, creditId: number) {
  const token = getAuthToken();
  if (!token) throw new Error('Not authenticated');

  const response = await fetch(`${API_BASE_URL}/api/offerings/${offeringId}/crediting/${creditId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to remove crediting');
  }

  return response.json();
}

// ============= Search/Lookup =============

export async function searchCourses(query: string) {
  const token = getAuthToken();
  if (!token) throw new Error('Not authenticated');

  const response = await fetch(`${API_BASE_URL}/api/courses/search?q=${encodeURIComponent(query)}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to search courses');
  }

  return response.json();
}

export async function searchInstructors(query: string) {
  const token = getAuthToken();
  if (!token) throw new Error('Not authenticated');

  const response = await fetch(`${API_BASE_URL}/api/instructors/search?q=${encodeURIComponent(query)}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to search instructors');
  }

  return response.json();
}

// ============= Slots =============

export async function getSlots() {
  const token = getAuthToken();
  if (!token) throw new Error('Not authenticated');

  const response = await fetch(`${API_BASE_URL}/api/slots`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  // If endpoint doesn't exist yet, return empty array
  if (response.status === 404) {
    return { slots: [] };
  }

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch slots');
  }

  return response.json();
}


// ============= Dashboard Stats =============

export async function getDashboardStats() {
  const token = getAuthToken();
  if (!token) throw new Error('Not authenticated');

  const response = await fetch(`${API_BASE_URL}/dashboard`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch dashboard stats');
  }

  return response.json();
}

export async function getStudentDashboardStats(email: string) {
  const token = getAuthToken();
  if (!token) throw new Error('Not authenticated');

  const response = await fetch(`${API_BASE_URL}/dashboard/student/${encodeURIComponent(email)}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch student stats');
  }

  return response.json();
}

// ============= Drop Course =============

export async function dropCourse(enrollmentId: number) {
  const token = getAuthToken();
  if (!token) throw new Error('Not authenticated');

  const response = await fetch(`${API_BASE_URL}/courses/enrollment/${enrollmentId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to drop course');
  }

  return response.json();
}

// ============= Instructor Courses =============

export async function getInstructorCourses() {
  const token = getAuthToken();
  if (!token) throw new Error('Not authenticated');

  const response = await fetch(`${API_BASE_URL}/courses/instructor/my-courses`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch instructor courses');
  }

  return response.json();
}

// ============= Student Grades =============

export async function getStudentGrades() {
  const token = getAuthToken();
  if (!token) throw new Error('Not authenticated');

  const response = await fetch(`${API_BASE_URL}/student/grades`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch student grades');
  }

  return response.json();
}

// ============= Bulk Grade Upload =============

export async function uploadBulkGrades(courseId: string, grades: Array<{ entryNo: string; grade: string }>, semester?: string) {
  const token = getAuthToken();
  if (!token) throw new Error('Not authenticated');

  const response = await fetch(`${API_BASE_URL}/courses/${courseId}/grades/upload`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ grades, semester }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to upload grades');
  }

  return response.json();
}

// ============= Advisor APIs =============

export async function getAdvisees() {
  const token = getAuthToken();
  if (!token) throw new Error('Not authenticated');

  const response = await fetch(`${API_BASE_URL}/advisor/advisees`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch advisees');
  }

  return response.json();
}

export async function getAdviseeProgress(email: string) {
  const token = getAuthToken();
  if (!token) throw new Error('Not authenticated');

  const response = await fetch(`${API_BASE_URL}/advisor/advisees/${encodeURIComponent(email)}/progress`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch advisee progress');
  }

  return response.json();
}

export async function getAdvisorPendingRequests() {
  const token = getAuthToken();
  if (!token) throw new Error('Not authenticated');

  const response = await fetch(`${API_BASE_URL}/advisor/pending-requests`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch pending requests');
  }

  return response.json();
}

// ============= Admin APIs =============

export async function getUsers(role?: string, search?: string) {
  const token = getAuthToken();
  if (!token) throw new Error('Not authenticated');

  const params = new URLSearchParams();
  if (role && role !== 'ALL') params.append('role', role);
  if (search) params.append('search', search);

  const response = await fetch(`${API_BASE_URL}/admin/users?${params.toString()}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch users');
  }

  return response.json();
}

export async function createUser(data: { email: string; role: string }) {
  const token = getAuthToken();
  if (!token) throw new Error('Not authenticated');

  const response = await fetch(`${API_BASE_URL}/admin/users`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create user');
  }

  return response.json();
}

export async function updateUser(id: string, updates: any) {
  const token = getAuthToken();
  if (!token) throw new Error('Not authenticated');

  const response = await fetch(`${API_BASE_URL}/admin/users/${id}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updates),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update user');
  }

  return response.json();
}

export async function deleteUser(id: string) {
  const token = getAuthToken();
  if (!token) throw new Error('Not authenticated');

  const response = await fetch(`${API_BASE_URL}/admin/users/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete user');
  }

  return response.json();
}

// ============= Session Management APIs =============

export async function getAcademicSessions() {
  const token = getAuthToken();
  if (!token) throw new Error('Not authenticated');

  // Use existing public endpoint
  const response = await fetch(`${API_BASE_URL}/api/academic-sessions`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch sessions');
  }

  return response.json();
}

export async function createAcademicSession(data: any) {
  const token = getAuthToken();
  if (!token) throw new Error('Not authenticated');

  const response = await fetch(`${API_BASE_URL}/admin/sessions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create session');
  }

  return response.json();
}

export async function setCurrentAcademicSession(sessionId: string) {
  const token = getAuthToken();
  if (!token) throw new Error('Not authenticated');

  const response = await fetch(`${API_BASE_URL}/admin/sessions/${sessionId}/current`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to set current session');
  }

  return response.json();
}
