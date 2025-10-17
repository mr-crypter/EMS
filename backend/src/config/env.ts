import { z } from 'zod';

const EnvSchema = z.object({
	PORT: z.string().optional(),
	CORS_ORIGIN: z.string().default('*'),

	SUPABASE_URL: z.string(),
	SUPABASE_SERVICE_ROLE_KEY: z.string(),

	JWT_SECRET: z.string(),

	SMTP_HOST: z.string(),
	SMTP_PORT: z.string(),
	SMTP_USER: z.string(),
	SMTP_PASS: z.string(),
	SMTP_FROM: z.string(),

	GEMINI_API_KEY: z.string()
});

export const env = EnvSchema.parse(process.env);
