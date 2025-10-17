import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

type Role = 'student' | 'category_reviewer' | 'budget_reviewer' | null;

type AuthState = {
	token: string | null;
	role: Role;
	login: (token: string, role: Exclude<Role, null>) => void;
	logout: () => void;
};

const Ctx = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
	const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));
	const [role, setRole] = useState<Role>(() => (localStorage.getItem('role') as Role) || null);

	useEffect(() => {
		if (token) localStorage.setItem('token', token); else localStorage.removeItem('token');
	}, [token]);
	useEffect(() => {
		if (role) localStorage.setItem('role', role); else localStorage.removeItem('role');
	}, [role]);

	const value = useMemo<AuthState>(() => ({
		token,
		role,
		login: (t, r) => { setToken(t); setRole(r); },
		logout: () => { setToken(null); setRole(null); }
	}), [token, role]);

	return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth() {
	const v = useContext(Ctx);
	if (!v) throw new Error('AuthContext missing');
	return v;
}
