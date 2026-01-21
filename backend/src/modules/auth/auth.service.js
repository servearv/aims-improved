import { generateOtp, hashOtp, verifyOtp } from "../../utils/otp.js";
import { mailer } from "../../utils/mailer.js";
import { saveOtp, findOtp, deleteOtp, incrementAttempts } from "../../models/otp.model.js";
import { findUserByEmail } from "../../models/user.model.js";
import { signToken } from "../../utils/jwt.js";

export const requestOtpService = async (email) => {
  const user = await findUserByEmail(email);
  if (!user || !user.is_active) {
    throw new Error("Invalid user");
  }

  const otp = generateOtp();
  const otpHash = await hashOtp(otp);
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

  await saveOtp({ email, otpHash, expiresAt });

  // Log OTP in development mode for testing
  if (process.env.NODE_ENV !== 'production') {
    console.log(`[DEV] OTP for ${email}: ${otp} (expires in 5 minutes)`);
  }

  try {
    await mailer.sendMail({
      to: email,
      subject: "AIMS Login OTP",
      text: `Your OTP is: ${otp}`
    });
  } catch (mailError) {
    console.error("Failed to send email:", mailError.message);
    // In development, don't fail if email is not configured
    if (process.env.NODE_ENV === 'production') {
      throw new Error("Failed to send OTP email. Please contact support.");
    } else {
      console.warn("[DEV] Email not sent, but OTP is logged above for testing");
    }
  }
};

export const verifyOtpService = async (email, otp) => {
  const record = await findOtp(email);
  if (!record) throw new Error("No OTP requested");

  if (new Date() > record.expires_at) {
    await deleteOtp(email);
    throw new Error("OTP expired");
  }

  const isValid = await verifyOtp(otp, record.otp_hash);
  if (!isValid) {
    await incrementAttempts(email);
    throw new Error("Invalid OTP");
  }

  const user = await findUserByEmail(email);
  const token = signToken(user);

  await deleteOtp(email);

  return { token, user };
};
