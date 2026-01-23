import pool from '../config/db.js';
import { findInstructorByEmail } from './instructor.model.js';
import { getStudentEnrollments } from './enrollment.model.js';

/**
 * Get all advisees for a faculty advisor
 */
export const getAdvisees = async (advisorEmail) => {
    // First get instructor_id from advisor email
    const instructor = await findInstructorByEmail(advisorEmail);

    if (!instructor) {
        throw new Error('Advisor not found');
    }

    // Get students where fa_id matches instructor_id
    const result = await pool.query(
        `SELECT s.*, u.is_active,
            (SELECT COUNT(*) FROM student_courses sc WHERE sc.student_email = s.email AND sc.status LIKE 'Pending%') as pending_requests,
            (SELECT COUNT(*) FROM student_courses sc WHERE sc.student_email = s.email AND sc.status IN ('Enrolled', 'Approved')) as active_courses,
            (SELECT AVG(sc.grade_points) FROM student_courses sc WHERE sc.student_email = s.email AND sc.grade_points IS NOT NULL) as avg_gpa
     FROM students s
     JOIN users u ON s.email = u.email
     WHERE s.fa_id = $1
     ORDER BY s.entry_no`,
        [instructor.instructor_id]
    );

    return result.rows.map(student => ({
        ...student,
        pending_requests: parseInt(student.pending_requests) || 0,
        active_courses: parseInt(student.active_courses) || 0,
        avg_gpa: student.avg_gpa ? parseFloat(student.avg_gpa).toFixed(2) : null,
        status: student.avg_gpa && parseFloat(student.avg_gpa) < 6 ? 'At Risk' : 'Good Standing'
    }));
};

/**
 * Get detailed academic progress for a specific advisee
 */
export const getAdviseeProgress = async (advisorEmail, studentEmail) => {
    // Verify advisor has access to this student
    const instructor = await findInstructorByEmail(advisorEmail);
    if (!instructor) {
        throw new Error('Advisor not found');
    }

    // Check student is assigned to this advisor
    const studentResult = await pool.query(
        `SELECT s.*, u.is_active 
     FROM students s
     JOIN users u ON s.email = u.email
     WHERE s.email = $1 AND s.fa_id = $2`,
        [studentEmail, instructor.instructor_id]
    );

    if (studentResult.rowCount === 0) {
        throw new Error('Student not found or not assigned to this advisor');
    }

    const student = studentResult.rows[0];

    // Get all enrollments for this student
    const enrollments = await getStudentEnrollments(studentEmail, null);

    // Organize by semester
    const semesterMap = {};
    let cumulativeCredits = 0;
    let cumulativePoints = 0;

    enrollments.forEach(enrollment => {
        const semester = enrollment.semester || 'Unknown';
        if (!semesterMap[semester]) {
            semesterMap[semester] = {
                semester,
                courses: [],
                totalCredits: 0,
                totalPoints: 0
            };
        }

        const credits = enrollment.course_credits || 0;
        const gradePoints = enrollment.grade_points !== null ? parseFloat(enrollment.grade_points) : null;

        semesterMap[semester].courses.push({
            code: enrollment.course_id,
            name: enrollment.course_title,
            credits,
            type: enrollment.course_type || 'Core',
            grade: enrollment.grade || '-',
            gradePoints,
            status: enrollment.status
        });

        if (gradePoints !== null && credits > 0) {
            semesterMap[semester].totalCredits += credits;
            semesterMap[semester].totalPoints += credits * gradePoints;
        }
    });

    // Calculate SGPA/CGPA for each semester
    const semesters = Object.keys(semesterMap).sort();
    const academicHistory = [];

    semesters.forEach(semesterKey => {
        const sem = semesterMap[semesterKey];
        const sgpa = sem.totalCredits > 0
            ? (sem.totalPoints / sem.totalCredits).toFixed(2)
            : '0.00';

        cumulativeCredits += sem.totalCredits;
        cumulativePoints += sem.totalPoints;

        const cgpa = cumulativeCredits > 0
            ? (cumulativePoints / cumulativeCredits).toFixed(2)
            : '0.00';

        academicHistory.push({
            semester: semesterKey,
            sgpa: parseFloat(sgpa),
            cgpa: parseFloat(cgpa),
            creditsRegistered: sem.courses.reduce((sum, c) => sum + (c.credits || 0), 0),
            creditsEarned: sem.totalCredits,
            cumulativeCredits,
            courses: sem.courses
        });
    });

    // Count pending requests
    const pendingResult = await pool.query(
        `SELECT COUNT(*) as count FROM student_courses 
     WHERE student_email = $1 AND status LIKE 'Pending%'`,
        [studentEmail]
    );

    return {
        student: {
            email: student.email,
            entryNo: student.entry_no,
            batch: student.batch,
            group: student.group,
            isActive: student.is_active
        },
        currentCgpa: academicHistory.length > 0 ? academicHistory[academicHistory.length - 1].cgpa : 0,
        totalCreditsEarned: cumulativeCredits,
        pendingRequests: parseInt(pendingResult.rows[0]?.count) || 0,
        status: cumulativeCredits > 0 && (cumulativePoints / cumulativeCredits) < 6 ? 'At Risk' : 'Good Standing',
        academicHistory
    };
};

/**
 * Get pending registration requests for advisor's advisees
 */
export const getAdvisorPendingRequests = async (advisorEmail) => {
    const instructor = await findInstructorByEmail(advisorEmail);
    if (!instructor) {
        throw new Error('Advisor not found');
    }

    const result = await pool.query(
        `SELECT sc.*, s.entry_no, s.batch, c.title as course_title, c.credits
     FROM student_courses sc
     JOIN students s ON sc.student_email = s.email
     JOIN courses c ON sc.course_id = c.course_id
     WHERE s.fa_id = $1 AND sc.status = 'Pending_Advisor'
     ORDER BY sc.created_at DESC`,
        [instructor.instructor_id]
    );

    return result.rows;
};
