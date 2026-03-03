'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '@/context/AuthContext';
import axios from '@/lib/axios';

const schema = z.object({
    email: z.string().email({ message: "Valid email is required" }),
    password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

type FormData = z.infer<typeof schema>;

export default function LoginPage() {
    const { login } = useAuth();
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
        resolver: zodResolver(schema),
    });

    const onSubmit = async (data: FormData) => {
        setIsLoading(true);
        setError('');
        try {
            const res = await axios.post('/api/login', data);
            login(res.data.access_token, res.data.user);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900 p-4">
            {/* Decorative blobs */}
            <div className="absolute top-0 left-0 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
            <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
            <div className="absolute -bottom-8 left-20 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>

            <div className="w-full max-w-md bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-8 shadow-2xl relative z-10 transform transition-all hover:scale-[1.01] hover:shadow-purple-500/20">
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-500 mb-6 shadow-lg">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                    </div>
                    <h1 className="text-3xl font-extrabold text-white tracking-tight">HRIS Portal</h1>
                    <p className="text-indigo-200 mt-2 text-sm">Sign in to manage your workspace</p>
                </div>

                {error && (
                    <div className="mb-6 p-4 rounded-xl bg-red-500/20 border border-red-500/50 text-red-200 text-sm animate-pulse">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-indigo-100 mb-2">Email Address</label>
                        <input
                            type="email"
                            {...register('email')}
                            className="w-full px-5 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-indigo-300/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                            placeholder="admin@admin.com"
                        />
                        {errors.email && <p className="mt-2 text-sm text-pink-400">{errors.email.message}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-indigo-100 mb-2">Password</label>
                        <input
                            type="password"
                            {...register('password')}
                            className="w-full px-5 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-indigo-300/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                            placeholder="••••••••"
                        />
                        {errors.password && <p className="mt-2 text-sm text-pink-400">{errors.password.message}</p>}
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-3 px-4 flex justify-center items-center rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-semibold text-lg shadow-lg hover:shadow-indigo-500/30 hover:from-purple-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 focus:ring-offset-slate-900 transition-all transform active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                        ) : "Access Account"}
                    </button>
                </form>
            </div>
        </div>
    );
}
