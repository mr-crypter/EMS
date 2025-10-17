import { useState } from 'react';
import { useAuth } from '../state/AuthContext';

export default function Login() {
	const { login } = useAuth();
	const [email, setEmail] = useState('student@example.com');
	const [password, setPassword] = useState('Password123!');
	const [error, setError] = useState<string | null>(null);

	async function onSubmit(e: React.FormEvent) {
		e.preventDefault();
		setError(null);
		try {
			const res = await fetch((import.meta as any).env.VITE_API_URL || 'http://localhost:4000' + '/auth/login', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ email, password })
			});
			if (!res.ok) throw new Error(await res.text());
			const data = await res.json();
			login(data.token, data.role);
			window.location.href = '/student';
		} catch (e: any) {
			setError(e.message);
		}
	}

	return (
		<form onSubmit={onSubmit} style={{ display: 'grid', gap: 8, maxWidth: 360 }}>
			<h2>Login</h2>
			<input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
			<input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" />
			{error && <div style={{ color: 'red' }}>{error}</div>}
			<button type="submit">Login</button>
		</form>
	);
}
