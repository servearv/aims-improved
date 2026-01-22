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

