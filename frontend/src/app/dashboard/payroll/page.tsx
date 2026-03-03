'use client';

import React, { useEffect, useState } from 'react';
import axios from '@/lib/axios';
import { DollarSign, Download, PlusCircle, Search, X, FileText } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function PayrollPage() {
    const [salaries, setSalaries] = useState<any[]>([]);
    const [employees, setEmployees] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const { hasRole, user } = useAuth();

    // Modal state for generating salary
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({ employee_id: '', month: new Date().getMonth() + 1, year: new Date().getFullYear(), allowances: 0, deductions: 0 });
    const [actionLoading, setActionLoading] = useState(false);
    const [actionError, setActionError] = useState('');

    useEffect(() => {
        fetchSalaries();
        if (hasRole(['Admin', 'HR'])) {
            fetchEmployees();
        }
    }, [hasRole]);

    const fetchSalaries = async () => {
        setLoading(true);
        try {
            const res = await axios.get('/api/salaries');
            setSalaries(res.data.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const fetchEmployees = async () => {
        try {
            const res = await axios.get('/api/employees');
            setEmployees(res.data.data);
        } catch (error) {
            console.error(error);
        }
    };

    const handleGenerate = async (e: React.FormEvent) => {
        e.preventDefault();
        setActionLoading(true);
        setActionError('');
        try {
            await axios.post('/api/salaries', formData);
            setIsModalOpen(false);
            fetchSalaries();
        } catch (error: any) {
            setActionError(error.response?.data?.message || 'Failed to generate salary');
        } finally {
            setActionLoading(false);
        }
    };

    const handleDownloadPDF = async (id: number, filename: string) => {
        try {
            const res = await axios.get(`/api/salaries/${id}/pdf`, { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `${filename}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.parentNode?.removeChild(link);
        } catch (error) {
            console.error("PDF Download failed", error);
            alert("Failed to download PDF slip.");
        }
    };

    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Payroll Management</h1>
                    <p className="text-slate-500 mt-1">Manage employee salaries, allowances, and download payslips.</p>
                </div>
                {hasRole(['Admin', 'HR']) && (
                    <button onClick={() => setIsModalOpen(true)} className="flex items-center space-x-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium shadow-lg shadow-indigo-600/30 transition-all active:scale-95">
                        <PlusCircle className="w-5 h-5" />
                        <span>Generate Salary</span>
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white rounded-2xl p-6 shadow-xl shadow-slate-200/50 border border-slate-100 flex items-center">
                    <div className="p-4 bg-indigo-50 rounded-xl text-indigo-600 mr-4">
                        <FileText className="w-8 h-8" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-slate-500 uppercase">Total Slips Generated</p>
                        <h3 className="text-2xl font-bold text-slate-800">{salaries.length}</h3>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Employee</th>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Period</th>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Basic Salary</th>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Net Salary</th>
                                <th scope="col" className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Payslip</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                                        Loading payroll records...
                                    </td>
                                </tr>
                            ) : salaries.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                                        No salaries found.
                                    </td>
                                </tr>
                            ) : (
                                salaries.map((salary) => (
                                    <tr key={salary.id} className="hover:bg-slate-50/80 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-slate-900">{salary.employee?.user?.name}</div>
                                            <div className="text-xs text-slate-500">{salary.employee?.nik}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-slate-900">{monthNames[salary.month - 1]} {salary.year}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-slate-500">Rp {Number(salary.basic).toLocaleString('id-ID')}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-bold text-emerald-600">Rp {Number(salary.net_salary).toLocaleString('id-ID')}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right font-medium">
                                            <button
                                                onClick={() => handleDownloadPDF(salary.id, `Slip_${salary.employee?.nik}_${monthNames[salary.month - 1]}_${salary.year}`)}
                                                className="inline-flex items-center space-x-1 text-indigo-600 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition"
                                            >
                                                <Download className="w-4 h-4" />
                                                <span>PDF</span>
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {isModalOpen && hasRole(['Admin', 'HR']) && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
                    <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between p-6 border-b border-slate-100">
                            <h3 className="text-xl font-bold text-slate-800">Generate Salary</h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors rounded-full p-1 hover:bg-slate-100">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleGenerate} className="p-6 space-y-4">
                            {actionError && <div className="p-3 bg-rose-50 text-rose-600 rounded-lg text-sm border border-rose-100">{actionError}</div>}

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Employee</label>
                                <select required value={formData.employee_id} onChange={e => setFormData({ ...formData, employee_id: e.target.value })} className="w-full rounded-xl border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-2.5 px-3 border bg-white">
                                    <option value="">Select an employee...</option>
                                    {employees.map(emp => (
                                        <option key={emp.id} value={emp.id}>{emp.user?.name} ({emp.nik}) - Rp {Number(emp.basic_salary).toLocaleString('id-ID')}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Month</label>
                                    <select value={formData.month} onChange={e => setFormData({ ...formData, month: parseInt(e.target.value) })} className="w-full rounded-xl border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-2.5 px-3 border bg-white">
                                        {monthNames.map((m, i) => (
                                            <option key={m} value={i + 1}>{m}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Year</label>
                                    <input required type="number" value={formData.year} onChange={e => setFormData({ ...formData, year: parseInt(e.target.value) })} className="w-full rounded-xl border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-2.5 px-3 border" />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Allowances (Rp)</label>
                                    <input required type="number" value={formData.allowances} onChange={e => setFormData({ ...formData, allowances: Number(e.target.value) })} className="w-full rounded-xl border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-2.5 px-3 border" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Deductions (Rp)</label>
                                    <input required type="number" value={formData.deductions} onChange={e => setFormData({ ...formData, deductions: Number(e.target.value) })} className="w-full rounded-xl border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-2.5 px-3 border" />
                                </div>
                            </div>

                            <div className="mt-8 pt-6 border-t border-slate-100 flex justify-end space-x-3">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border rounded-xl hover:bg-slate-50 transition-colors">Cancel</button>
                                <button type="submit" disabled={actionLoading} className="px-4 py-2 bg-indigo-600 text-white rounded-xl shadow-lg hover:bg-indigo-700 disabled:opacity-70 transition-colors">
                                    {actionLoading ? 'Saving...' : 'Generate Pay Slip'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
