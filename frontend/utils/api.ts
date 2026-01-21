/**
 * Backend API Client
 * Falls back to client-side auth if backend is unavailable
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
      const error = await response.json();
      throw new Error(error.error || 'Failed to request OTP');
    }

    return { success: true };
  } catch (error: any) {
    console.error('Backend OTP request failed:', error);
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
      const error = await response.json();
      throw new Error(error.error || 'Invalid OTP');
    }

    const data = await response.json();
    return {
      success: true,
      token: data.token,
      user: data.user,
    };
  } catch (error: any) {
    console.error('Backend OTP verification failed:', error);
    throw error;
  }
}

