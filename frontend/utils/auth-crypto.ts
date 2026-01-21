
/**
 * SIMULATED BACKEND CRYPTO LOGIC
 * ------------------------------
 * In a real Next.js app, this runs on the server (API Routes).
 * For this client-side demo, we use the Web Crypto API to simulate
 * the secure "Stateless Hash" flow described in the requirements.
 */

const SECRET_KEY = "AIMS_IIT_ROPAR_DEMO_SECRET_2024"; // In prod: process.env.OTP_SECRET

// Helper: Convert ArrayBuffer to Hex String
const bufferToHex = (buffer: ArrayBuffer): string => {
  return Array.from(new Uint8Array(buffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
};

// 1. Generate HMAC-SHA256 Signature
async function signData(data: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await window.crypto.subtle.importKey(
    "raw",
    enc.encode(SECRET_KEY),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await window.crypto.subtle.sign(
    "HMAC",
    key,
    enc.encode(data)
  );
  return bufferToHex(signature);
}

// 2. Request OTP (Simulates /api/auth/otp)
export async function requestOtp(email: string) {
  const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6 Digits
  const ttl = 5 * 60 * 1000; // 5 Minutes
  const expires = Date.now() + ttl;
  
  // Create payload to sign: email.otp.expiry
  const data = `${email}.${otp}.${expires}`;
  const hash = await signData(data);

  return { 
    otp,      // Sent via Email (simulated via Toast)
    hash,     // Sent to Client
    expires   // Sent to Client
  };
}

// 3. Verify OTP (Simulates /api/auth/verify)
export async function verifyOtp(email: string, otp: string, hash: string, expires: number): Promise<boolean> {
  // Check Expiry
  if (Date.now() > expires) {
    console.warn("OTP Expired");
    return false;
  }

  // Reconstruct the data string
  const data = `${email}.${otp}.${expires}`;
  
  // Re-calculate hash
  const calculatedHash = await signData(data);

  // Compare
  return calculatedHash === hash;
}
