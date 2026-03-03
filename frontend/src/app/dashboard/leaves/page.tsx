'use client';

import React, { useEffect, useState } from 'react';
import axios from '@/lib/axios';
import { Leaf, Clock, CheckCircle2, XCircle, FileText } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function LeavesPage() {
    const [leaves, setLeaves] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const { hasRole, user } = useAuth();

    // Modal state for applying
    const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
    const [formData, setFormData] = useState({ type: 'Annual', start_date: '', end_date: '', reason: '' });

    useEffect(() => {
        fetchLeaves();
    }, []);

    const fetchLeaves = async () => {
        setLoading(true);
        try {
            const res = await axios.get('/api/leaves');
            setLeaves(res.data.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleApply = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await axios.post('/api/leaves', formData);
            setIsApplyModalOpen(false);
            setFormData({ type: 'Annual', start_date: '', end_date: '', reason: '' });
            fetchLeaves();
        } catch (error: any) {
            alert(error.response?.data?.message || 'Failed to apply');
        }
    };

    const handleStatusUpdate = async (id: number, status: string) => {
        try {
            await axios.put(`/api/leaves/${id}`, { status });
            fetchLeaves();
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Leave Requests</h1>
                    <p className="text-slate-500 mt-1">Manage time off, sick leaves, and holidays.</p>
                </div>
                {hasRole(['Pegawai']) && (
                    <button onClick={() => setIsApplyModalOpen(true)} className="flex items-center space-x-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium shadow-lg shadow-indigo-600/30">
                        <Leaf className="w-5 h-5" />
                        <span>Apply Leave</span>
                    </button>
                )}
            </div>

            <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
                <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50">
                        <tr>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase">Employee</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase">Type & Dates</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase">Reason</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase">Status</th>
                            {hasRole(['Admin', 'HR', 'Manager']) && (
                                <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase">Approval</th>
                            )}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {loading ? (
                            <tr><td colSpan={5} className="p-8 text-center text-slate-500">Loading...</td></tr>
                        ) : leaves.map(leave => (
                            <tr key={leave.id}>
                                <td className="px-6 py-4">
                                    <div className="font-medium text-slate-900">{leave.employee?.user?.name}</div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="font-medium text-indigo-600">{leave.type}</div>
                                    <div className="text-sm text-slate-500">{leave.start_date} to {leave.end_date}</div>
                                </td>
                                <td className="px-6 py-4 text-sm text-slate-500 max-w-xs truncate">{leave.reason}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-3 py-1 text-xs font-semibold rounded-full flex items-center inline-flex w-max space-x-1 ${leave.status === 'approved' ? 'bg-emerald-100 text-emerald-700' :
                                            leave.status === 'rejected' ? 'bg-rose-100 text-rose-700' :
                                                'bg-amber-100 text-amber-700'
                                        }`}>
                                        {leave.status === 'approved' && <CheckCircle2 className="w-3 h-3" />}
                                        {leave.status === 'rejected' && <XCircle className="w-3 h-3" />}
                                        {leave.status === 'pending' && <Clock className="w-3 h-3" />}
                                        <span className="capitalize">{leave.status}</span>
                                    </span>
                                </td>
                                {hasRole(['Admin', 'HR', 'Manager']) && (
                                    <td className="px-6 py-4 text-right">
                                        {leave.status === 'pending' && (
                                            <div className="flex justify-end space-x-2">
                                                <button onClick={() => handleStatusUpdate(leave.id, 'approved')} className="text-emerald-600 bg-emerald-50 hover:bg-emerald-100 p-2 rounded-lg font-medium text-sm transition">Approve</button>
                                                <button onClick={() => handleStatusUpdate(leave.id, 'rejected')} className="text-rose-600 bg-rose-50 hover:bg-rose-100 p-2 rounded-lg font-medium text-sm transition">Reject</button>
                                            </div>
                                        )}
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {isApplyModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl p-6 w-full max-w-md">
                        <h3 className="text-xl font-bold mb-4">Apply for Leave</h3>
                        <form onSubmit={handleApply} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700">Type</label>
                                <select value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })} className="w-full mt-1 rounded-xl border-slate-300 py-2 border px-3">
                                    <option>Annual</option>
                                    <option>Sick</option>
                                    <option>Unpaid</option>
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium tracking-wide">Start Date</label>
                                    <input required type="date" value={formData.start_date} onChange={e => setFormData({ ...formData, start_date: e.target.value })} className="w-full mt-1 border rounded-xl py-2 px-3" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium tracking-wide">End Date</label>
                                    <input required type="date" value={formData.end_date} onChange={e => setFormData({ ...formData, end_date: e.target.value })} className="w-full mt-1 border rounded-xl py-2 px-3" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium tracking-wide">Reason</label>
                                <textarea required value={formData.reason} onChange={e => setFormData({ ...formData, reason: e.target.value })} className="w-full mt-1 border rounded-xl py-2 px-3 h-24"></textarea>
                            </div>
                            <div className="flex justify-end space-x-3 pt-4 border-t">
                                <button type="button" onClick={() => setIsApplyModalOpen(false)} className="px-4 py-2 border rounded-xl">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-xl">Submit Request</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
