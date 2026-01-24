import { Router } from 'express';
import { authMiddleware } from '../../middlewares/auth.middleware.js';
import * as offeringController from './offering.controller.js';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// Academic Sessions
router.get('/academic-sessions', offeringController.getSessions);
router.get('/academic-sessions/current', offeringController.getCurrentSession);

// Departments
router.get('/departments', offeringController.getDepartments);

// Search/Lookup
router.get('/courses/search', offeringController.searchCourses);
router.get('/instructors/search', offeringController.searchInstructors);

// Course Offerings CRUD
router.get('/offerings', offeringController.getOfferings);
router.post('/offerings', offeringController.createOffering);
router.get('/offerings/:id', offeringController.getOfferingById);
router.put('/offerings/:id', offeringController.updateOffering);
router.delete('/offerings/:id', offeringController.deleteOffering);

// Instructor Management
router.get('/offerings/:id/instructors', offeringController.getOfferingInstructors);
router.post('/offerings/:id/instructors', offeringController.addInstructor);
router.put('/offerings/:id/instructors/:instructorId', offeringController.updateInstructorCoordinator);
router.delete('/offerings/:id/instructors/:instructorId', offeringController.removeInstructor);

// Crediting Categorization
router.get('/offerings/:id/crediting', offeringController.getOfferingCrediting);
router.post('/offerings/:id/crediting', offeringController.addCrediting);
router.delete('/offerings/:id/crediting/:creditId', offeringController.removeCrediting);

// Course Offering Proposals (instructor proposes, admin approves)
router.post('/offerings/propose', offeringController.proposeOffering);
router.get('/offerings/pending', offeringController.getPendingProposals);
router.post('/offerings/pending/:id/approve', offeringController.approveProposal);
router.post('/offerings/pending/:id/reject', offeringController.rejectProposal);

export default router;
