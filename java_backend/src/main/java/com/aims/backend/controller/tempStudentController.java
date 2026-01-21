// package com.aims.backend.controllers;

// import com.aims.backend.dto.CreateStudentRequest;
// import jakarta.validation.Valid;
// import org.springframework.web.bind.annotation.*;

// import com.aims.backend.domain.Student;
// import com.aims.backend.repository.StudentRepository;
// import org.springframework.web.bind.annotation.GetMapping;
// import org.springframework.web.bind.annotation.RestController;

// import java.util.List;

// @RestController
// public class StudentController {

//     private final StudentRepository studentRepository;

//     public StudentController(StudentRepository studentRepository) {
//         this.studentRepository = studentRepository;
//     }

// 		// GET /students
//     @GetMapping("/students")
//     public List<Student> getStudents() {
//         return studentRepository.findAll();
//     }

//  		// POST /students
//     @PostMapping("/students/create")
//     public Student createStudent(@Valid @RequestBody CreateStudentRequest request) {
//         Student student = new Student(request.getName());
//         return studentRepository.save(student);
//     }
// }
