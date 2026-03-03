'use client';

import React, { useEffect, useState } from 'react';
import axios from '@/lib/axios';
import { Activity, Shield, Clock, Search, Database } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { format } from 'date-fns';

export default function AuditLogsPage() {
    const [logs, setLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const { hasRole } = useAuth();
    const [search, setSearch] = useState('');

    useEffect(() => {
        if (hasRole(['Admin'])) {
            fetchLogs();
        }
    }, [hasRole]);

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const res = await axios.get('/api/activity-logs');
            setLogs(res.data.data);
        } catch (error) {
            console.error('Failed to fetch logs:', error);
        } finally {
            setLoading(false);
        }
    };

    if (!hasRole(['Admin'])) {
        return (
            <div className="flex flex-col items-center justify-center p-20 text-center">
                <Shield className="w-20 h-20 text-indigo-200 mb-6" />
                <h2 className="text-3xl font-bold text-slate-800">Administrator Access Required</h2>
                <p className="text-slate-500 mt-2">You do not have permission to view the system audit trail.</p>
            </div>
        );
    }

    const filteredLogs = logs.filter(log =>
        log.description.toLowerCase().includes(search.toLowerCase()) ||
        (log.causer?.name || '').toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">System Audit Log</h1>
                    <p className="text-slate-500 mt-1">Track all system activities, data changes, and access records for security auditing.</p>
                </div>
                <div className="p-3 bg-indigo-50 text-indigo-700 rounded-xl flex items-center shadow-inner">
                    <Database className="w-5 h-5 mr-2" />
                    <span className="font-semibold text-sm">Strict Tracking Active</span>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
                <div className="p-4 sm:p-6 border-b border-slate-100 bg-slate-50/50">
                    <div className="relative max-w-md w-full">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-slate-400" />
                        </div>
                        <input
                            type="text"
                            className="block w-full pl-10 pr-3 py-2.5 bg-white border border-slate-200 shadow-sm rounded-xl text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                            placeholder="Filter events by user or action..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Timestamp</th>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">User (Causer)</th>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Action Event</th>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Target Entity</th>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Changes</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                                        <div className="flex justify-center items-center space-x-2">
                                            <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                                            <span>Loading audit logs...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredLogs.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                                        No logs found matching your criteria.
                                    </td>
                                </tr>
                            ) : (
                                filteredLogs.map((log) => (
                                    <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center space-x-2 text-sm text-slate-500">
                                                <Clock className="w-4 h-4 text-slate-400" />
                                                <span>{format(new Date(log.created_at), 'MMM dd, yyyy HH:mm:ss')}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center space-x-2">
                                                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-xs">
                                                    {log.causer?.name?.charAt(0) || '?'}
                                                </div>
                                                <span className="text-sm font-medium text-slate-900">{log.causer?.name || 'System / Auto'}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full capitalize ${log.description === 'created' ? 'bg-emerald-100 text-emerald-800' :
                                                    log.description === 'updated' ? 'bg-indigo-100 text-indigo-800' :
                                                        log.description === 'deleted' ? 'bg-rose-100 text-rose-800' :
                                                            'bg-slate-100 text-slate-800'
                                                }`}>
                                                {log.description}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-slate-900 font-mono bg-slate-50 px-2 py-1 rounded inline-block">
                                                {log.subject_type ? log.subject_type.split('\\').pop() : 'N/A'} #{log.subject_id}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-500 max-w-sm">
                                            {log.properties && Object.keys(log.properties).length > 0 ? (
                                                <details className="cursor-pointer group">
                                                    <summary className="font-medium text-indigo-600 hover:text-indigo-800 transition-colors list-none flex items-center">
                                                        <Activity className="w-4 h-4 mr-1" /> View Changes Data
                                                    </summary>
                                                    <pre className="mt-2 text-xs bg-slate-900 text-slate-300 p-3 rounded-lg overflow-x-auto shadow-inner border border-slate-700">
                                                        {JSON.stringify(log.properties, null, 2)}
                                                    </pre>
                                                </details>
                                            ) : (
                                                <span className="text-slate-400 italic">No exact properties logged</span>
                                            )}
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
