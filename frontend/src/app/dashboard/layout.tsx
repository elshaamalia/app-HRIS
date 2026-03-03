'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
    LayoutDashboard, Users, CalendarDays, Clock,
    CreditCard, LogOut, Menu, X, Shield, Activity
} from 'lucide-react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const { user, logout, hasRole, isLoading } = useAuth();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const pathname = usePathname();

    if (isLoading) {
        return <div className="min-h-screen flex items-center justify-center bg-slate-50"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div></div>;
    }

    if (!user) return null; // Handled by AuthContext redirection

    const navItems = [
        { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, roles: ['Admin', 'HR', 'Manager', 'Pegawai'] },
        { name: 'Employees', href: '/dashboard/employees', icon: Users, roles: ['Admin', 'HR'] },
        { name: 'Attendance', href: '/dashboard/attendance', icon: Clock, roles: ['Admin', 'HR', 'Manager', 'Pegawai'] },
        { name: 'Leaves', href: '/dashboard/leaves', icon: CalendarDays, roles: ['Admin', 'HR', 'Manager', 'Pegawai'] },
        { name: 'Payroll', href: '/dashboard/payroll', icon: CreditCard, roles: ['Admin', 'HR', 'Pegawai'] },
        { name: 'Audit Logs', href: '/dashboard/audit-logs', icon: Activity, roles: ['Admin'] },
    ];

    return (
        <div className="min-h-screen bg-slate-50 flex font-sans">
            {sidebarOpen && (
                <div className="fixed inset-0 z-20 bg-slate-900/50 lg:hidden backdrop-blur-sm transition-opacity" onClick={() => setSidebarOpen(false)} />
            )}

            <div className={`fixed inset-y-0 left-0 z-30 w-72 bg-gradient-to-b from-indigo-950 to-slate-900 text-white transform transition-all duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 shadow-2xl ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="flex items-center h-20 px-6 border-b border-white/10 bg-white/5 backdrop-blur-md">
                    <Shield className="w-8 h-8 text-indigo-400 mr-3 animate-pulse" />
                    <h1 className="text-2xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-indigo-200 to-white">HRIS Pro</h1>
                </div>

                <div className="p-5">
                    <div className="flex items-center space-x-4 p-4 mb-8 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition-colors backdrop-blur-sm group cursor-pointer">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-600 flex items-center justify-center font-bold text-lg shadow-lg group-hover:scale-105 transition-transform">
                            {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="overflow-hidden">
                            <p className="font-semibold text-white truncate">{user.name}</p>
                            <p className="text-xs text-indigo-300 bg-indigo-900/50 px-2 py-1 rounded inline-block mt-1 border border-indigo-700/50">{user.roles[0]}</p>
                        </div>
                    </div>

                    <nav className="space-y-1.5">
                        {navItems.filter(item => hasRole(item.roles)).map((item) => {
                            const isActive = pathname === item.href;
                            const Icon = item.icon;
                            return (
                                <Link key={item.name} href={item.href} onClick={() => setSidebarOpen(false)}>
                                    <span className={`flex items-center space-x-3 px-4 py-3.5 rounded-xl transition-all duration-200 group ${isActive ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 font-medium' : 'text-slate-300 hover:bg-white/10 hover:text-white font-medium'}`}>
                                        <Icon className={`w-5 h-5 transition-transform duration-200 group-hover:scale-110 ${isActive ? 'text-white' : 'text-indigo-400 group-hover:text-indigo-300'}`} />
                                        <span>{item.name}</span>
                                    </span>
                                </Link>
                            );
                        })}
                    </nav>
                </div>

                <div className="absolute bottom-0 w-full p-5 bg-gradient-to-t from-slate-900 via-slate-900 to-transparent">
                    <button
                        onClick={logout}
                        className="w-full flex items-center justify-center space-x-2 px-4 py-3.5 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition-all duration-200 group border border-red-500/20"
                    >
                        <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-200" />
                        <span className="font-medium">Sign Out</span>
                    </button>
                </div>
            </div>

            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <header className="h-20 bg-white/80 backdrop-blur-xl border-b border-slate-200 flex items-center justify-between px-6 lg:px-10 sticky top-0 z-10 shadow-sm transition-all">
                    <button onClick={() => setSidebarOpen(true)} className="p-2 -ml-2 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-indigo-600 focus:outline-none lg:hidden transition-colors">
                        <Menu className="w-6 h-6" />
                    </button>

                    <div className="flex items-center ml-auto">
                        <div className="hidden sm:block text-sm text-slate-500 text-right bg-slate-100/80 px-4 py-2 rounded-full border border-slate-200 shadow-inner">
                            <span className="font-medium text-slate-700">🗓️ {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                        </div>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-10 bg-slate-50 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-fixed">
                    <div className="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
