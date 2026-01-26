
import * as financeModel from '../../models/finance.model.js';

export const makePayment = async (req, res) => {
    try {
        const { sessionId, amount, bank, transactionNo, transactionDate, proofUrl } = req.body;
        const studentEmail = req.user.email;

        // Basic validation
        if (!sessionId || !amount || !transactionNo) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const payment = await financeModel.createPayment({
            studentEmail,
            sessionId,
            amount,
            bank,
            transactionNo,
            transactionDate,
            proofUrl
        });

        res.status(201).json(payment);
    } catch (error) {
        if (error.code === '23505') { // Unique violation
            return res.status(409).json({ error: 'Transaction number already used' });
        }
        console.error('Payment error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const getHistory = async (req, res) => {
    try {
        const studentEmail = req.user.email;
        const history = await financeModel.getPaymentHistory(studentEmail);
        res.json(history);
    } catch (error) {
        console.error('Payment history error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
