import pool from '../config/db.js';

/**
 * Create a new course offering proposal (pending admin approval)
 */
export const createProposal = async ({ courseId, sessionId, offeringDept, slotId, proposedBy, instructorIds }) => {
    const result = await pool.query(
        `INSERT INTO pending_course_offerings 
     (course_id, session_id, offering_dept, slot_id, proposed_by, instructor_ids, status)
     VALUES ($1, $2, $3, $4, $5, $6, 'Pending')
     RETURNING *`,
        [courseId, sessionId, offeringDept, slotId || null, proposedBy, instructorIds || []]
    );
    return result.rows[0];
};

/**
 * Get all pending proposals (for admin view)
 */
export const getPendingProposals = async () => {
    const result = await pool.query(
        `SELECT pco.*, 
            c.title as course_title, 
            c.credits as course_credits,
            c.ltp as course_ltp,
            d.name as dept_name,
            u.email as proposer_email
     FROM pending_course_offerings pco
     JOIN courses c ON pco.course_id = c.course_id
     LEFT JOIN departments d ON pco.offering_dept = d.dept_code
     JOIN users u ON pco.proposed_by = u.email
     WHERE pco.status = 'Pending'
     ORDER BY pco.created_at DESC`
    );
    return result.rows;
};

/**
 * Get proposal by ID
 */
export const getProposalById = async (id) => {
    const result = await pool.query(
        `SELECT pco.*, 
            c.title as course_title, 
            c.credits as course_credits,
            d.name as dept_name
     FROM pending_course_offerings pco
     JOIN courses c ON pco.course_id = c.course_id
     LEFT JOIN departments d ON pco.offering_dept = d.dept_code
     WHERE pco.id = $1`,
        [id]
    );
    return result.rows[0];
};

/**
 * Approve a proposal - creates the actual course offering and instructors
 */
export const approveProposal = async (id) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // Get the proposal
        const proposalResult = await client.query(
            'SELECT * FROM pending_course_offerings WHERE id = $1 AND status = $2',
            [id, 'Pending']
        );

        if (proposalResult.rowCount === 0) {
            throw new Error('Proposal not found or already processed');
        }

        const proposal = proposalResult.rows[0];

        // Create the course offering
        const offeringResult = await client.query(
            `INSERT INTO course_offerings 
       (course_id, session_id, offering_dept, slot_id, status)
       VALUES ($1, $2, $3, $4, 'Offered')
       RETURNING *`,
            [proposal.course_id, proposal.session_id, proposal.offering_dept, proposal.slot_id]
        );

        const offering = offeringResult.rows[0];

        // Add instructors
        const instructorIds = proposal.instructor_ids || [];
        for (let i = 0; i < instructorIds.length; i++) {
            await client.query(
                `INSERT INTO course_instructors (offering_id, instructor_id, is_coordinator)
         VALUES ($1, $2, $3)
         ON CONFLICT (offering_id, instructor_id) DO NOTHING`,
                [offering.id, instructorIds[i], i === 0] // First instructor is coordinator
            );
        }

        // Update proposal status
        await client.query(
            `UPDATE pending_course_offerings 
       SET status = 'Approved', updated_at = CURRENT_TIMESTAMP 
       WHERE id = $1`,
            [id]
        );

        await client.query('COMMIT');
        return offering;
    } catch (err) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release();
    }
};

/**
 * Reject a proposal
 */
export const rejectProposal = async (id) => {
    const result = await pool.query(
        `UPDATE pending_course_offerings 
     SET status = 'Rejected', updated_at = CURRENT_TIMESTAMP 
     WHERE id = $1 AND status = 'Pending'
     RETURNING *`,
        [id]
    );

    if (result.rowCount === 0) {
        throw new Error('Proposal not found or already processed');
    }

    return result.rows[0];
};

/**
 * Get proposals by proposer email
 */
export const getProposalsByProposer = async (email) => {
    const result = await pool.query(
        `SELECT pco.*, c.title as course_title
     FROM pending_course_offerings pco
     JOIN courses c ON pco.course_id = c.course_id
     WHERE pco.proposed_by = $1
     ORDER BY pco.created_at DESC`,
        [email]
    );
    return result.rows;
};
