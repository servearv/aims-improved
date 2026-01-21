package com.aims.backend.service;

import com.aims.backend.domain.EmailVerification;
import com.aims.backend.domain.User;
import com.aims.backend.dto.LoginResponse;
import com.aims.backend.repository.EmailVerificationRepository;
import com.aims.backend.repository.UserRepository;
import com.aims.backend.security.JwtService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Random;

@Service
public class OtpService {

    private final EmailVerificationRepository verificationRepo;
    private final UserRepository userRepository;
    private final JwtService jwtService;

    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
    private final Random random = new Random();

    public OtpService(
            EmailVerificationRepository verificationRepo,
            UserRepository userRepository,
            JwtService jwtService
    ) {
        this.verificationRepo = verificationRepo;
        this.userRepository = userRepository;
        this.jwtService = jwtService;
    }

    /** Step 1: Send OTP (login only) */
    public void sendLoginOtp(String email) {
        // 🔒 Must already exist
        if (userRepository.findByEmail(email).isEmpty()) {
            throw new RuntimeException("Invalid user");
        }

        String otp = String.format("%06d", random.nextInt(1_000_000));
        String hash = encoder.encode(otp);

        EmailVerification verification = new EmailVerification(
                email,
                hash,
                Instant.now().plus(10, ChronoUnit.MINUTES)
        );

        verificationRepo.save(verification);

        // DEV ONLY
        System.out.println("OTP for " + email + " = " + otp);
    }

    /** Step 2: Verify OTP + issue JWT */
    public LoginResponse verifyOtpAndLogin(String email, String otp) {
        EmailVerification verification = verificationRepo.findById(email)
                .orElseThrow(() -> new RuntimeException("Invalid user"));

        if (verification.isExpired()) {
            throw new RuntimeException("OTP expired");
        }

        if (!encoder.matches(otp, verification.getOtpHash())) {
            throw new RuntimeException("Invalid OTP");
        }

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Invalid user"));

        String token = jwtService.generateToken(user);

        verificationRepo.deleteById(email); // one-time OTP

        return new LoginResponse(token, user.getRole().name());
    }
}
