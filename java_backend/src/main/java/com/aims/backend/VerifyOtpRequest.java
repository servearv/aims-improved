package com.aims.backend.dto;

import jakarta.validation.constraints.NotBlank;

public class VerifyOtpRequest {

    @NotBlank
    private String email;

    @NotBlank
    private String otp;

    public String getEmail() { return email; }
    public String getOtp() { return otp; }
}
