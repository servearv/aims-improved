import { getStudentEnrollments } from '../../models/enrollment.model.js';
import { getAllStudentRecords, createOrUpdateStudentRecord } from '../../models/studentRecord.model.js';
import { calculateSGPA, calculateCGPA, calculateTotalCredits, getGradePoints } from '../../utils/gpa.js';
import { updateEnrollment } from '../../models/enrollment.model.js';

/**
 * Get student's academic record including CGPA, SGPA, and all course enrollments
 */
export const getStudentAcademicRecord = async (studentEmail) => {
  // Get all enrollments
  const allEnrollments = await getStudentEnrollments(studentEmail);
  
  // Get all student records
  const records = await getAllStudentRecords(studentEmail);
  
  // Calculate CGPA
  const cgpa = calculateCGPA(allEnrollments);
  
  // Calculate total credits
  const totalCredits = calculateTotalCredits(allEnrollments);
  
  // Organize by semester
  const semesters = {};
  for (const enrollment of allEnrollments) {
    if (!semesters[enrollment.semester]) {
      semesters[enrollment.semester] = [];
    }
    semesters[enrollment.semester].push(enrollment);
  }
  
  // Calculate SGPA for each semester
  const semesterStats = {};
  for (const [semester, enrollments] of Object.entries(semesters)) {
    const record = records.find(r => r.semester === semester);
    const sgpa = calculateSGPA(enrollments);
    
    semesterStats[semester] = {
      enrollments,
      sgpa: record?.sgpa || sgpa,
      creditsCompleted: record?.credits_completed || calculateTotalCredits(enrollments),
      creditsExceeded: record?.credits_exceeded || 0,
      creditsExceededApproved: record?.credits_exceeded_approved || false,
      minorStatus: record?.minor_status,
      additionalCourses: record?.additional_courses,
      internshipStatus: record?.internship_status
    };
  }
  
  return {
    cgpa,
    totalCredits,
    semesterStats,
    allEnrollments
  };
};

/**
 * Update grades for a student's course enrollment
 */
export const updateCourseGrade = async (enrollmentId, grade, creditsEarned = null) => {
  const gradePoints = getGradePoints(grade);
  
  // If credits earned not specified, use course credits (unless failed)
  if (creditsEarned === null) {
    // If grade is F or X, credits earned is 0
    if (grade === 'F' || grade === 'X') {
      creditsEarned = 0;
    }
    // Otherwise, we'll need to get the course credits from enrollment
    // For now, we'll let it be null and handle it in the model
  }
  
  const updates = {
    grade,
    gradePoints,
    creditsEarned,
    status: (grade === 'F' || grade === 'X') ? 'Completed' : 'Completed'
  };
  
  return await updateEnrollment(enrollmentId, updates);
};

/**
 * Update semester record with calculated SGPA
 */
export const updateSemesterRecord = async (studentEmail, semester) => {
  const enrollments = await getStudentEnrollments(studentEmail, semester);
  const sgpa = calculateSGPA(enrollments);
  const creditsCompleted = calculateTotalCredits(enrollments);
  
  return await createOrUpdateStudentRecord({
    studentEmail,
    semester,
    sgpa,
    creditsCompleted
  });
};

