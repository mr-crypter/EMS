import { useState } from 'react';

export default function Signup() {
	const [email, setEmail] = useState('student@example.com');
	const [password, setPassword] = useState('Password123!');
	const [code, setCode] = useState('');
	const [stage, setStage] = useState<'register' | 'verify'>('register');
	const [msg, setMsg] = useState<string | null>(null);
	const base = (import.meta as any).env.VITE_API_URL || 'http://localhost:4000';

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
		<div style={{ display: 'grid', gap: 8, maxWidth: 360 }}>
			<h2>Signup</h2>
			{stage === 'register' ? (
				<form onSubmit={register} style={{ display: 'grid', gap: 8 }}>
					<input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
					<input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" />
					<button type="submit">Register</button>
				</form>
			) : (
				<form onSubmit={verify} style={{ display: 'grid', gap: 8 }}>
					<input value={code} onChange={(e) => setCode(e.target.value)} placeholder="OTP Code" />
					<button type="submit">Verify</button>
				</form>
			)}
			{msg && <div>{msg}</div>}
		</div>
	);
}
