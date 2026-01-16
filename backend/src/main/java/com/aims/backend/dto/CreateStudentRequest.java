package com.aims.backend.dto;

import jakarta.validation.constraints.NotBlank;

public class CreateStudentRequest {

    @NotBlank
    private String name;

    public String getName() {
        return name;
    }
}
