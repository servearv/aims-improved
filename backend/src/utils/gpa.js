/**
 * Grade Point Calculation Utilities
 * Maps letter grades to grade points
 */

const GRADE_POINTS = {
  'A+': 10.0,
  'A': 10.0,
  'A-': 9.0,
  'B+': 8.0,
  'B': 7.0,
  'B-': 6.0,
  'C+': 5.0,
  'C': 4.0,
  'D': 3.0,
  'F': 0.0,
  'S': 10.0, // Satisfactory (Pass)
  'X': 0.0,  // Unsatisfactory (Fail)
  'I': null, // Incomplete
  'W': null, // Withdrawn (not counted)
  'NP': null // Not Pass (not counted)
};

/**
 * Calculate grade points from letter grade
 */
export const getGradePoints = (grade) => {
  if (!grade) return null;
  return GRADE_POINTS[grade.toUpperCase()] ?? null;
};

/**
 * Calculate SGPA (Semester Grade Point Average) for a given semester
 * SGPA = Σ(Credit × Grade Point) / Σ(Credits)
 */
export const calculateSGPA = (enrollments) => {
  if (!enrollments || enrollments.length === 0) return null;

  let totalPoints = 0;
  let totalCredits = 0;

  for (const enrollment of enrollments) {
    // Skip withdrawn, incomplete, or non-graded courses
    if (enrollment.status === 'Withdrawn' || 
        enrollment.grade === 'I' || 
        enrollment.grade === 'W' ||
        enrollment.grade === null ||
        enrollment.grade === undefined) {
      continue;
    }

    const credits = enrollment.credits_earned || enrollment.course_credits || 0;
    const gradePoints = enrollment.grade_points || getGradePoints(enrollment.grade);

    if (gradePoints !== null && credits > 0) {
      totalPoints += credits * gradePoints;
      totalCredits += credits;
    }
  }

  if (totalCredits === 0) return null;
  
  return parseFloat((totalPoints / totalCredits).toFixed(2));
};

/**
 * Calculate CGPA (Cumulative Grade Point Average) across all semesters
 * CGPA = Σ(Credit × Grade Point) across all semesters / Σ(Credits) across all semesters
 */
export const calculateCGPA = (allEnrollments) => {
  if (!allEnrollments || allEnrollments.length === 0) return null;

  let totalPoints = 0;
  let totalCredits = 0;

  for (const enrollment of allEnrollments) {
    // Skip withdrawn, incomplete, or non-graded courses
    if (enrollment.status === 'Withdrawn' || 
        enrollment.grade === 'I' || 
        enrollment.grade === 'W' ||
        enrollment.grade === null ||
        enrollment.grade === undefined) {
      continue;
    }

    const credits = enrollment.credits_earned || enrollment.course_credits || 0;
    const gradePoints = enrollment.grade_points || getGradePoints(enrollment.grade);

    if (gradePoints !== null && credits > 0) {
      totalPoints += credits * gradePoints;
      totalCredits += credits;
    }
  }

  if (totalCredits === 0) return null;
  
  return parseFloat((totalPoints / totalCredits).toFixed(2));
};

/**
 * Calculate total credits completed
 */
export const calculateTotalCredits = (enrollments) => {
  if (!enrollments || enrollments.length === 0) return 0;

  return enrollments
    .filter(e => e.status !== 'Withdrawn' && 
                 e.grade !== 'I' && 
                 e.grade !== 'W' &&
                 e.grade !== null &&
                 e.grade !== undefined &&
                 (getGradePoints(e.grade) !== null || e.grade === 'S'))
    .reduce((sum, e) => sum + (e.credits_earned || e.course_credits || 0), 0);
};

/**
 * Calculate credits for a specific semester
 */
export const calculateSemesterCredits = (enrollments, semester) => {
  const semesterEnrollments = enrollments.filter(e => e.semester === semester);
  return calculateTotalCredits(semesterEnrollments);
};

