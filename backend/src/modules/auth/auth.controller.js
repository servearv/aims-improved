import { requestOtpService, verifyOtpService } from "./auth.service.js";

export const requestOtp = async (req, res) => {
  try {
    await requestOtpService(req.body.email);
    res.json({ message: "OTP sent" });
  } catch (err) {
    res.status(403).json({ error: err.message });
  }
};

export const verifyOtp = async (req, res) => {
  try {
    const result = await verifyOtpService(req.body.email, req.body.otp);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
