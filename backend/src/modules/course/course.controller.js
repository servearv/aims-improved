import { listCourses, findCourseById, createCourse, updateCourse } from '../../models/course.model.js';
import { enrollStudent, getCourseEnrollments, enrollBatch, updateEnrollment } from '../../models/enrollment.model.js';
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
    const { status } = req.body;

    const enrollment = await updateEnrollment(id, { status });

    if (!enrollment) {
      return res.status(404).json({ error: 'Enrollment record not found' });
    }

    res.json({ enrollment });
  } catch (err) {
    console.error('Error updating registration status:', err);
    res.status(500).json({ error: err.message });
  }
};
