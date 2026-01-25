import { getStudentAcademicRecord, updateCourseGrade, updateSemesterRecord } from './student.service.js';
import { findStudentByEmail, getStudentTimetable } from '../../models/student.model.js';
import { getStudentEnrollments } from '../../models/enrollment.model.js';

export const getStudentRecord = async (req, res) => {
  try {
    const studentEmail = req.user.email; // Assuming user is authenticated
    const academicRecord = await getStudentAcademicRecord(studentEmail);

    res.json(academicRecord);
  } catch (err) {
    console.error('Error getting student record:', err);
    res.status(500).json({ error: err.message });
  }
};

export const getStudentRecordById = async (req, res) => {
  try {
    const { email } = req.params;

    // Only admin or the student themselves can access
    if (req.user.role !== 'ADMIN' && req.user.email !== email) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const academicRecord = await getStudentAcademicRecord(email);
    const student = await findStudentByEmail(email);

    res.json({
      ...student,
      academicRecord
    });
  } catch (err) {
    console.error('Error getting student record:', err);
    res.status(500).json({ error: err.message });
  }
};

export const getStudentCourses = async (req, res) => {
  try {
    const { semester } = req.query;
    const studentEmail = req.user.email;

    const enrollments = await getStudentEnrollments(studentEmail, semester || null);

    res.json({ enrollments });
  } catch (err) {
    console.error('Error getting student courses:', err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * Get student grades organized by semester
 * Returns graded courses with calculated SGPA per semester
 */
export const getStudentGrades = async (req, res) => {
  try {
    const studentEmail = req.user.email;

    // Get all enrollments with grades
    const enrollments = await getStudentEnrollments(studentEmail, null);

    // Organize by semester
    const semesterMap = {};
    let cumulativeCredits = 0;
    let cumulativePoints = 0;

    enrollments.forEach(enrollment => {
      // Filter out pending requests and rejected enrollments from the grade card
      if (['PENDING_INSTRUCTOR', 'PENDING_ADVISOR', 'REJECTED_INSTRUCTOR', 'REJECTED_ADVISOR'].includes(enrollment.status)) {
        return;
      }

      const semester = enrollment.semester || 'Unknown';
      if (!semesterMap[semester]) {
        semesterMap[semester] = {
          semester,
          courses: [],
          totalCredits: 0,
          totalPoints: 0
        };
      }

      const course = {
        code: enrollment.course_id,
        name: enrollment.course_title,
        credits: enrollment.course_credits || 0,
        type: enrollment.course_type || 'Core',
        grade: enrollment.grade || '-',
        gradePoints: enrollment.grade_points ? parseFloat(enrollment.grade_points) : null,
        status: enrollment.status
      };

      semesterMap[semester].courses.push(course);

      // Only count graded courses for GPA calculation
      if (course.gradePoints !== null && course.credits > 0) {
        semesterMap[semester].totalCredits += course.credits;
        semesterMap[semester].totalPoints += course.credits * course.gradePoints;
      }
    });

    // Calculate SGPA for each semester and CGPA
    const semesters = Object.keys(semesterMap).sort();
    const result = [];

    semesters.forEach((semesterKey, index) => {
      const sem = semesterMap[semesterKey];
      const sgpa = sem.totalCredits > 0
        ? (sem.totalPoints / sem.totalCredits).toFixed(2)
        : '0.00';

      cumulativeCredits += sem.totalCredits;
      cumulativePoints += sem.totalPoints;

      const cgpa = cumulativeCredits > 0
        ? (cumulativePoints / cumulativeCredits).toFixed(2)
        : '0.00';

      result.push({
        semester: semesterKey,
        sgpa: parseFloat(sgpa),
        cgpa: parseFloat(cgpa),
        creditsRegistered: sem.courses.reduce((sum, c) => sum + (c.credits || 0), 0),
        creditsEarned: sem.totalCredits,
        cumulativeCredits,
        courses: sem.courses
      });
    });

    res.json({
      semesters: result,
      currentCgpa: result.length > 0 ? result[result.length - 1].cgpa : 0,
      totalCreditsEarned: cumulativeCredits
    });
  } catch (err) {
    console.error('Error getting student grades:', err);
    res.status(500).json({ error: err.message });
  }
};

export const getTimetable = async (req, res) => {
  try {
    const studentEmail = req.user.email;
    const timetable = await getStudentTimetable(studentEmail);
    res.json(timetable);
  } catch (err) {
    console.error('Error getting timetable:', err);
    res.status(500).json({ error: err.message });
  }
};

// End of file
