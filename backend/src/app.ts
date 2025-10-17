import express from 'express';
import cors from 'cors';
import { env } from './config/env';
import authRouter from './routes/auth';
import proposalsRouter from './routes/proposals';

const app = express();

app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));
app.use(express.json());

app.get('/health', (_req, res) => res.json({ ok: true }));
app.use('/auth', authRouter);
app.use('/proposals', proposalsRouter);

export default app;
