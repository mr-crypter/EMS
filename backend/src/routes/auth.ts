import { Router } from 'express';
import { z } from 'zod';
import { supabaseAdmin } from '../config/supabase';
import { hashPassword, verifyPassword } from '../utils/password';
import { sendOtpEmail, generateOtp, verifyAndConsumeOtp } from '../services/otp';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { Role } from '../types/roles';

const router = Router();

const RegisterSchema = z.object({
	email: z.string().email(),
	password: z.string().min(6),
	role: z.enum(['student', 'category_reviewer', 'budget_reviewer']).optional()
});

router.post('/register', async (req, res) => {
	const parse = RegisterSchema.safeParse(req.body);
	if (!parse.success) return res.status(400).json({ error: parse.error.flatten() });
	const { email, password, role } = parse.data;
	const passwordHash = await hashPassword(password);
	const userRole: Role = role ?? 'student';
	const { data: existing, error: exErr } = await supabaseAdmin
		.from('users')
		.select('id')
		.eq('email', email)
		.maybeSingle();
	if (exErr) return res.status(500).json({ error: exErr.message });
	if (existing) return res.status(409).json({ error: 'Email already registered' });

	const { data, error } = await supabaseAdmin
		.from('users')
		.insert({ email, password_hash: passwordHash, role: userRole, is_verified: false })
		.select('id')
		.single();
	if (error) return res.status(500).json({ error: error.message });

	const code = await generateOtp(email);
	await sendOtpEmail(email, code);
	return res.json({ id: data.id, message: 'Registered. OTP sent to email.' });
});

const RequestOtpSchema = z.object({ email: z.string().email() });
router.post('/request-otp', async (req, res) => {
	const parse = RequestOtpSchema.safeParse(req.body);
	if (!parse.success) return res.status(400).json({ error: parse.error.flatten() });
	const { email } = parse.data;
	const code = await generateOtp(email);
	await sendOtpEmail(email, code);
	return res.json({ message: 'OTP sent' });
});

const VerifyOtpSchema = z.object({ email: z.string().email(), code: z.string().length(6) });
router.post('/verify-otp', async (req, res) => {
	const parse = VerifyOtpSchema.safeParse(req.body);
	if (!parse.success) return res.status(400).json({ error: parse.error.flatten() });
	const { email, code } = parse.data;
	const ok = await verifyAndConsumeOtp(email, code);
	if (!ok) return res.status(400).json({ error: 'Invalid/expired OTP' });
	const { error } = await supabaseAdmin
		.from('users')
		.update({ is_verified: true })
		.eq('email', email);
	if (error) return res.status(500).json({ error: error.message });
	return res.json({ message: 'Email verified' });
});

const LoginSchema = z.object({ email: z.string().email(), password: z.string().min(6) });
router.post('/login', async (req, res) => {
	const parse = LoginSchema.safeParse(req.body);
	if (!parse.success) return res.status(400).json({ error: parse.error.flatten() });
	const { email, password } = parse.data;
	const { data: user, error } = await supabaseAdmin
		.from('users')
		.select('id, email, password_hash, role, is_verified')
		.eq('email', email)
		.single();
	if (error) return res.status(401).json({ error: 'Invalid credentials' });
	if (!user.is_verified) return res.status(403).json({ error: 'Email not verified' });
	const ok = await verifyPassword(password, user.password_hash);
	if (!ok) return res.status(401).json({ error: 'Invalid credentials' });
	const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, env.JWT_SECRET, { expiresIn: '7d' });
	return res.json({ token, role: user.role });
});

export default router;
