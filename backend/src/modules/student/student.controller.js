import { getStudentAcademicRecord, updateCourseGrade, updateSemesterRecord } from './student.service.js';
import { findStudentByEmail } from '../../models/student.model.js';
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

