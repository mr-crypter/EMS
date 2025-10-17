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
			const res = await fetch(((import.meta as any).env.VITE_API_URL || 'http://localhost:4000') + '/auth/login', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ email, password })
			});
			if (!res.ok) throw new Error(await res.text());
			const data = await res.json();
			login(data.token, data.role);
			if (data.role === 'category_reviewer') {
				window.location.href = '/category';
			} else if (data.role === 'budget_reviewer') {
				window.location.href = '/budget';
			} else {
				window.location.href = '/student';
			}
		} catch (e: any) {
			setError(e.message);
		}
	}

	return (
		<div className="mx-auto max-w-md bg-white rounded-lg shadow border p-6">
			<h2 className="text-xl font-semibold mb-4">Login</h2>
			<form onSubmit={onSubmit} className="space-y-3">
				<input className="w-full rounded border px-3 py-2" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
				<input className="w-full rounded border px-3 py-2" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" />
				{error && <div className="text-red-600 text-sm">{error}</div>}
				<button className="w-full rounded bg-blue-600 text-white px-3 py-2 hover:bg-blue-700" type="submit">Login</button>
			</form>
		</div>
	);
}
