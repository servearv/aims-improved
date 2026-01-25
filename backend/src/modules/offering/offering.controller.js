import * as offeringModel from '../../models/courseOffering.model.js';
import * as sessionModel from '../../models/academicSession.model.js';
import * as deptModel from '../../models/department.model.js';
import * as pendingOfferingModel from '../../models/pendingOffering.model.js';

// ============= Academic Sessions =============

export const getSessions = async (req, res) => {
    try {
        const sessions = await sessionModel.listSessions();
        res.json({ sessions });
    } catch (err) {
        console.error('Error getting sessions:', err);
        res.status(500).json({ error: err.message });
    }
};

export const getCurrentSession = async (req, res) => {
    try {
        const session = await sessionModel.getCurrentSession();
        res.json({ session });
    } catch (err) {
        console.error('Error getting current session:', err);
        res.status(500).json({ error: err.message });
    }
};

// ============= Departments =============

export const getDepartments = async (req, res) => {
    try {
        const departments = await deptModel.listDepartments();
        res.json({ departments });
    } catch (err) {
        console.error('Error getting departments:', err);
        res.status(500).json({ error: err.message });
    }
};

// ============= Course Offerings =============

export const getOfferings = async (req, res) => {
    try {
        const filters = {
            sessionId: req.query.sessionId,
            deptCode: req.query.deptCode,
            status: req.query.status,
            courseId: req.query.courseId,
            title: req.query.title,
            instructorId: req.query.instructorId,
            ltp: req.query.ltp
        };

        const offerings = await offeringModel.listOfferings(filters);
        res.json({ offerings });
    } catch (err) {
        console.error('Error getting offerings:', err);
        res.status(500).json({ error: err.message });
    }
};

export const getOfferingById = async (req, res) => {
    try {
        const { id } = req.params;
        const offering = await offeringModel.getOfferingById(id);

        if (!offering) {
            return res.status(404).json({ error: 'Offering not found' });
        }

        res.json({ offering });
    } catch (err) {
        console.error('Error getting offering:', err);
        res.status(500).json({ error: err.message });
    }
};

export const createOffering = async (req, res) => {
    try {
        const offering = await offeringModel.createOffering(req.body);
        res.status(201).json({ offering });
    } catch (err) {
        console.error('Error creating offering:', err);
        res.status(500).json({ error: err.message });
    }
};

export const updateOffering = async (req, res) => {
    try {
        const { id } = req.params;
        const offering = await offeringModel.updateOffering(id, req.body);

        if (!offering) {
            return res.status(404).json({ error: 'Offering not found' });
        }

        res.json({ offering });
    } catch (err) {
        console.error('Error updating offering:', err);
        res.status(500).json({ error: err.message });
    }
};

export const deleteOffering = async (req, res) => {
    try {
        const { id } = req.params;
        const offering = await offeringModel.deleteOffering(id);

        if (!offering) {
            return res.status(404).json({ error: 'Offering not found' });
        }

        res.json({ message: 'Offering deleted', offering });
    } catch (err) {
        console.error('Error deleting offering:', err);
        res.status(500).json({ error: err.message });
    }
};

// ============= Instructor Management =============

export const getOfferingInstructors = async (req, res) => {
    try {
        const { id } = req.params;
        const instructors = await offeringModel.getOfferingInstructors(id);
        res.json({ instructors });
    } catch (err) {
        console.error('Error getting instructors:', err);
        res.status(500).json({ error: err.message });
    }
};

export const addInstructor = async (req, res) => {
    try {
        const { id } = req.params;
        const { instructorId, isCoordinator } = req.body;

        if (!instructorId) {
            return res.status(400).json({ error: 'instructorId is required' });
        }

        const instructor = await offeringModel.addInstructor(id, instructorId, isCoordinator || false);
        res.status(201).json({ instructor });
    } catch (err) {
        console.error('Error adding instructor:', err);
        res.status(500).json({ error: err.message });
    }
};

export const removeInstructor = async (req, res) => {
    try {
        const { id, instructorId } = req.params;
        const result = await offeringModel.removeInstructor(id, instructorId);

        if (!result) {
            return res.status(404).json({ error: 'Instructor not found on this offering' });
        }

        res.json({ message: 'Instructor removed' });
    } catch (err) {
        console.error('Error removing instructor:', err);
        res.status(500).json({ error: err.message });
    }
};

export const updateInstructorCoordinator = async (req, res) => {
    try {
        const { id, instructorId } = req.params;
        const { isCoordinator } = req.body;

        const result = await offeringModel.updateInstructorCoordinator(id, instructorId, isCoordinator);

        if (!result) {
            return res.status(404).json({ error: 'Instructor not found on this offering' });
        }

        res.json({ instructor: result });
    } catch (err) {
        console.error('Error updating instructor:', err);
        res.status(500).json({ error: err.message });
    }
};

// ============= Crediting Categorization =============

export const getOfferingCrediting = async (req, res) => {
    try {
        const { id } = req.params;
        const crediting = await offeringModel.getOfferingCrediting(id);
        res.json({ crediting });
    } catch (err) {
        console.error('Error getting crediting:', err);
        res.status(500).json({ error: err.message });
    }
};

export const addCrediting = async (req, res) => {
    try {
        const { id } = req.params;
        const crediting = await offeringModel.addCrediting(id, req.body);
        res.status(201).json({ crediting });
    } catch (err) {
        console.error('Error adding crediting:', err);
        res.status(500).json({ error: err.message });
    }
};

export const removeCrediting = async (req, res) => {
    try {
        const { creditId } = req.params;
        const result = await offeringModel.removeCrediting(creditId);

        if (!result) {
            return res.status(404).json({ error: 'Crediting not found' });
        }

        res.json({ message: 'Crediting removed' });
    } catch (err) {
        console.error('Error removing crediting:', err);
        res.status(500).json({ error: err.message });
    }
};

// ============= Search/Lookup =============

export const searchCourses = async (req, res) => {
    try {
        const { q } = req.query;
        if (!q || q.length < 2) {
            return res.json({ courses: [] });
        }
        const courses = await offeringModel.searchCourses(q);
        res.json({ courses });
    } catch (err) {
        console.error('Error searching courses:', err);
        res.status(500).json({ error: err.message });
    }
};

export const searchInstructors = async (req, res) => {
    try {
        const { q } = req.query;
        if (!q || q.length < 2) {
            return res.json({ instructors: [] });
        }
        const instructors = await offeringModel.searchInstructors(q);
        res.json({ instructors });
    } catch (err) {
        console.error('Error searching instructors:', err);
        res.status(500).json({ error: err.message });
    }
};

// ============= Course Offering Proposals =============

export const proposeOffering = async (req, res) => {
    try {
        const { courseId, sessionId, offeringDept, slotId, instructorIds } = req.body;
        const proposedBy = req.user.email;

        if (!courseId || !sessionId || !offeringDept) {
            return res.status(400).json({ error: 'courseId, sessionId, and offeringDept are required' });
        }

        const proposal = await pendingOfferingModel.createProposal({
            courseId,
            sessionId,
            offeringDept,
            slotId,
            proposedBy,
            instructorIds: instructorIds || []
        });

        res.status(201).json({
            message: 'Course proposal submitted for admin approval',
            proposal
        });
    } catch (err) {
        console.error('Error creating proposal:', err);
        res.status(500).json({ error: err.message });
    }
};

export const getPendingProposals = async (req, res) => {
    try {
        const proposals = await pendingOfferingModel.getPendingProposals();
        res.json({ proposals });
    } catch (err) {
        console.error('Error getting pending proposals:', err);
        res.status(500).json({ error: err.message });
    }
};

export const approveProposal = async (req, res) => {
    try {
        const { id } = req.params;
        const offering = await pendingOfferingModel.approveProposal(id);
        res.json({
            message: 'Proposal approved and course offering created',
            offering
        });
    } catch (err) {
        console.error('Error approving proposal:', err);
        res.status(500).json({ error: err.message });
    }
};

export const rejectProposal = async (req, res) => {
    try {
        const { id } = req.params;
        const proposal = await pendingOfferingModel.rejectProposal(id);
        res.json({
            message: 'Proposal rejected',
            proposal
        });
    } catch (err) {
        console.error('Error rejecting proposal:', err);
        res.status(500).json({ error: err.message });
    }
};
