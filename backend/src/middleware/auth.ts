import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { Role } from '../types/roles';

export type JwtUser = {
	id: string;
	email: string;
	role: Role;
};

declare global {
	namespace Express {
		interface Request {
			user?: JwtUser;
		}
	}
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
	const authHeader = req.headers.authorization;
	if (!authHeader?.startsWith('Bearer ')) {
		return res.status(401).json({ error: 'Unauthorized' });
	}
	const token = authHeader.slice('Bearer '.length);
	try {
		const payload = jwt.verify(token, env.JWT_SECRET) as JwtUser;
		req.user = payload;
		return next();
	} catch {
		return res.status(401).json({ error: 'Invalid token' });
	}
}

export function requireRole(roles: Role[]) {
	return (req: Request, res: Response, next: NextFunction) => {
		if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
		if (!roles.includes(req.user.role)) return res.status(403).json({ error: 'Forbidden' });
		return next();
	};
}
