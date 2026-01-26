import { listCourses, findCourseById, createCourse, updateCourse } from '../../models/course.model.js';
import { enrollStudent, getCourseEnrollments, enrollBatch, updateEnrollment, deleteEnrollment, getEnrollmentById } from '../../models/enrollment.model.js';
import { getInstructorCourses } from '../../models/instructor.model.js';
import pool from '../../config/db.js';

export const getAllCourses = async (req, res) => {
  try {
    const filters = {
      status: req.query.status,
      instructorId: req.query.instructorId,
      type: req.query.type,
      code: req.query.code,
      title: req.query.title,
      department: req.query.department,
      ltp: req.query.ltp
    };

    const courses = await listCourses(filters);
    res.json({ courses });
  } catch (err) {
    console.error('Error getting courses:', err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * Validates the L-T-P-S-C structure.
 * Format: L-T-P-S-C (e.g., "3-1-2-6-4")
 * Rules:
 * S = 2L + P/2 - T
 * C = L + P/2
 */
const validateLPTSC = (ltpString) => {
  if (!ltpString) return { valid: true }; // Allow empty if not strict yet

  const parts = ltpString.split('-').map(Number);
  if (parts.length !== 5) return { valid: false, error: 'Invalid format. Use L-T-P-S-C' };

  const [L, T, P, S, C] = parts;

  const expectedS = (2 * L) + (P / 2) - T;
  const expectedC = L + (P / 2);

  if (S !== expectedS) {
    return { valid: false, error: `Math mismatch: S should be ${expectedS} (2*${L} + ${P}/2 - ${T}), got ${S}` };
  }

  if (C !== expectedC) {
    return { valid: false, error: `Math mismatch: C should be ${expectedC} (${L} + ${P}/2), got ${C}` };
  }

  return { valid: true };
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
    const { ltp } = req.body;
    const validation = validateLPTSC(ltp);
    if (!validation.valid) {
      return res.status(400).json({ error: validation.error });
    }

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

    // --- ANTI-CLASH & CREDIT LOGIC START ---

    // 1. Get New Course Details (Slot & Credits) from Offering
    // We assume 'semester' matches 'session_id' in course_offerings
    const newCourseQuery = `
      SELECT co.slot_id, c.credits, c.title, s.timings as slot_timings
      FROM course_offerings co
      JOIN courses c ON co.course_id = c.course_id
      LEFT JOIN slots s ON co.slot_id = s.slot_id
      WHERE co.course_id = $1 AND co.session_id = $2
    `;
    const newCourseResult = await pool.query(newCourseQuery, [courseId, semester]);

    if (newCourseResult.rowCount === 0) {
      return res.status(404).json({ error: 'Course offering not found for this semester' });
    }

    const { slot_id: newSlotId, credits: newCredits, title: newTitle, slot_timings: newSlotTimings } = newCourseResult.rows[0];

    // 2. Get Student's Current Enrollments (Slots & Credits)
    // We only care about active enrollments (not dropped/rejected)
    // We join with course_offerings to get the slot for *that* semester
    const existingEnrollmentsQuery = `
      SELECT sc.course_id, co.slot_id, c.credits, s.timings as slot_timings
      FROM student_courses sc
      JOIN course_offerings co ON sc.course_id = co.course_id AND sc.semester = co.session_id
      JOIN courses c ON sc.course_id = c.course_id
      LEFT JOIN slots s ON co.slot_id = s.slot_id
      WHERE sc.student_email = $1 
        AND sc.semester = $2 
        AND sc.status NOT IN ('Dropped', 'Rejected', 'Withdrawn')
    `;
    const existingEnrollmentsResult = await pool.query(existingEnrollmentsQuery, [studentEmail, semester]);
    const existingCourses = existingEnrollmentsResult.rows;

    // 3. Check for Slot Conflict (The Intersection Check)
    const conflictingCourse = existingCourses.find(c => c.slot_id === newSlotId);
    if (conflictingCourse) {
      return res.status(409).json({
        error: `Schedule Conflict: You are already registered for a course in Slot ${newSlotTimings || newSlotId}.`,
        details: `Conflict with course ${conflictingCourse.course_id} (Slot ${conflictingCourse.slot_timings || conflictingCourse.slot_id})`
      });
    }

    // 4. Check Credit Limit
    const currentCredits = existingCourses.reduce((sum, c) => sum + c.credits, 0);
    const totalCredits = currentCredits + newCredits;
    // Limit is 24 as per prompt
    if (totalCredits > 24) {
      return res.status(400).json({
        error: 'Credit Limit Exceeded',
        details: `Current credits: ${currentCredits}. New total: ${totalCredits}. Limit: 24.`
      });
    }

    // --- ANTI-CLASH & CREDIT LOGIC END ---

    // Create enrollment with PENDING_INSTRUCTOR status
    // Student enrolls -> Instructor approves -> Advisor approves -> Enrolled
    const enrollment = await enrollStudent({
      studentEmail,
      courseId,
      semester,
      status: 'PENDING_INSTRUCTOR'
    });

    res.status(201).json({
      message: 'Enrollment request submitted. Awaiting instructor approval.',
      enrollment
    });
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
    const userRole = req.user.role;
    const userEmail = req.user.email;

    let query = `SELECT sc.*, s.entry_no, s.batch, c.title as course_title, c.credits
                 FROM student_courses sc
                 LEFT JOIN students s ON sc.student_email = s.email
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

    // Role-based filtering
    if (userRole === 'INSTRUCTOR') {
      const myCourses = await getInstructorCourses(userEmail);
      const courseIds = myCourses.map(c => c.id);

      if (courseIds.length === 0) {
        // Instructor teaches no courses, so no requests to show
        return res.json({ requests: [] });
      }

      query += ` AND sc.course_id = ANY($${paramCount++})`;
      params.push(courseIds);
    }

    // For Advisor - filter by advisees (Optional, if "s.advisor_id" exists or similar)
    // if (userRole === 'ADVISOR') { ... }

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
    const { status, grade, gradePoints, creditsEarned, action } = req.body;
    const userRole = req.user.role;

    // Get current enrollment to check current status
    const currentEnrollment = await getEnrollmentById(id);
    if (!currentEnrollment) {
      return res.status(404).json({ error: 'Enrollment record not found' });
    }

    let newStatus = status;
    const currentStatus = currentEnrollment.status;

    // Validate and determine new status based on role and current status
    // This works for both action-based and direct status updates
    if (action === 'approve' || status === 'PENDING_ADVISOR' || status === 'APPROVED') {
      // Instructor approval flow: PENDING_INSTRUCTOR -> PENDING_ADVISOR
      if (userRole === 'INSTRUCTOR') {
        if (currentStatus === 'PENDING_INSTRUCTOR') {
          newStatus = 'PENDING_ADVISOR';
        } else {
          return res.status(403).json({ error: 'Not authorized to approve at this stage. Current status: ' + currentStatus });
        }
      }
      // Advisor approval flow: PENDING_ADVISOR -> APPROVED
      else if (userRole === 'ADVISOR') {
        if (currentStatus === 'PENDING_ADVISOR') {
          newStatus = 'APPROVED'; // Use uppercase to match frontend enum
        } else {
          return res.status(403).json({ error: 'Not authorized to approve at this stage. Current status: ' + currentStatus });
        }
      }
      // Admin can approve directly to any status
      else if (userRole === 'ADMIN') {
        newStatus = status || 'APPROVED';
      } else {
        return res.status(403).json({ error: 'Not authorized to approve enrollments' });
      }
    }
    else if (action === 'reject' || status === 'REJECTED_INSTRUCTOR' || status === 'REJECTED_ADVISOR') {
      // Instructor rejection
      if (userRole === 'INSTRUCTOR') {
        if (currentStatus === 'PENDING_INSTRUCTOR') {
          newStatus = 'REJECTED_INSTRUCTOR';
        } else {
          return res.status(403).json({ error: 'Not authorized to reject at this stage' });
        }
      }
      // Advisor rejection
      else if (userRole === 'ADVISOR') {
        if (currentStatus === 'PENDING_ADVISOR') {
          newStatus = 'REJECTED_ADVISOR';
        } else {
          return res.status(403).json({ error: 'Not authorized to reject at this stage' });
        }
      }
      // Admin can reject
      else if (userRole === 'ADMIN') {
        newStatus = status || 'REJECTED';
      } else {
        return res.status(403).json({ error: 'Not authorized to reject enrollments' });
      }
    }
    // For grade updates or other status changes (only allowed for instructors/admins)
    else if (grade !== undefined || gradePoints !== undefined) {
      // Grade updates are allowed without status change
      newStatus = currentStatus;
    }

    const enrollment = await updateEnrollment(id, {
      status: newStatus,
      grade,
      gradePoints,
      creditsEarned
    });

    if (!enrollment) {
      return res.status(404).json({ error: 'Enrollment record not found' });
    }

    res.json({
      message: `Enrollment ${action || 'updated'} successfully`,
      enrollment
    });
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
