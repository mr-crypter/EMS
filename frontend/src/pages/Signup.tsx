import { useState } from 'react';

export default function Signup() {
	const [email, setEmail] = useState('student@example.com');
	const [password, setPassword] = useState('Password123!');
	const [code, setCode] = useState('');
	const [stage, setStage] = useState<'register' | 'verify'>('register');
	const [msg, setMsg] = useState<string | null>(null);
	const base = ((import.meta as any).env.VITE_API_URL || 'http://localhost:4000');

	async function register(e: React.FormEvent) {
		e.preventDefault();
		setMsg(null);
		const res = await fetch(base + '/auth/register', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ email, password })
		});
		if (res.ok) { setStage('verify'); setMsg('OTP sent to email'); } else { setMsg(await res.text()); }
	}
	async function verify(e: React.FormEvent) {
		e.preventDefault();
		setMsg(null);
		const res = await fetch(base + '/auth/verify-otp', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ email, code })
		});
		if (res.ok) { setMsg('Verified. You can login now.'); } else { setMsg(await res.text()); }
	}

	return (
		<div className="mx-auto max-w-md bg-white rounded-lg shadow border p-6">
			<h2 className="text-xl font-semibold mb-4">Signup</h2>
			{stage === 'register' ? (
				<form onSubmit={register} className="space-y-3">
					<input className="w-full rounded border px-3 py-2" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
					<input className="w-full rounded border px-3 py-2" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" />
					<button className="w-full rounded bg-blue-600 text-white px-3 py-2 hover:bg-blue-700" type="submit">Register</button>
				</form>
			) : (
				<form onSubmit={verify} className="space-y-3">
					<input className="w-full rounded border px-3 py-2" value={code} onChange={(e) => setCode(e.target.value)} placeholder="OTP Code" />
					<button className="w-full rounded bg-emerald-600 text-white px-3 py-2 hover:bg-emerald-700" type="submit">Verify</button>
				</form>
			)}
			{msg && <div className="text-sm mt-3 text-gray-700">{msg}</div>}
		</div>
	);
}
