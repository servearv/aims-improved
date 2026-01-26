import React, { useState, useEffect } from 'react';
import { Card, Button, Input, Badge } from '../../components/ui';
import { Calendar, Check, Clock, Plus, AlertTriangle, Loader2 } from 'lucide-react';
import * as api from '../../utils/api';

const SessionManagement: React.FC = () => {
    const [sessions, setSessions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [newSession, setNewSession] = useState({
        sessionId: '',
        name: '',
        startDate: '',
        endDate: '',
        sessionType: 'Monsoon'
    });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchSessions();
    }, []);

    const fetchSessions = async () => {
        try {
            setLoading(true);
            const data = await api.getAcademicSessions();
            setSessions(data.sessions || []);
        } catch (err: any) {
            console.error('Failed to fetch sessions:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const currentSession = sessions.find(s => s.is_current);

    const handleCreateSession = async () => {
        try {
            setSubmitting(true);

            // Auto-generate name if empty: e.g. "2023-24 Monsoon"
            const name = newSession.name || `${newSession.sessionId.split('-')[0]}-${parseInt(newSession.sessionId.split('-')[0]) + 1} ${newSession.sessionType}`;

            await api.createAcademicSession({ ...newSession, name });
            await fetchSessions();
            setShowModal(false);
            setNewSession({ sessionId: '', name: '', startDate: '', endDate: '', sessionType: 'Monsoon' });
        } catch (err: any) {
            alert(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    const handleSetCurrent = async (sessionId: string) => {
        if (!confirm('Are you sure? This will change the active session for the entire system.')) return;
        try {
            await api.setCurrentAcademicSession(sessionId);
            await fetchSessions();
        } catch (err: any) {
            alert(err.message);
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white">Academic Sessions</h1>
                    <p className="text-gray-400 text-sm">Manage academic calendar and active terms.</p>
                </div>
                <Button onClick={() => setShowModal(true)}>
                    <Plus size={16} className="mr-2" /> New Session
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="p-6 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border-indigo-500/30">
                    <h3 className="text-indigo-300 font-medium mb-2 flex items-center gap-2">
                        <Clock size={18} /> Active Session
                    </h3>
                    {currentSession ? (
                        <div>
                            <div className="text-3xl font-bold text-white mb-1">{currentSession.name}</div>
                            <div className="text-indigo-200 text-sm mb-4">{currentSession.session_id}</div>
                            <div className="flex gap-4 text-xs text-indigo-300 bg-black/20 p-3 rounded-lg">
                                <div>
                                    <div className="opacity-70">Start Date</div>
                                    <div className="font-mono text-white">{new Date(currentSession.start_date).toLocaleDateString()}</div>
                                </div>
                                <div>
                                    <div className="opacity-70">End Date</div>
                                    <div className="font-mono text-white">{new Date(currentSession.end_date).toLocaleDateString()}</div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="text-gray-400 py-4">No active session set.</div>
                    )}
                </Card>

                <Card className="md:col-span-2 p-0 bg-[#18181b] border-white/10 overflow-hidden">
                    <div className="p-4 border-b border-white/10 font-semibold text-white">All Sessions</div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-black/20 text-gray-400 border-b border-white/5">
                                <tr>
                                    <th className="px-6 py-4 font-medium">Session ID</th>
                                    <th className="px-6 py-4 font-medium">Name</th>
                                    <th className="px-6 py-4 font-medium">Dates</th>
                                    <th className="px-6 py-4 font-medium text-right">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {loading ? (
                                    <tr><td colSpan={4} className="p-8 text-center text-gray-500"><Loader2 className="w-6 h-6 animate-spin mx-auto" /></td></tr>
                                ) : sessions.map((s) => (
                                    <tr key={s.session_id} className={`hover:bg-white/[0.02] ${s.is_current ? 'bg-indigo-500/5' : ''}`}>
                                        <td className="px-6 py-4 font-mono text-gray-400">{s.session_id}</td>
                                        <td className="px-6 py-4 text-white font-medium">{s.name}</td>
                                        <td className="px-6 py-4 text-gray-400 text-xs">
                                            {new Date(s.start_date).toLocaleDateString()} - {new Date(s.end_date).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {s.is_current ? (
                                                <Badge color="green">Active</Badge>
                                            ) : (
                                                <Button size="sm" variant="ghost" onClick={() => handleSetCurrent(s.session_id)} className="text-xs h-7">
                                                    Set Active
                                                </Button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>

            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-[#18181b] border border-white/10 rounded-xl p-6 w-full max-w-md shadow-2xl">
                        <h3 className="text-xl font-bold text-white mb-4">Create Academic Session</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-gray-400 mb-1.5">Academic Year (Start)</label>
                                <input
                                    type="number"
                                    className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500"
                                    placeholder="2024"
                                    value={newSession.sessionId}
                                    onChange={(e) => setNewSession({ ...newSession, sessionId: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-400 mb-1.5">Semester Type</label>
                                <select
                                    className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500"
                                    value={newSession.sessionType}
                                    onChange={(e) => setNewSession({ ...newSession, sessionType: e.target.value })}
                                >
                                    <option value="Monsoon">Monsoon (Autumn)</option>
                                    <option value="Winter">Winter (Spring)</option>
                                    <option value="Summer">Summer</option>
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-gray-400 mb-1.5">Start Date</label>
                                    <input
                                        type="date"
                                        className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500"
                                        value={newSession.startDate}
                                        onChange={(e) => setNewSession({ ...newSession, startDate: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-400 mb-1.5">End Date</label>
                                    <input
                                        type="date"
                                        className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500"
                                        value={newSession.endDate}
                                        onChange={(e) => setNewSession({ ...newSession, endDate: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <Button variant="ghost" onClick={() => setShowModal(false)} className="flex-1">Cancel</Button>
                                <Button onClick={handleCreateSession} disabled={submitting} className="flex-1 bg-blue-600 hover:bg-blue-500">
                                    {submitting ? 'Creating...' : 'Create Session'}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SessionManagement;
