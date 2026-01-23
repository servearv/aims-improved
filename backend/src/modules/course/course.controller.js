import { listCourses, findCourseById, createCourse, updateCourse } from '../../models/course.model.js';
import { enrollStudent, getCourseEnrollments, enrollBatch, updateEnrollment, deleteEnrollment, getEnrollmentById } from '../../models/enrollment.model.js';
import { getInstructorCourses } from '../../models/instructor.model.js';
import pool from '../../config/db.js';

export const getAllCourses = async (req, res) => {
  try {
    const filters = {
      status: req.query.status,
      instructorId: req.query.instructorId,
      type: req.query.type
    };

    const courses = await listCourses(filters);
    res.json({ courses });
  } catch (err) {
    console.error('Error getting courses:', err);
    res.status(500).json({ error: err.message });
  }
};

export const getCourseById = async (req, res) => {
  try {
    const { courseId } = req.params;
    const course = await findCourseById(courseId);

    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    res.json({ course });
  } catch (err) {
    console.error('Error getting course:', err);
    res.status(500).json({ error: err.message });
  }
};

export const createCourseHandler = async (req, res) => {
  try {
    const course = await createCourse(req.body);
    res.status(201).json({ course });
  } catch (err) {
    console.error('Error creating course:', err);
    res.status(500).json({ error: err.message });
  }
};

export const updateCourseHandler = async (req, res) => {
  try {
    const { courseId } = req.params;
    const course = await updateCourse(courseId, req.body);

    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    res.json({ course });
  } catch (err) {
    console.error('Error updating course:', err);
    res.status(500).json({ error: err.message });
  }
};

export const enrollInCourse = async (req, res) => {
  try {
    const { courseId, semester } = req.body;
    const studentEmail = req.user.email;

    const enrollment = await enrollStudent({
      studentEmail,
      courseId,
      semester,
      status: 'Enrolled'
    });

    res.status(201).json({ enrollment });
  } catch (err) {
    console.error('Error enrolling in course:', err);
    res.status(500).json({ error: err.message });
  }
};

export const getCourseEnrollmentsHandler = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { semester } = req.query;

    const enrollments = await getCourseEnrollments(courseId, semester || null);

    res.json({ enrollments });
  } catch (err) {
    console.error('Error getting course enrollments:', err);
    res.status(500).json({ error: err.message });
  }
};

export const enrollBatchHandler = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { batch, semester } = req.body;

    if (!batch || !semester) {
      return res.status(400).json({ error: 'Batch and Semester are required' });
    }

    const enrollments = await enrollBatch({
      courseId,
      batch: parseInt(batch),
      semester,
      status: 'Enrolled'
    });

    res.status(201).json({
      message: `Enrolled ${enrollments.length} students from batch ${batch}`,
      count: enrollments.length
    });
  } catch (err) {
    console.error('Error batch enrolling:', err);
    res.status(500).json({ error: err.message });
  }
};

export const getRegistrationRequests = async (req, res) => {
  try {
    const { status, semester } = req.query;

    let query = `SELECT sc.*, s.entry_no, s.batch, c.title as course_title, c.credits
                 FROM student_courses sc
                 JOIN students s ON sc.student_email = s.email
                 JOIN courses c ON sc.course_id = c.course_id
                 WHERE 1=1`;
    const params = [];
    let paramCount = 1;

    if (status) {
      query += ` AND sc.status = $${paramCount++}`;
      params.push(status);
    }

    if (semester) {
      query += ` AND sc.semester = $${paramCount++}`;
      params.push(semester);
    }

    // Role-based filtering (optional, but good practice)
    // For Advisor, we might want to filter by advisees, but for now we show all as per request

    query += ` ORDER BY sc.created_at DESC`;

    const result = await pool.query(query, params);
    res.json({ requests: result.rows });
  } catch (err) {
    console.error('Error fetching registration requests:', err);
    res.status(500).json({ error: err.message });
  }
};

export const updateRegistrationStatusHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, grade, gradePoints, creditsEarned } = req.body;

    const enrollment = await updateEnrollment(id, { status, grade, gradePoints, creditsEarned });

    if (!enrollment) {
      return res.status(404).json({ error: 'Enrollment record not found' });
    }

    res.json({ enrollment });
  } catch (err) {
    console.error('Error updating registration status:', err);
    res.status(500).json({ error: err.message });
  }
};

export const dropCourseHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const userEmail = req.user.email;
    const userRole = req.user.role;

    // Admin can delete any, students can only delete their own
    const isAdmin = userRole === 'ADMIN';

    const enrollment = await deleteEnrollment(
      parseInt(id),
      isAdmin ? null : userEmail
    );

    if (!enrollment) {
      return res.status(404).json({ error: 'Enrollment not found' });
    }

    res.json({
      message: 'Course dropped successfully',
      enrollment
    });
  } catch (err) {
    console.error('Error dropping course:', err);
    if (err.message.includes('not authorized')) {
      return res.status(403).json({ error: err.message });
    }
    res.status(500).json({ error: err.message });
  }
};

/**
 * Get courses taught by the current instructor
 */
export const getInstructorCoursesHandler = async (req, res) => {
  try {
    const email = req.user.email;
    const courses = await getInstructorCourses(email);
    res.json({ courses });
  } catch (err) {
    console.error('Error getting instructor courses:', err);
    res.status(500).json({ error: err.message });
  }
};

// Grade to grade points mapping
const gradePointMap = {
  'A+': 10.0, 'A': 10.0, 'A-': 9.0,
  'B+': 8.0, 'B': 8.0, 'B-': 7.0,
  'C+': 6.0, 'C': 6.0, 'C-': 5.0,
  'D': 4.0, 'E': 0.0, 'F': 0.0,
  'S': null, 'X': null, 'I': null, 'W': null
};

/**
 * Bulk upload grades for a course
 * Expects: { grades: [{ entryNo: string, grade: string }, ...] }
 */
export const uploadBulkGradesHandler = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { grades, semester } = req.body;

    if (!grades || !Array.isArray(grades)) {
      return res.status(400).json({ error: 'grades array is required' });
    }

    const results = {
      success: [],
      failed: []
    };

    for (const gradeEntry of grades) {
      try {
        const { entryNo, grade } = gradeEntry;

        if (!entryNo || !grade) {
          results.failed.push({ entryNo, error: 'Missing entryNo or grade' });
          continue;
        }

        // Find student by entry number
        const studentResult = await pool.query(
          'SELECT email FROM students WHERE entry_no = $1',
          [entryNo]
        );

        if (studentResult.rowCount === 0) {
          results.failed.push({ entryNo, error: 'Student not found' });
          continue;
        }

        const studentEmail = studentResult.rows[0].email;

        // Find enrollment for this course
        let enrollmentQuery = `
          SELECT id FROM student_courses 
          WHERE student_email = $1 AND course_id = $2
        `;
        const params = [studentEmail, courseId];

        if (semester) {
          enrollmentQuery += ` AND semester = $3`;
          params.push(semester);
        }

        enrollmentQuery += ` LIMIT 1`;

        const enrollmentResult = await pool.query(enrollmentQuery, params);

        if (enrollmentResult.rowCount === 0) {
          results.failed.push({ entryNo, error: 'Enrollment not found' });
          continue;
        }

        const enrollmentId = enrollmentResult.rows[0].id;
        const gradePoints = gradePointMap[grade.toUpperCase()] !== undefined
          ? gradePointMap[grade.toUpperCase()]
          : null;

        // Update the enrollment with grade
        await updateEnrollment(enrollmentId, {
          grade: grade.toUpperCase(),
          gradePoints
        });

        results.success.push({ entryNo, grade: grade.toUpperCase() });
      } catch (err) {
        results.failed.push({ entryNo: gradeEntry.entryNo, error: err.message });
      }
    }

    res.json({
      message: `Processed ${results.success.length} grades successfully, ${results.failed.length} failed`,
      results
    });
  } catch (err) {
    console.error('Error uploading bulk grades:', err);
    res.status(500).json({ error: err.message });
  }
};
