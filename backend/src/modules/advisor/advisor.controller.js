import { getAdvisees, getAdviseeProgress, getAdvisorPendingRequests } from '../../models/advisor.model.js';

/**
 * Get list of advisees for the current advisor
 */
export const getAdviseesHandler = async (req, res) => {
    try {
        const advisorEmail = req.user.email;
        const advisees = await getAdvisees(advisorEmail);

        res.json({
            advisees,
            count: advisees.length,
            atRiskCount: advisees.filter(a => a.status === 'At Risk').length
        });
    } catch (err) {
        console.error('Error getting advisees:', err);
        res.status(500).json({ error: err.message });
    }
};

/**
 * Get detailed progress for a specific advisee
 */
export const getAdviseeProgressHandler = async (req, res) => {
    try {
        const advisorEmail = req.user.email;
        const { email } = req.params;

        const progress = await getAdviseeProgress(advisorEmail, email);
        res.json(progress);
    } catch (err) {
        console.error('Error getting advisee progress:', err);
        if (err.message.includes('not found') || err.message.includes('not assigned')) {
            return res.status(404).json({ error: err.message });
        }
        res.status(500).json({ error: err.message });
    }
};

/**
 * Get pending registration requests for advisor's advisees
 */
export const getPendingRequestsHandler = async (req, res) => {
    try {
        const advisorEmail = req.user.email;
        const requests = await getAdvisorPendingRequests(advisorEmail);

        res.json({
            requests,
            count: requests.length
        });
    } catch (err) {
        console.error('Error getting pending requests:', err);
        res.status(500).json({ error: err.message });
    }
};
