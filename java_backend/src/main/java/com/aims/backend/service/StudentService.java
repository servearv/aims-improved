package com.aims.backend.service;

import com.aims.backend.domain.Role;
import com.aims.backend.domain.Student;
import com.aims.backend.repository.StudentRepository;
import com.aims.backend.security.AuthorizationService;
import com.aims.backend.security.CurrentUserProvider;
import org.springframework.stereotype.Service;

@Service
public class StudentService {

    private final StudentRepository studentRepository;
    private final CurrentUserProvider currentUserProvider;
    private final AuthorizationService authorizationService;

    public StudentService(
            StudentRepository studentRepository,
            CurrentUserProvider currentUserProvider,
            AuthorizationService authorizationService
    ) {
        this.studentRepository = studentRepository;
        this.currentUserProvider = currentUserProvider;
        this.authorizationService = authorizationService;
    }

    public Student createStudent(String name) {
        var currentUser = currentUserProvider.getCurrentUser();

        // ONLY ADVISOR can create students
        authorizationService.requireRole(currentUser, Role.ADVISOR);

        return studentRepository.save(new Student(name));
    }
}
