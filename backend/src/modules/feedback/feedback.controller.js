import * as feedbackModel from '../../models/courseFeedback.model.js';

export const submitFeedback = async (req, res) => {
    try {
        const { courseId } = req.params;
        const { feedbackType, instructorId, ratings, comments } = req.body;
        const studentEmail = req.user.email; // From authMiddleware

        if (!courseId || !feedbackType || !instructorId || !ratings) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Check if duplicate
        const exists = await feedbackModel.checkFeedbackExists(courseId, studentEmail, feedbackType, instructorId);
        if (exists) {
            return res.status(409).json({ error: 'Feedback already submitted for this course/instructor/type' });
        }

        const feedback = await feedbackModel.createFeedback({
            courseId,
            studentEmail,
            feedbackType,
            instructorId,
            ratings,
            comments
        });

        res.status(201).json(feedback);
    } catch (error) {
        console.error('Submit feedback error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
