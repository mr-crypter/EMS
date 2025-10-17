import nodemailer from 'nodemailer';
import { env } from '../config/env.js';

const transporter = nodemailer.createTransport({
	host: env.SMTP_HOST,
	port: parseInt(env.SMTP_PORT, 10),
	secure: false,
	auth: { user: env.SMTP_USER, pass: env.SMTP_PASS }
});

export async function sendEmail(to: string, subject: string, text: string) {
	await transporter.sendMail({ from: env.SMTP_FROM, to, subject, text });
}
