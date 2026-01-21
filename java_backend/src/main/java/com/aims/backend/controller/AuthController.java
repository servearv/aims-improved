package com.aims.backend.controller;

import com.aims.backend.dto.LoginResponse;
import com.aims.backend.dto.SendOtpRequest;
import com.aims.backend.dto.VerifyOtpRequest;
import com.aims.backend.service.OtpService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth/login")
public class AuthController {

    private final OtpService otpService;

    public AuthController(OtpService otpService) {
        this.otpService = otpService;
    }

    @PostMapping("/send-otp")
    public void sendOtp(@Valid @RequestBody SendOtpRequest request) {
        otpService.sendLoginOtp(request.getEmail());
    }

    @PostMapping("/verify-otp")
    public LoginResponse verifyOtp(@Valid @RequestBody VerifyOtpRequest request) {
        return otpService.verifyOtpAndLogin(
                request.getEmail(),
                request.getOtp()
        );
    }
}
