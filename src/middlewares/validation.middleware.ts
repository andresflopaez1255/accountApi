import { NextFunction, Request, Response } from 'express';
import messageBody from '../utils/messageBody';

type Validator = (body: Record<string, unknown>) => string | null;

const required = (body: Record<string, unknown>, fields: string[]): string | null =>
	fields.find((field) => typeof body[field] !== 'string' && typeof body[field] !== 'number')
		? `Missing required field: ${fields.find((field) => typeof body[field] !== 'string' && typeof body[field] !== 'number')}`
		: null;

export const validate = (validator: Validator) => (req: Request, res: Response, next: NextFunction): void => {
	const error = validator(req.body as Record<string, unknown>);
	if (error) {
		res.status(422).json(messageBody(null, error, false));
		return;
	}
	next();
};

export const validateUser: Validator = (body) => {
	const error = required(body, ['name_user', 'cellphone_user']);
	if (error) return error;
	if (body.email_user && (typeof body.email_user !== 'string' || !/^\S+@\S+\.\S+$/.test(body.email_user))) return 'email_user is invalid';
	return null;
};
export const validateAccount: Validator = (body) => {
	const error = required(body, ['id_user', 'id_category', 'email_account', 'pass_account', 'name_profile', 'expiration_date']);
	if (error) return error;
	if (typeof body.email_account !== 'string' || !/^\S+@\S+\.\S+$/.test(body.email_account)) return 'email_account is invalid';
	return null;
};
export const validateCategory: Validator = (body) => required(body, ['category_name']);
export const validateVendorRegistration: Validator = (body) => {
	const error = required(body, ['email', 'num_doc', 'type_doc', 'password']);
	if (error) return error;
	if (typeof body.email !== 'string' || !/^\S+@\S+\.\S+$/.test(body.email)) return 'email is invalid';
	if (typeof body.password !== 'string' || body.password.length < 8) return 'password must contain at least 8 characters';
	return null;
};
export const validateVendorLogin: Validator = (body) => {
	if (!body.password || (!body.email && !body.num_doc)) return 'email or num_doc and password are required';
	return null;
};
