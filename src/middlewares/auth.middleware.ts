import { NextFunction, Request, Response } from 'express';
import type { JwtPayload } from 'jsonwebtoken';
import messageBody from '../utils/messageBody';

export interface AuthenticatedRequest extends Request {
	vendor?: JwtPayload & { vendorId: string; email: string };
}

export const requireAuth = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
	if (process.env.NODE_ENV === 'development') {
		next();
		return;
	}
	const token = req.headers.authorization?.replace(/^Bearer\s+/i, '');
	const secret = process.env.JWT_SECRET;
	if (!secret) {
		res.status(500).json(messageBody(null, 'JWT_SECRET is not configured', false));
		return;
	}
	if (!token) {
		res.status(401).json(messageBody(null, 'Authentication token required', false));
		return;
	}
	try {
		const { default: jwt } = await import('jsonwebtoken');
		req.vendor = jwt.verify(token, secret) as AuthenticatedRequest['vendor'];
		next();
	} catch (_error) {
		res.status(401).json(messageBody(null, 'Invalid or expired authentication token', false));
	}
};
