import { Request, Response } from 'express';
import { v4 as uuid } from 'uuid';
import { db } from '../firebase';
import messageBody from '../utils/messageBody';
import { MessagesCategories } from '../utils/messages';
import { getAllCategoriesUseCase } from '../usecases/categories/getAllCategories.usecase';

const categories = db.collection('categories_account');
const findCategory = async (id: string) => {
	const direct = await categories.doc(id).get();
	if (direct.exists) return direct;
	const legacy = await categories.where('id', '==', id).limit(1).get();
	return legacy.docs[0];
};

async function getCategories(_req: Request, res: Response): Promise<void> {
	try {
		const data = await getAllCategoriesUseCase();
		res.status(200).json(messageBody(data, data.length ? MessagesCategories.successful : MessagesCategories.notSuccessful, true));
	} catch (_error) { res.status(500).json(messageBody(null, MessagesCategories.error, false)); }
}
async function addCategory(req: Request, res: Response): Promise<void> {
	try {
		const category_name = String(req.body.category_name).trim();
		const existing = await categories.where('category_name', '==', category_name).limit(1).get();
		if (!existing.empty) { res.status(409).json(messageBody(null, 'Category already exists', false)); return; }
		const id = uuid(); const category = { id, category_name, created_at: new Date().toISOString() };
		await categories.doc(id).set(category);
		res.status(201).json(messageBody(category, MessagesCategories.created, true));
	} catch (_error) { res.status(500).json(messageBody(null, MessagesCategories.error, false)); }
}
async function updateCategory(req: Request, res: Response): Promise<void> {
	try {
		const id = String(req.query.id || req.body.id || '');
		if (!id) { res.status(422).json(messageBody(null, 'Category id is required', false)); return; }
		const doc = await findCategory(id);
		if (!doc || !doc.exists) { res.status(404).json(messageBody(null, 'Category not found', false)); return; }
		const ref = doc.ref;
		const category_name = String(req.body.category_name).trim();
		await ref.update({ category_name, updated_at: new Date().toISOString() });
		res.status(200).json(messageBody({ id, category_name }, MessagesCategories.updated, true));
	} catch (_error) { res.status(500).json(messageBody(null, MessagesCategories.error, false)); }
}
async function deleteCategory(req: Request, res: Response): Promise<void> {
	try {
		const id = String(req.query.id || '');
		if (!id) { res.status(422).json(messageBody(null, 'Category id is required', false)); return; }
		const category = await findCategory(id); if (!category || !category.exists) { res.status(404).json(messageBody(null, 'Category not found', false)); return; }
		const ref = category.ref;
		const accounts = await db.collection('accounts').where('id_category', '==', id).limit(1).get();
		if (!accounts.empty) { res.status(409).json(messageBody(null, 'Category is assigned to accounts and cannot be deleted', false)); return; }
		await ref.delete(); res.status(200).json(messageBody({ id }, MessagesCategories.deleted, true));
	} catch (_error) { res.status(500).json(messageBody(null, MessagesCategories.error, false)); }
}
export { getCategories, addCategory, updateCategory, deleteCategory };
