'use client';

import React, { useEffect, useState } from 'react';
import axios from '@/lib/axios';
import { PlusCircle, Search, Edit2, Trash2, Shield, X, Save } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function EmployeesPage() {
    const [employees, setEmployees] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
    const [currentEmp, setCurrentEmp] = useState<any>(null);
    const { hasRole } = useAuth();

    // Form state
    const [formData, setFormData] = useState({
        name: '', email: '', nik: '', position: '', department: '', basic_salary: '', status: 'active'
    });
    const [formLoading, setFormLoading] = useState(false);
    const [actionError, setActionError] = useState('');

    useEffect(() => {
        fetchEmployees();
    }, []);

    const fetchEmployees = async (query = search) => {
        setLoading(true);
        try {
            const res = await axios.get(`/api/employees?search=${query}`);
            setEmployees(res.data.data); // Assuming paginated structure with data array
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        fetchEmployees(search);
    };

    const openCreateModal = () => {
        setModalMode('create');
        setFormData({ name: '', email: '', nik: '', position: '', department: '', basic_salary: '', status: 'active' });
        setActionError('');
        setIsModalOpen(true);
    };

    const openEditModal = (emp: any) => {
        setModalMode('edit');
        setCurrentEmp(emp);
        setFormData({
            name: emp.user?.name || '',
            email: emp.email || emp.user?.email || '',
            nik: emp.nik || '',
            position: emp.position || '',
            department: emp.department || '',
            basic_salary: emp.basic_salary || '',
            status: emp.status || 'active'
        });
        setActionError('');
        setIsModalOpen(true);
    };

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormLoading(true);
        setActionError('');

        try {
            if (modalMode === 'create') {
                await axios.post('/api/employees', formData);
            } else {
                await axios.put(`/api/employees/${currentEmp.id}`, formData);
            }
            setIsModalOpen(false);
            fetchEmployees();
        } catch (error: any) {
            setActionError(error.response?.data?.message || 'Action failed');
        } finally {
            setFormLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this employee?')) return;
        try {
            await axios.delete(`/api/employees/${id}`);
            fetchEmployees();
        } catch (error) {
            console.error('Delete failed:', error);
        }
    };

    if (!hasRole(['Admin', 'HR'])) {
        return (
            <div className="flex flex-col items-center justify-center p-20 text-center">
                <Shield className="w-20 h-20 text-indigo-200 mb-6" />
                <h2 className="text-3xl font-bold text-slate-800">Access Restricted</h2>
                <p className="text-slate-500 mt-2">You do not have permission to view employee data.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Employees Directory</h1>
                    <p className="text-slate-500 mt-1">Manage personnel records, roles, and status.</p>
                </div>
                <button onClick={openCreateModal} className="flex items-center space-x-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium shadow-lg shadow-indigo-600/30 transition-all active:scale-95">
                    <PlusCircle className="w-5 h-5" />
                    <span>Add Employee</span>
                </button>
            </div>

            <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
                <div className="p-4 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between gap-4">
                    <form onSubmit={handleSearch} className="relative max-w-md w-full">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-slate-400" />
                        </div>
                        <input
                            type="text"
                            className="block w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                            placeholder="Search by name, NIK, or department..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </form>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Employee</th>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Role & Position</th>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Department</th>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                                <th scope="col" className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                                        <div className="flex justify-center items-center space-x-2">
                                            <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                                            <span>Loading...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : employees.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                                        No employees found matching your criteria.
                                    </td>
                                </tr>
                            ) : (
                                employees.map((emp) => (
                                    <tr key={emp.id} className="hover:bg-slate-50/80 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 h-10 w-10">
                                                    <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-indigo-100 to-purple-100 text-indigo-600 flex items-center justify-center font-bold">
                                                        {emp.user?.name?.charAt(0)}
                                                    </div>
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-slate-900">{emp.user?.name}</div>
                                                    <div className="text-sm text-slate-500">{emp.email || emp.user?.email}</div>
                                                    <div className="text-xs text-slate-400 mt-0.5">NIK: {emp.nik}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-slate-900">{emp.position}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-slate-900">{emp.department}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${emp.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                                                {emp.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex justify-end space-x-2">
                                                <button onClick={() => openEditModal(emp)} className="text-indigo-600 hover:text-indigo-900 p-2 rounded-lg hover:bg-indigo-50 transition-colors">
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button onClick={() => handleDelete(emp.id)} className="text-rose-600 hover:text-rose-900 p-2 rounded-lg hover:bg-rose-50 transition-colors">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
                    <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between p-6 border-b border-slate-100">
                            <h3 className="text-xl font-bold text-slate-800">
                                {modalMode === 'create' ? 'Add New Employee' : 'Edit Employee'}
                            </h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors rounded-full p-1 hover:bg-slate-100">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleFormSubmit} className="p-6">
                            {actionError && <div className="mb-4 p-3 bg-rose-50 text-rose-600 rounded-lg text-sm border border-rose-100">{actionError}</div>}

                            <div className="space-y-4 max-h-[60vh] overflow-y-auto px-1">
                                {modalMode === 'create' && (
                                    <>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                                            <input required type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full rounded-xl border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2 px-3 border" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                                            <input required type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} className="w-full rounded-xl border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2 px-3 border" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1">NIK (Employee ID)</label>
                                            <input required type="text" value={formData.nik} onChange={e => setFormData({ ...formData, nik: e.target.value })} className="w-full rounded-xl border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2 px-3 border" />
                                        </div>
                                    </>
                                )}

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Position</label>
                                    <input required type="text" value={formData.position} onChange={e => setFormData({ ...formData, position: e.target.value })} className="w-full rounded-xl border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2 px-3 border" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Department</label>
                                        <input required type="text" value={formData.department} onChange={e => setFormData({ ...formData, department: e.target.value })} className="w-full rounded-xl border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2 px-3 border" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Basic Salary</label>
                                        <input required type="number" value={formData.basic_salary} onChange={e => setFormData({ ...formData, basic_salary: e.target.value })} className="w-full rounded-xl border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2 px-3 border" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                                    <select value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value as any })} className="w-full rounded-xl border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2 px-3 border bg-white">
                                        <option value="active">Active</option>
                                        <option value="inactive">Inactive</option>
                                    </select>
                                </div>
                            </div>

                            <div className="mt-8 pt-6 border-t border-slate-100 flex justify-end space-x-3">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors">
                                    Cancel
                                </button>
                                <button type="submit" disabled={formLoading} className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-xl shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors disabled:opacity-70">
                                    {formLoading ? 'Saving...' : (
                                        <>
                                            <Save className="w-4 h-4 mr-2" />
                                            {modalMode === 'create' ? 'Create Employee' : 'Save Changes'}
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
