package com.aims.backend.controller;

import com.aims.backend.domain.Student;
import com.aims.backend.dto.CreateStudentRequest;
import com.aims.backend.service.StudentService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/students")
public class StudentController {

    private final StudentService studentService;

    public StudentController(StudentService studentService) {
        this.studentService = studentService;
    }

    @PostMapping
    public Student createStudent(@Valid @RequestBody CreateStudentRequest request) {
        return studentService.createStudent(request.getName());
    }
}
