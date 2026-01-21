package com.aims.backend.dto;

import com.aims.backend.domain.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotNull;

public class CreateStudentRequest {

    @Email
    private String email;

    @NotNull
    private Role role;

    public String getEmail() {
        return email;
    }

    public Role getRole() {
        return role;
    }
}
