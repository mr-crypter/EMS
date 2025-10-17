import { useAuth } from '../state/AuthContext';

export function useApi() {
	const { token } = useAuth();
	const base = import.meta.env.VITE_API_URL || 'http://localhost:4000';
	async function request<T>(path: string, opts: RequestInit = {}): Promise<T> {
		const res = await fetch(`${base}${path}`, {
			...opts,
			headers: {
				'Content-Type': 'application/json',
				...(token ? { Authorization: `Bearer ${token}` } : {}),
				...(opts.headers || {})
			}
		});
		if (!res.ok) throw new Error(await res.text());
		return res.json();
	}
	return { request };
}
