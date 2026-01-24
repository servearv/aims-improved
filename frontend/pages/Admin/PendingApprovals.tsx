import React, { useState, useEffect } from 'react';
import { Card, Button, Badge } from '../../components/ui';
import { Check, X, Loader2, AlertCircle, Clock } from 'lucide-react';
import * as api from '../../utils/api';

interface Proposal {
    id: number;
    course_id: string;
    course_title: string;
    course_credits: number;
    course_ltp: string;
    session_id: string;
    offering_dept: string;
    dept_name: string;
    proposer_email: string;
    instructor_ids: string[];
    status: string;
    created_at: string;
}

const PendingApprovals: React.FC = () => {
    const [proposals, setProposals] = useState<Proposal[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [actionLoading, setActionLoading] = useState<number | null>(null);

    useEffect(() => {
        fetchPendingProposals();
    }, []);

    const fetchPendingProposals = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await api.getPendingProposals();
            setProposals(data.proposals || []);
        } catch (err: any) {
            console.error('Failed to fetch pending proposals', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (proposalId: number) => {
        try {
            setActionLoading(proposalId);
            await api.approveProposal(proposalId);
            // Remove from list
            setProposals(proposals.filter(p => p.id !== proposalId));
        } catch (err: any) {
            console.error('Failed to approve proposal', err);
            alert(err.message);
        } finally {
            setActionLoading(null);
        }
    };

    const handleReject = async (proposalId: number) => {
        try {
            setActionLoading(proposalId);
            await api.rejectProposal(proposalId);
            // Remove from list
            setProposals(proposals.filter(p => p.id !== proposalId));
        } catch (err: any) {
            console.error('Failed to reject proposal', err);
            alert(err.message);
        } finally {
            setActionLoading(null);
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white">Pending Course Proposals</h1>
                    <p className="text-gray-400 text-sm">Review and approve course offering proposals from instructors.</p>
                </div>

                <div className="flex items-center gap-2 bg-yellow-500/10 px-3 py-1.5 rounded-full border border-yellow-500/20 text-yellow-500 text-sm">
                    <Clock size={16} />
                    <span className="font-bold">{proposals.length}</span> Pending
                </div>
            </div>

            <Card className="p-0 bg-[#18181b] border-white/10 overflow-hidden">
                {error && (
                    <div className="p-4 bg-red-500/10 text-red-400 text-sm flex items-center gap-2 border-b border-white/5">
                        <AlertCircle size={16} /> {error}
                    </div>
                )}

                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-black/20 text-gray-400 border-b border-white/5">
                            <tr>
                                <th className="px-6 py-4 font-medium">Course</th>
                                <th className="px-6 py-4 font-medium">Session</th>
                                <th className="px-6 py-4 font-medium">Department</th>
                                <th className="px-6 py-4 font-medium">Proposed By</th>
                                <th className="px-6 py-4 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {loading ? (
                                <tr><td colSpan={5} className="p-8 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-blue-500" /></td></tr>
                            ) : proposals.length === 0 ? (
                                <tr><td colSpan={5} className="p-8 text-center text-gray-500">No pending proposals found.</td></tr>
                            ) : proposals.map((proposal) => (
                                <tr key={proposal.id} className="hover:bg-white/[0.02]">
                                    <td className="px-6 py-4">
                                        <div className="text-white font-medium">{proposal.course_title}</div>
                                        <div className="text-xs text-gray-400 font-mono">{proposal.course_id}</div>
                                        {proposal.course_ltp && (
                                            <Badge color="gray" className="mt-1">{proposal.course_ltp}</Badge>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-gray-300">{proposal.session_id}</td>
                                    <td className="px-6 py-4 text-gray-300">{proposal.dept_name || proposal.offering_dept}</td>
                                    <td className="px-6 py-4">
                                        <div className="text-gray-300">{proposal.proposer_email}</div>
                                        <div className="text-xs text-gray-500">
                                            {new Date(proposal.created_at).toLocaleDateString()}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex gap-2 justify-end">
                                            <Button
                                                onClick={() => handleApprove(proposal.id)}
                                                disabled={actionLoading === proposal.id}
                                                className="bg-green-600 hover:bg-green-500 text-white gap-2"
                                            >
                                                {actionLoading === proposal.id ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                                                Approve
                                            </Button>
                                            <Button
                                                onClick={() => handleReject(proposal.id)}
                                                disabled={actionLoading === proposal.id}
                                                variant="secondary"
                                                className="text-red-400 hover:text-red-300 gap-2"
                                            >
                                                <X size={16} />
                                                Reject
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};

export default PendingApprovals;
