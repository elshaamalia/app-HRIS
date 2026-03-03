'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import axios from '@/lib/axios';

interface User {
    id: number;
    name: string;
    email: string;
    roles: string[];
}

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    login: (token: string, userData: User) => void;
    logout: () => void;
    hasRole: (roles: string[]) => boolean;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        const loadUser = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                setIsLoading(false);
                if (!pathname.startsWith('/login')) {
                    router.push('/login');
                }
                return;
            }

            try {
                const res = await axios.get('/api/me');
                setUser(res.data.user);
            } catch (error) {
                console.error("Auth Load Error", error);
                localStorage.removeItem('token');
                setUser(null);
                if (!pathname.startsWith('/login')) {
                    router.push('/login');
                }
            } finally {
                setIsLoading(false);
            }
        };

        loadUser();
    }, [pathname, router]);

    const login = (token: string, userData: User) => {
        localStorage.setItem('token', token);
        document.cookie = `token=${token}; path=/; max-age=86400; SameSite=Lax`;
        setUser(userData);
        router.push('/dashboard');
    };

    const logout = async () => {
        try {
            await axios.post('/api/logout');
        } catch (e) { }
        localStorage.removeItem('token');
        document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
        setUser(null);
        router.push('/login');
    };

    const hasRole = (roles: string[]) => {
        if (!user) return false;
        return user.roles.some((r) => roles.includes(r));
    };

    return (
        <AuthContext.Provider value={{ user, isLoading, login, logout, hasRole }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
