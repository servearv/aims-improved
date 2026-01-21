package com.aims.backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public class SendOtpRequest {

    @Email
    @NotBlank
    private String email;

    public String getEmail() {
        return email;
    }
}
