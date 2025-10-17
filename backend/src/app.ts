import express from 'express';
import cors from 'cors';
import { env } from './config/env.js';
import authRouter from './routes/auth.js';
import proposalsRouter from './routes/proposals.js';

const app = express();

// Support comma-separated origins and wildcard with credentials by reflecting allowed origins
const configuredOrigins = (env.CORS_ORIGIN || '')
    .split(',')
    .map(o => o.trim())
    .filter(Boolean);
const allowAllOrigins = configuredOrigins.includes('*');

app.use(cors({
    origin: (origin, callback) => {
        // Allow non-browser requests or same-origin without Origin header
        if (!origin) return callback(null, true);
        if (allowAllOrigins) return callback(null, true);
        if (configuredOrigins.includes(origin)) return callback(null, true);
        return callback(new Error('Not allowed by CORS'));
    },
    credentials: true
}));
app.use(express.json());

app.get('/health', (_req, res) => res.json({ ok: true }));
app.use('/auth', authRouter);
app.use('/proposals', proposalsRouter);

export default app;
