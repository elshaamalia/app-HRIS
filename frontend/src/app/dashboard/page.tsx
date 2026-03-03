'use client';

import React, { useEffect, useState } from 'react';
import axios from '@/lib/axios';
import { Users, Clock, CalendarDays, TrendingUp } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface Stats {
    total_employees: number;
    attendance_today: number;
    pending_leaves_count: number;
}

export default function DashboardHome() {
    const { user, hasRole } = useAuth();
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (hasRole(['Admin', 'HR', 'Manager'])) {
            axios.get('/api/dashboard/stats').then(res => {
                setStats(res.data);
            }).catch(console.error).finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, [hasRole]);

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Welcome back, {user?.name}!</h1>
                <p className="text-slate-500 mt-2 text-lg">Here's what's happening in your organization today.</p>
            </div>

            {hasRole(['Admin', 'HR', 'Manager']) ? (
                loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[1, 2, 3].map(i => <div key={i} className="h-36 bg-slate-200 animate-pulse rounded-2xl"></div>)}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <StatCard
                            title="Total Employees"
                            value={stats?.total_employees || 0}
                            icon={Users}
                            color="from-blue-500 to-indigo-600"
                            trend="+2% this month"
                        />
                        <StatCard
                            title="Present Today"
                            value={stats?.attendance_today || 0}
                            icon={Clock}
                            color="from-emerald-500 to-teal-600"
                            trend="Looking good"
                        />
                        <StatCard
                            title="Pending Leaves"
                            value={stats?.pending_leaves_count || 0}
                            icon={CalendarDays}
                            color="from-orange-500 to-amber-600"
                            trend="Requires attention"
                        />
                    </div>
                )
            ) : (
                <div className="bg-white rounded-3xl p-10 border border-slate-200 shadow-xl shadow-slate-200/50 text-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-10 opacity-5">
                        <Shield className="w-64 h-64" />
                    </div>
                    <div className="relative z-10 space-y-4">
                        <h2 className="text-2xl font-bold text-slate-800">Hello {user?.name}, you are logged in as {user?.roles[0]}</h2>
                        <p className="text-slate-500 max-w-lg mx-auto">Use the sidebar navigation to manage your attendances, view your leave requests, and download your latest salary slips.</p>
                        <div className="mt-8 flex justify-center gap-4">
                            <button className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-medium shadow-lg shadow-indigo-600/30 hover:bg-indigo-700 transition">Clock In Now</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function StatCard({ title, value, icon: Icon, color, trend }: any) {
    return (
        <div className="relative overflow-hidden bg-white rounded-3xl p-6 border border-slate-100 shadow-xl shadow-slate-200/50 group hover:-translate-y-1 transition-all duration-300">
            <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${color} rounded-full mix-blend-multiply filter blur-3xl opacity-20 group-hover:opacity-40 transition-opacity`}></div>
            <div className="relative z-10 flex items-start justify-between">
                <div>
                    <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">{title}</p>
                    <h3 className="text-4xl font-extrabold text-slate-800 mt-2">{value}</h3>
                    <div className="flex items-center mt-4 text-sm text-slate-500">
                        <TrendingUp className="w-4 h-4 mr-1 text-emerald-500" />
                        <span>{trend}</span>
                    </div>
                </div>
                <div className={`p-4 rounded-2xl bg-gradient-to-br ${color} shadow-lg text-white`}>
                    <Icon className="w-6 h-6" />
                </div>
            </div>
        </div>
    )
}
