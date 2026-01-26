import React, { useEffect, useState } from 'react';
import { Card, Button, Badge, Modal } from '../../components/ui';
import { getRegistrationRequests, updateRegistrationStatus } from '../../utils/api';
import { Check, X, Clock, AlertCircle, FileText, CheckCircle, XCircle } from 'lucide-react';

interface Request {
    id: number;
    student_email: string;
    course_id: string;
    course_title: string;
    semester: string;
    entry_no: string;
    batch: number;
    credits: number;
    status: string;
    created_at: string;
}

const EnrollmentRequests: React.FC = () => {
    const [requests, setRequests] = useState<Request[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [processingId, setProcessingId] = useState<number | null>(null);

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            setLoading(true);
            setError(null);
            // Fetch specifically pending instructor requests, or all if we want to show history
            const response = await getRegistrationRequests({ status: 'PENDING_INSTRUCTOR' });
            setRequests(response.requests);
        } catch (err: any) {
            console.error('Failed to fetch requests:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (id: number, action: 'approve' | 'reject') => {
        try {
            setProcessingId(id);
            await updateRegistrationStatus(id, action === 'approve' ? 'PENDING_ADVISOR' : 'REJECTED_INSTRUCTOR');

            // Update local state to remove the processed item or update its status
            setRequests(current => current.filter(req => req.id !== id));

            // Show success toast/notification ideally
        } catch (err: any) {
            console.error(`Failed to ${action} request:`, err);
            setError(`Failed to ${action} request: ${err.message}`);
        } finally {
            setProcessingId(null);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-primary">Enrollment Requests</h1>
                    <p className="text-secondary text-sm">Review student course registration requests</p>
                </div>
                <Button onClick={fetchRequests} variant="secondary">
                    Refresh List
                </Button>
            </div>

            {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-lg flex items-center">
                    <AlertCircle size={20} className="mr-2" />
                    {error}
                </div>
            )}

            {requests.length === 0 ? (
                <Card className="p-12 text-center">
                    <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle size={32} className="text-green-500" />
                    </div>
                    <h3 className="text-lg font-semibold text-primary mb-2">All Caught Up!</h3>
                    <p className="text-secondary">No pending enrollment requests at this time.</p>
                </Card>
            ) : (
                <div className="grid gap-4">
                    {requests.map((req) => (
                        <Card key={req.id} className="p-0 overflow-hidden">
                            <div className="p-4 md:p-6 grid md:grid-cols-[2fr,1fr,auto] gap-4 items-center">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="font-semibold text-primary text-lg">{req.course_id}</span>
                                        <span className="text-secondary">• {req.course_title}</span>
                                    </div>
                                    <div className="flex flex-wrap gap-4 text-sm text-secondary">
                                        <div className="flex items-center gap-1">
                                            <FileText size={14} />
                                            {req.entry_no}
                                        </div>
                                        <div className="flex items-center gap-1">
                                            Batch {req.batch}
                                        </div>
                                        <div className="flex items-center gap-1">
                                            {req.credits} Credits
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Clock size={14} />
                                            {new Date(req.created_at).toLocaleDateString()}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <Badge color="yellow">
                                        Awaiting Approval
                                    </Badge>
                                </div>

                                <div className="flex items-center gap-2 justify-end">
                                    <Button
                                        onClick={() => handleAction(req.id, 'reject')}
                                        disabled={processingId === req.id}
                                        variant="danger"
                                        className="gap-2"
                                    >
                                        {processingId === req.id ? '...' : <X size={16} />}
                                        Reject
                                    </Button>
                                    <Button
                                        onClick={() => handleAction(req.id, 'approve')}
                                        disabled={processingId === req.id}
                                        className="gap-2 bg-green-600 hover:bg-green-700"
                                    >
                                        {processingId === req.id ? '...' : <Check size={16} />}
                                        Approve
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
};

export default EnrollmentRequests;
