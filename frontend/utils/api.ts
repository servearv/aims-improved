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

