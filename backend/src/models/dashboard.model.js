import pool from '../config/db.js';

/**
 * Get dashboard statistics for a student
 */
export const getStudentDashboardStats = async (email) => {
    // Get student info
    const studentResult = await pool.query(
        'SELECT * FROM students WHERE email = $1',
        [email]
    );

    if (studentResult.rowCount === 0) {
        throw new Error('Student not found');
    }

    const student = studentResult.rows[0];

    // Get current semester enrollments (active courses)
    const currentSession = await pool.query(
        'SELECT session_id FROM academic_sessions WHERE is_current = true LIMIT 1'
    );
    const currentSessionId = currentSession.rows[0]?.session_id || '2025-II';

    const enrollments = await pool.query(
        `SELECT sc.*, c.title, c.credits, c.type
     FROM student_courses sc
     JOIN courses c ON sc.course_id = c.course_id
     WHERE sc.student_email = $1`,
        [email]
    );

    // Calculate CGPA from graded courses
    const gradedCourses = enrollments.rows.filter(e => e.grade && e.grade_points !== null);
    let cgpa = 0;
    let totalCredits = 0;
    let earnedCredits = 0;

    gradedCourses.forEach(course => {
        const credits = course.course_credits || course.credits || 0;
        const gradePoints = parseFloat(course.grade_points) || 0;
        cgpa += credits * gradePoints;
        totalCredits += credits;
        if (gradePoints > 0) {
            earnedCredits += credits;
        }
    });

    cgpa = totalCredits > 0 ? (cgpa / totalCredits).toFixed(2) : '0.00';

    // Active courses (enrolled this semester)
    const activeCourses = enrollments.rows.filter(e =>
        e.status === 'Enrolled' || e.status === 'Approved'
    ).length;

    // Pending approvals
    const pendingApprovals = enrollments.rows.filter(e =>
        e.status && e.status.includes('Pending')
    ).length;

    return {
        cgpa: parseFloat(cgpa),
        creditsEarned: earnedCredits,
        creditsRequired: 160, // Default requirement
        activeCourses,
        pendingApprovals,
        batch: student.batch,
        entryNo: student.entry_no,
        currentSession: currentSessionId
    };
};

/**
 * Get dashboard statistics for an instructor
 */
export const getInstructorDashboardStats = async (email) => {
    // Get instructor info
    const instructorResult = await pool.query(
        'SELECT * FROM instructors WHERE email = $1',
        [email]
    );

    if (instructorResult.rowCount === 0) {
        throw new Error('Instructor not found');
    }

    const instructor = instructorResult.rows[0];

    // Get courses taught by this instructor
    const coursesResult = await pool.query(
        'SELECT * FROM courses WHERE instructor_id = $1',
        [instructor.instructor_id]
    );

    const courses = coursesResult.rows;
    let totalStudents = 0;

    // Get total enrolled students across all courses
    if (courses.length > 0) {
        const courseIds = courses.map(c => c.course_id);
        const enrollmentsResult = await pool.query(
            `SELECT COUNT(DISTINCT student_email) as count
       FROM student_courses
       WHERE course_id = ANY($1::text[])
       AND status IN ('Enrolled', 'Approved')`,
            [courseIds]
        );
        totalStudents = parseInt(enrollmentsResult.rows[0]?.count || 0);
    }

    // Get pending instructor approvals
    const pendingResult = await pool.query(
        `SELECT COUNT(*) as count
     FROM student_courses sc
     JOIN courses c ON sc.course_id = c.course_id
     WHERE c.instructor_id = $1 AND sc.status = 'Pending_Instructor'`,
        [instructor.instructor_id]
    );
    const pendingApprovals = parseInt(pendingResult.rows[0]?.count || 0);

    // Get course offerings from this session
    const currentSession = await pool.query(
        'SELECT session_id FROM academic_sessions WHERE is_current = true LIMIT 1'
    );
    const currentSessionId = currentSession.rows[0]?.session_id || '2025-II';

    const offeringsResult = await pool.query(
        `SELECT COUNT(*) as count
     FROM course_instructors ci
     JOIN course_offerings co ON ci.offering_id = co.id
     WHERE ci.instructor_id = $1 AND co.session_id = $2`,
        [instructor.instructor_id, currentSessionId]
    );
    const activeOfferings = parseInt(offeringsResult.rows[0]?.count || 0);

    return {
        totalStudents,
        courseCount: courses.length,
        activeOfferings,
        pendingApprovals,
        department: instructor.dept,
        currentSession: currentSessionId
    };
};

/**
 * Get dashboard statistics for an advisor
 */
export const getAdvisorDashboardStats = async (email) => {
    // Get instructor info (advisors are also instructors)
    const instructorResult = await pool.query(
        `SELECT i.*, fa.email as fa_email FROM instructors i
         LEFT JOIN faculty_advisors fa ON i.email = fa.email
         WHERE i.email = $1`,
        [email]
    );


    if (instructorResult.rowCount === 0) {
        throw new Error('Advisor not found');
    }

    const instructor = instructorResult.rows[0];

    // Get advisees
    const adviseesResult = await pool.query(
        'SELECT * FROM students WHERE fa_id = $1',
        [instructor.instructor_id]
    );
    const advisees = adviseesResult.rows;
    const adviseeEmails = advisees.map(a => a.email);

    // Get pending advisor approvals
    let pendingApprovals = 0;
    if (adviseeEmails.length > 0) {
        const pendingResult = await pool.query(
            `SELECT COUNT(*) as count
       FROM student_courses
       WHERE student_email = ANY($1::text[])
       AND status = 'Pending_Advisor'`,
            [adviseeEmails]
        );
        pendingApprovals = parseInt(pendingResult.rows[0]?.count || 0);
    }

    // Calculate at-risk students (low CGPA or too many pending)
    let atRiskCount = 0;
    for (const advisee of advisees) {
        const gradesResult = await pool.query(
            `SELECT AVG(grade_points) as avg_gpa
       FROM student_courses
       WHERE student_email = $1 AND grade_points IS NOT NULL`,
            [advisee.email]
        );
        const avgGpa = parseFloat(gradesResult.rows[0]?.avg_gpa || 10);
        if (avgGpa < 6.0) {
            atRiskCount++;
        }
    }

    return {
        adviseeCount: advisees.length,
        pendingApprovals,
        atRiskStudents: atRiskCount,
        department: instructor.dept
    };
};

/**
 * Get dashboard statistics for an admin
 */
export const getAdminDashboardStats = async () => {
    // Get user counts by role
    const usersResult = await pool.query(
        `SELECT role, COUNT(*) as count FROM users GROUP BY role`
    );

    const userCounts = {};
    usersResult.rows.forEach(row => {
        userCounts[row.role.toLowerCase()] = parseInt(row.count);
    });

    // Get total course count
    const coursesResult = await pool.query('SELECT COUNT(*) as count FROM courses');
    const totalCourses = parseInt(coursesResult.rows[0]?.count || 0);

    // Get active offerings
    const currentSession = await pool.query(
        'SELECT session_id FROM academic_sessions WHERE is_current = true LIMIT 1'
    );
    const currentSessionId = currentSession.rows[0]?.session_id || '2025-II';

    const offeringsResult = await pool.query(
        'SELECT COUNT(*) as count FROM course_offerings WHERE session_id = $1',
        [currentSessionId]
    );
    const activeOfferings = parseInt(offeringsResult.rows[0]?.count || 0);

    // Get enrollment stats
    const enrollmentResult = await pool.query(
        `SELECT COUNT(*) as total,
            SUM(CASE WHEN status = 'Approved' OR status = 'Enrolled' THEN 1 ELSE 0 END) as approved,
            SUM(CASE WHEN status LIKE 'Pending%' THEN 1 ELSE 0 END) as pending
     FROM student_courses`
    );
    const enrollmentStats = enrollmentResult.rows[0];

    // Get department count
    const deptResult = await pool.query('SELECT COUNT(*) as count FROM departments');
    const departmentCount = parseInt(deptResult.rows[0]?.count || 0);

    return {
        userCounts: {
            total: Object.values(userCounts).reduce((a, b) => a + b, 0),
            students: userCounts.student || 0,
            instructors: userCounts.instructor || 0,
            advisors: userCounts.advisor || 0,
            admins: userCounts.admin || 0
        },
        totalCourses,
        activeOfferings,
        departmentCount,
        currentSession: currentSessionId,
        enrollments: {
            total: parseInt(enrollmentStats?.total || 0),
            approved: parseInt(enrollmentStats?.approved || 0),
            pending: parseInt(enrollmentStats?.pending || 0)
        }
    };
};
