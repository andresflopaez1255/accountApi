import { Request, Response } from 'express';
import { v4 as uuid } from 'uuid';
import { db } from '../firebase';
import messageBody from '../utils/messageBody';
import { MessagesUsers } from '../utils/messages';
import { searchUserDataUseCase } from '../usecases/users/searchUserData.usecase';

const users = db.collection('users');

const findUser = async (id: string) => {
	const direct = await users.doc(id).get();
	if (direct.exists) return direct;
	const legacy = await users.where('id', '==', id).limit(1).get();
	return legacy.docs[0];
};

async function getUsers(_req: Request, res: Response): Promise<void> {
	try { const data = (await users.get()).docs.map((doc) => doc.data()); res.status(200).json(messageBody(data, data.length ? MessagesUsers.successful : MessagesUsers.notSuccessful, true)); }
	catch (_error) { res.status(500).json(messageBody(null, MessagesUsers.error, false)); }
}
async function addUser(req: Request, res: Response): Promise<void> {
	try {
		const cellphone_user = String(req.body.cellphone_user).trim();
		const existing = await users.where('cellphone_user', '==', cellphone_user).limit(1).get();
		if (!existing.empty) { res.status(409).json(messageBody(null, 'El usuario ya existe', false)); return; }
		const id = uuid(); const user = { ...req.body, id, cellphone_user, accounts: [], created_at: new Date().toISOString() };
		await users.doc(id).set(user); res.status(201).json(messageBody(user, MessagesUsers.created, true));
	} catch (_error) { res.status(500).json(messageBody(null, MessagesUsers.error, false)); }
}
async function updateUser(req: Request, res: Response): Promise<void> {
	try {
		const id = String(req.body.id || ''); if (!id) { res.status(422).json(messageBody(null, 'User id is required', false)); return; }
		const doc = await findUser(id); if (!doc || !doc.exists) { res.status(404).json(messageBody(null, 'User not found', false)); return; }
		const ref = doc.ref;
		const { accounts, id: _id, ...changes } = req.body as Record<string, unknown>;
		void accounts; void _id;
		await ref.update({ ...changes, updated_at: new Date().toISOString() });
		res.status(200).json(messageBody({ ...doc.data(), ...changes, id }, MessagesUsers.updated, true));
	} catch (_error) { res.status(500).json(messageBody(null, MessagesUsers.error, false)); }
}
async function deleteUser(req: Request, res: Response): Promise<void> {
	try {
		const id = String(req.query.id || ''); if (!id) { res.status(422).json(messageBody(null, 'User id is required', false)); return; }
		const user = await findUser(id); if (!user || !user.exists) { res.status(404).json(messageBody(null, 'User not found', false)); return; }
		const userRef = user.ref;
		const accountDocs = await db.collection('accounts').where('id_user', '==', id).get();
		const batch = db.batch(); batch.delete(userRef); accountDocs.docs.forEach((doc) => batch.delete(doc.ref)); await batch.commit();
		res.status(200).json(messageBody({ id, deleted_accounts: accountDocs.size }, MessagesUsers.deleted, true));
	} catch (_error) { res.status(500).json(messageBody(null, MessagesUsers.error, false)); }
}
async function searchUsers(req: Request, res: Response): Promise<void> {
	try { const data = await searchUserDataUseCase(String(req.query.q || '')); res.status(200).json(messageBody(data, MessagesUsers.successful, true)); }
	catch (_error) { res.status(500).json(messageBody(null, MessagesUsers.error, false)); }
}
export { getUsers, addUser, updateUser, deleteUser, searchUsers };
