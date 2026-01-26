import {
    getStudentDashboardStats,
    getInstructorDashboardStats,
    getAdvisorDashboardStats,
    getAdminDashboardStats
} from '../../models/dashboard.model.js';

/**
 * Get dashboard stats for the current user based on their role
 */
export const getDashboardStats = async (req, res) => {
    try {
        const { email, role } = req.user;
        console.log('[Dashboard] req.user:', JSON.stringify(req.user)); // Debug log
        console.log('[Dashboard] email:', email, 'role:', role); // Debug log
        let stats;

        switch (role) {
            case 'STUDENT':
                stats = await getStudentDashboardStats(email);
                break;
            case 'INSTRUCTOR':
                stats = await getInstructorDashboardStats(email);
                break;
            case 'ADVISOR':
                stats = await getAdvisorDashboardStats(email);
                break;
            case 'ADMIN':
                stats = await getAdminDashboardStats();
                break;
            default:
                return res.status(400).json({ error: 'Unknown role' });
        }

        res.json({ role, stats });
    } catch (err) {
        console.error('Error getting dashboard stats:', err);
        res.status(500).json({ error: err.message });
    }
};

/**
 * Get student-specific dashboard stats (for admins/advisors viewing student data)
 */
export const getStudentStats = async (req, res) => {
    try {
        const { email } = req.params;

        // Only allow if admin, advisor, or the student themselves
        if (req.user.role !== 'ADMIN' && req.user.role !== 'ADVISOR' && req.user.email !== email) {
            return res.status(403).json({ error: 'Forbidden' });
        }

        const stats = await getStudentDashboardStats(email);
        res.json({ stats });
    } catch (err) {
        console.error('Error getting student stats:', err);
        res.status(500).json({ error: err.message });
    }
};

/**
 * Get instructor-specific dashboard stats
 */
export const getInstructorStats = async (req, res) => {
    try {
        const { email } = req.params;

        // Only allow if admin or the instructor themselves
        if (req.user.role !== 'ADMIN' && req.user.email !== email) {
            return res.status(403).json({ error: 'Forbidden' });
        }

        const stats = await getInstructorDashboardStats(email);
        res.json({ stats });
    } catch (err) {
        console.error('Error getting instructor stats:', err);
        res.status(500).json({ error: err.message });
    }
};

/**
 * Get admin dashboard stats
 */
export const getAdminStats = async (req, res) => {
    try {
        if (req.user.role !== 'ADMIN') {
            return res.status(403).json({ error: 'Forbidden' });
        }

        const stats = await getAdminDashboardStats();
        res.json({ stats });
    } catch (err) {
        console.error('Error getting admin stats:', err);
        res.status(500).json({ error: err.message });
    }
};
