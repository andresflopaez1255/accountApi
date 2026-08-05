import { Request, Response } from 'express';
import { v4 as uuid } from 'uuid';
import { db } from '../firebase';
import { Vendor } from '../models/auth.vendors.interfaces';
import messageBody from '../utils/messageBody';
import { MessagesAuth } from '../utils/messages';

interface VendorLogin { email?: string; num_doc?: string; password: string }

const vendors = db.collection('vendors');

const publicVendor = (vendor: Vendor) => ({
	id_vendor: vendor.id_vendor,
	email: vendor.email,
	num_doc: vendor.num_doc,
	type_doc: vendor.type_doc,
});

async function vendorRegistration(req: Request, res: Response): Promise<void> {
	try {
		if (process.env.ALLOW_VENDOR_REGISTRATION !== 'true') {
			res.status(403).json(messageBody(null, 'Vendor registration is disabled', false));
			return;
		}
		const body = req.body as Omit<Vendor, 'id_vendor'>;
		const existing = await vendors.where('email', '==', body.email.toLowerCase()).limit(1).get();
		if (!existing.empty) {
			res.status(409).json(messageBody(null, MessagesAuth.vendorAlreadyExists, false));
			return;
		}
		const id_vendor = uuid();
		const { default: bcrypt } = await import('bcrypt');
		const vendor: Vendor = {
			id_vendor,
			email: body.email.toLowerCase(),
			num_doc: body.num_doc,
			type_doc: body.type_doc,
			password: await bcrypt.hash(body.password, 12),
		};
		await vendors.doc(id_vendor).set({ ...vendor, created_at: new Date().toISOString() });
		res.status(201).json(messageBody(publicVendor(vendor), MessagesAuth.created, true));
	} catch (_error) {
		res.status(500).json(messageBody(null, MessagesAuth.error, false));
	}
}

async function vendorLogIn(req: Request, res: Response): Promise<void> {
	try {
		const body = req.body as VendorLogin;
		const field = body.email ? 'email' : 'num_doc';
		const value = body.email ? body.email.toLowerCase() : body.num_doc;
		const snapshot = await vendors.where(field, '==', value).limit(1).get();
		if (snapshot.empty) {
			res.status(401).json(messageBody(null, MessagesAuth.notSuccessful, false));
			return;
		}
		const vendor = snapshot.docs[0].data() as Vendor;
		const { default: bcrypt } = await import('bcrypt');
		if (!(await bcrypt.compare(body.password, vendor.password))) {
			res.status(401).json(messageBody(null, MessagesAuth.notSuccessful, false));
			return;
		}
		const secret = process.env.JWT_SECRET;
		if (!secret) throw new Error('JWT_SECRET is not configured');
		const { default: jwt } = await import('jsonwebtoken');
		const access_token = jwt.sign({ vendorId: vendor.id_vendor, email: vendor.email }, secret, { expiresIn: '8h' });
		res.status(200).json(messageBody({ ...publicVendor(vendor), access_token }, MessagesAuth.successful, true));
	} catch (_error) {
		res.status(500).json(messageBody(null, MessagesAuth.error, false));
	}
}

async function vendorRecoveryPass(_req: Request, res: Response): Promise<void> {
	res.status(501).json(messageBody(null, 'Password recovery is not configured. Use a verified email provider before enabling it.', false));
}

export { vendorRegistration, vendorLogIn, vendorRecoveryPass };
