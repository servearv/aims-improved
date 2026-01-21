package com.aims.backend.controller;

import com.aims.backend.domain.Student;
import com.aims.backend.dto.CreateStudentRequest;
import com.aims.backend.domain.Role;
import com.aims.backend.service.AuthorizationService;
import com.aims.backend.service.CurrentUserProvider;
import com.aims.backend.service.StudentService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/students")
public class AdminStudentController {

    private final StudentService studentService;
    private final AuthorizationService authorizationService;
    private final CurrentUserProvider currentUserProvider;

    public AdminStudentController(
            StudentService studentService,
            AuthorizationService authorizationService,
            CurrentUserProvider currentUserProvider
    ) {
        this.studentService = studentService;
        this.authorizationService = authorizationService;
        this.currentUserProvider = currentUserProvider;
    }

    @PostMapping
    public Student createStudent(@Valid @RequestBody CreateStudentRequest request) {
        authorizationService.requireRole(
                currentUserProvider.get(),
                Role.ADMIN
        );

        return studentService.createStudent(request);
    }
}
