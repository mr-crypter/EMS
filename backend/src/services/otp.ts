import crypto from 'crypto';
import { supabaseAdmin } from '../config/supabase.js';
import { sendEmail } from './email.js';

export async function generateOtp(email: string): Promise<string> {
	const code = crypto.randomInt(0, 1000000).toString().padStart(6, '0');
	const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();
	await supabaseAdmin.from('otp_codes').insert({ email, code, expires_at: expiresAt, consumed: false });
	return code;
}

export async function sendOtpEmail(email: string, code: string) {
	await sendEmail(email, 'Your verification code', `Your OTP code is ${code}. It expires in 10 minutes.`);
}

export async function verifyAndConsumeOtp(email: string, code: string): Promise<boolean> {
	const { data, error } = await supabaseAdmin
		.from('otp_codes')
		.select('id, expires_at, consumed')
		.eq('email', email)
		.eq('code', code)
		.order('created_at', { ascending: false })
		.limit(1)
		.maybeSingle();
	if (error || !data) return false;
	if (data.consumed) return false;
	if (new Date(data.expires_at).getTime() < Date.now()) return false;
	await supabaseAdmin.from('otp_codes').update({ consumed: true }).eq('id', data.id);
	return true;
}
