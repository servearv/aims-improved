import bcrypt from "bcryptjs";

export const generateOtp = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

export const hashOtp = async (otp) => bcrypt.hash(otp, 10);

export const verifyOtp = async (otp, hash) =>
  bcrypt.compare(otp, hash);
