import { Request, Response } from 'express';
import messageBody from '../utils/messageBody';
import { MessagesUsers } from '../utils/messages';
import { db } from '../firebase';
import { v4 as uuid } from 'uuid';
// eslint-disable-next-line @typescript-eslint/no-explicit-any

async function getUsers(
	req: Request,
	res: Response
): Promise<Response<any, Record<string, any>> | undefined> {
	res.setHeader('Content-Type', 'application/json');
	const usersSnapshot = await db.collection('users').get();
	const users = usersSnapshot.docs.map((doc) => doc.data());

	try {
		if (!users.length) {
			return res
				.status(200)
				.send(messageBody(users, MessagesUsers.notSuccessful, true));
		} else {
			return res
				.status(200)
				.send(messageBody(users, MessagesUsers.successful, true));
		}
	} catch (error) {
		console.log(error); // Mueve esto aquí
		return res.status(400).send(messageBody(null, MessagesUsers.error, true));
	}
}

async function addUser(req: Request, res: Response) {
	const user = req.body;
	res.setHeader('Content-Type', 'application/json');
	const userIfExist = await db
		.collection('users')
		.doc(user.cellphone_user)
		.get();

	try {
		if (!userIfExist.exists) {
			// buscar cuentas por id de usuario en firebase en accounts
			const accounts = await db
				.collection('accounts')
				.where('cellphone_user', '==', user.cellphone_user)
				.get();

			db.collection('users').add({
				id: uuid(),
				...user,
				accounts: accounts.docs.length > 0 ? accounts.docs : [],
			});

			res.status(200).json(messageBody(null, MessagesUsers.created, true));
		} else {
			res.status(400).json(messageBody(null, 'El usuario ya existe', true));
		}
	} catch (error) {
		console.error(error);
		res.status(401).json(messageBody(error, MessagesUsers.error, false));
	}
}

async function updateUser(req: Request, res: Response) {
	res.setHeader('Content-Type', 'application/json');

	try {
		const user = req.body;

		const userDoc = await db.collection('users').where('id', '==', user.id).get();
		if (userDoc.empty) {
			res.status(404).json(messageBody(null, 'User not found', false));
		}

		await db.collection('users').doc(userDoc.docs[0].id).update(user);

		const result = user;
		res.status(200).json(messageBody(result, MessagesUsers.updated, true));
	} catch (error) {
		res.status(400).json(messageBody(error, MessagesUsers.error, false));
	}
}

async function deleteUser(req: Request, res: Response) {
	const id = req.query.id;
	res.setHeader('Content-Type', 'application/json');

	try {

		const userDoc = await db.collection('users').where('id', '==', id).get();
		if (userDoc.empty) {
			res.status(404).json(messageBody(null, 'User not found', false));
		}

		await db.collection('users').doc(userDoc.docs[0].id).delete();

		const accountDoc = await db.collection('accounts').where('id_user', '==', id).get();
		if (!accountDoc.empty) {
			accountDoc.forEach(async (doc) => {
				await db.collection('accounts').doc(doc.id).delete();
			});
		}

		const result = { id };



		await db.collection('accounts').doc(accountDoc.docs[0].id).delete();



		res.status(200).json(messageBody(result, MessagesUsers.deleted, true));
	} catch (error) {
		res.status(400).json(messageBody(error, MessagesUsers.error, false));
	}
}
export { getUsers, addUser, updateUser, deleteUser };
