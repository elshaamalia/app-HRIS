'use client';

import React, { useEffect, useState } from 'react';
import axios from '@/lib/axios';
import { Clock, Download, Search, CheckCircle2, AlertTriangle, Calendar as CalendarIcon } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { format } from 'date-fns';

export default function AttendancePage() {
    const [records, setRecords] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const { hasRole, user } = useAuth();

    useEffect(() => {
        fetchRecords();
    }, []);

    const fetchRecords = async () => {
        setLoading(true);
        try {
            const res = await axios.get('/api/attendances');
            setRecords(res.data.data);
        } catch (error) {
            console.error('Failed to fetch attendance:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleClockIn = async () => {
        setActionLoading(true);
        try {
            await axios.post('/api/attendances');
            fetchRecords();
        } catch (error: any) {
            alert(error.response?.data?.message || 'Check-in failed');
        } finally {
            setActionLoading(false);
        }
    };

    const handleClockOut = async (id: number) => {
        setActionLoading(true);
        try {
            await axios.put(`/api/attendances/${id}`);
            fetchRecords();
        } catch (error: any) {
            alert('Check-out failed');
        } finally {
            setActionLoading(false);
        }
    };

    // Check if user has already checked in today (assumes records are sorted latest first)
    const todayStr = new Date().toISOString().split('T')[0];
    const todayRecord = records.find(r => r.employee?.user_id === user?.id && r.date === todayStr);
    const canClockIn = hasRole(['Pegawai']) && !todayRecord;
    const canClockOut = hasRole(['Pegawai']) && todayRecord && !todayRecord.check_out;

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Time & Attendance</h1>
                    <p className="text-slate-500 mt-1">Track daily clock-ins, lateness, and overall timesheets.</p>
                </div>

                <div className="flex items-center space-x-3">
                    {canClockIn && (
                        <button onClick={handleClockIn} disabled={actionLoading} className="flex items-center space-x-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-lg shadow-emerald-600/30 transition-all active:scale-95 disabled:opacity-70">
                            <Clock className="w-5 h-5" />
                            <span>Clock In Now</span>
                        </button>
                    )}
                    {canClockOut && (
                        <button onClick={() => handleClockOut(todayRecord.id)} disabled={actionLoading} className="flex items-center space-x-2 px-6 py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold shadow-lg shadow-rose-600/30 transition-all active:scale-95 disabled:opacity-70">
                            <Clock className="w-5 h-5" />
                            <span>Clock Out</span>
                        </button>
                    )}
                    {hasRole(['Admin', 'HR']) && (
                        <button className="flex items-center space-x-2 px-5 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl font-medium shadow-sm transition-all">
                            <Download className="w-4 h-4" />
                            <span>Export Report</span>
                        </button>
                    )}
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
                <div className="p-4 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between gap-4">
                    <div className="relative max-w-md w-full">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-slate-400" />
                        </div>
                        <input
                            type="text"
                            className="block w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                            placeholder="Search records..."
                        />
                    </div>
                    <div className="flex items-center space-x-2">
                        <div className="relative">
                            <select className="appearance-none block w-full pl-10 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent cursor-pointer">
                                <option>All Status</option>
                                <option>Present</option>
                                <option>Late</option>
                            </select>
                            <CalendarIcon className="absolute left-3 top-2.5 h-5 w-5 text-slate-400 pointer-events-none" />
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Date & Employee</th>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Clock In</th>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Clock Out</th>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                                        <div className="flex justify-center items-center space-x-2">
                                            <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                                            <span>Loading records...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : records.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                                        No attendance records found.
                                    </td>
                                </tr>
                            ) : (
                                records.map((record) => (
                                    <tr key={record.id} className="hover:bg-slate-50/80 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div>
                                                    <div className="text-sm font-bold text-slate-900">{format(new Date(record.date), 'MMM dd, yyyy')}</div>
                                                    <div className="text-sm text-slate-500 mt-1">{record.employee?.user?.name || 'Unknown Employee'}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center space-x-2">
                                                <div className="p-1.5 rounded-md bg-emerald-50 text-emerald-600">
                                                    <Clock className="w-4 h-4" />
                                                </div>
                                                <span className="text-sm font-medium text-slate-900">{record.check_in || '--:--'}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center space-x-2">
                                                <div className="p-1.5 rounded-md bg-slate-100 text-slate-600">
                                                    <Clock className="w-4 h-4" />
                                                </div>
                                                <span className="text-sm font-medium text-slate-900">{record.check_out || '--:--'}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex flex-col space-y-1">
                                                <span className={`px-3 py-1 inline-flex items-center text-xs leading-5 font-semibold rounded-full w-max ${record.status === 'present' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                                                    {record.status === 'present' ? <CheckCircle2 className="w-3 h-3 mr-1" /> : <AlertTriangle className="w-3 h-3 mr-1" />}
                                                    <span className="capitalize">{record.status}</span>
                                                </span>
                                                {record.lateness > 0 && (
                                                    <span className="text-xs font-medium text-rose-500 pl-1">{record.lateness} mins late</span>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
