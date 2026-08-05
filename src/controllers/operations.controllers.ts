import { Request, Response } from 'express';
import { v4 as uuid } from 'uuid';
import { db } from '../firebase';
import messageBody from '../utils/messageBody';

type CollectionName = 'sales' | 'providers' | 'incidents' | 'products';

const collection = (name: CollectionName) => db.collection(name);

const list = (name: CollectionName) => async (_req: Request, res: Response): Promise<void> => {
	try {
		const data = (await collection(name).orderBy('created_at', 'desc').get()).docs.map((doc) => doc.data());
		res.status(200).json(messageBody(data, `${name} found successfully`, true));
	} catch (_error) {
		res.status(500).json(messageBody(null, `Unable to load ${name}`, false));
	}
};

const create = (name: CollectionName) => async (req: Request, res: Response): Promise<void> => {
	try {
		const id = uuid();
		const record = { id, ...req.body, created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
		await collection(name).doc(id).set(record);
		res.status(201).json(messageBody(record, `${name} created successfully`, true));
	} catch (_error) {
		res.status(500).json(messageBody(null, `Unable to create ${name}`, false));
	}
};

const update = (name: CollectionName) => async (req: Request, res: Response): Promise<void> => {
	try {
		const id = String(req.body.id || req.query.id || '');
		if (!id) { res.status(422).json(messageBody(null, 'Record id is required', false)); return; }
		const ref = collection(name).doc(id);
		if (!(await ref.get()).exists) { res.status(404).json(messageBody(null, 'Record not found', false)); return; }
		const { id: _id, created_at: _createdAt, ...changes } = req.body as Record<string, unknown>;
		void _id; void _createdAt;
		await ref.update({ ...changes, updated_at: new Date().toISOString() });
		res.status(200).json(messageBody({ id, ...changes }, `${name} updated successfully`, true));
	} catch (_error) {
		res.status(500).json(messageBody(null, `Unable to update ${name}`, false));
	}
};

const remove = (name: CollectionName) => async (req: Request, res: Response): Promise<void> => {
	try {
		const id = String(req.query.id || '');
		if (!id) { res.status(422).json(messageBody(null, 'Record id is required', false)); return; }
		const ref = collection(name).doc(id);
		if (!(await ref.get()).exists) { res.status(404).json(messageBody(null, 'Record not found', false)); return; }
		await ref.delete();
		res.status(200).json(messageBody({ id }, `${name} deleted successfully`, true));
	} catch (_error) {
		res.status(500).json(messageBody(null, `Unable to delete ${name}`, false));
	}
};

export const getSales = list('sales');
export const addSale = create('sales');
export const updateSale = update('sales');
export const deleteSale = remove('sales');
export const getProviders = list('providers');
export const addProvider = create('providers');
export const updateProvider = update('providers');
export const deleteProvider = remove('providers');
export const getIncidents = list('incidents');
export const addIncident = create('incidents');
export const updateIncident = update('incidents');
export const deleteIncident = remove('incidents');
export const getProducts = list('products');
export const addProduct = create('products');
export const updateProduct = update('products');
export const deleteProduct = remove('products');

export async function getBusinessSummary(_req: Request, res: Response): Promise<void> {
	try {
		const [salesSnapshot, incidentsSnapshot] = await Promise.all([collection('sales').get(), collection('incidents').get()]);
		const sales = salesSnapshot.docs.map((doc) => doc.data());
		const paidSales = sales.filter((sale) => sale.payment_status === 'paid');
		const revenue = paidSales.reduce((total, sale) => total + Number(sale.price || 0), 0);
		const cost = paidSales.reduce((total, sale) => total + Number(sale.cost || 0), 0);
		const pending = sales.filter((sale) => sale.payment_status === 'pending').reduce((total, sale) => total + Number(sale.price || 0), 0);
		const openIncidents = incidentsSnapshot.docs.filter((doc) => doc.data().status !== 'resolved').length;
		res.status(200).json(messageBody({ revenue, cost, profit: revenue - cost, pending, sales_count: sales.length, open_incidents: openIncidents }, 'Business summary found successfully', true));
	} catch (_error) {
		res.status(500).json(messageBody(null, 'Unable to load business summary', false));
	}
}

export async function getClientHistory(req: Request, res: Response): Promise<void> {
	try {
		const clientId = String(req.query.client_id || '');
		if (!clientId) { res.status(422).json(messageBody(null, 'client_id is required', false)); return; }
		const [sales, incidents, accounts] = await Promise.all([
			collection('sales').where('client_id', '==', clientId).get(),
			collection('incidents').where('client_id', '==', clientId).get(),
			db.collection('accounts').where('id_user', '==', clientId).get(),
		]);
		res.status(200).json(messageBody({ sales: sales.docs.map((doc) => doc.data()), incidents: incidents.docs.map((doc) => doc.data()), accounts: accounts.docs.map((doc) => doc.data()) }, 'Client history found successfully', true));
	} catch (_error) {
		res.status(500).json(messageBody(null, 'Unable to load client history', false));
	}
}
