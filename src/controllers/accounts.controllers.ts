/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* import { categories_account, Prisma, user } from '@prisma/client';
 */ import { Request, Response } from 'express';
import moment from 'moment';
import prisma from '../utils/dbClient';
import messageBody from '../utils/messageBody';
import { MessagesAccounts } from '../utils/messages';
import { db } from '../firebase';
import { v4 as uuid } from 'uuid';
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function getAllAccounts(
	req: Request,
	res: Response
): Promise<Response<any, Record<string, any>> | undefined> {
	try {
		res.setHeader('Content-Type', 'application/json');
		const accounts = await db.collection('accounts').get();
		const dataAccounts: any = [];
		for (let index = 0; index < accounts.docs.length; index++) {
			const account = accounts.docs[index].data();
			console.log(account);
			const userInfo = await db
				.collection('users')
				.where('id', '==', account.id_user)
				.get();
			const categoriesInfo = await db
				.collection('categories_account')
				.where('id', '==', account.id_category)
				.get();

			//console.log(userInfo.docs.map((doc) => doc.data()));
			dataAccounts.push({
				...account,
				name_user: userInfo.docs[0].data()?.name_user,
				cellphone_user: userInfo.docs[0].data()?.cellphone_user,
				category: categoriesInfo.docs[0].data()?.category_name,
			});
		}
		if (!dataAccounts.length) {
			return res
				.status(200)
				.send(messageBody(dataAccounts, MessagesAccounts.successful, false));
		} else {
			return res
				.status(200)
				.send(messageBody(dataAccounts, MessagesAccounts.successful, true));
		}
	} catch (error) {
		console.log(error);
		return res
			.status(400)
			.send(messageBody(null, MessagesAccounts.error, false));
	}
}

async function getAccountsWithDate() {
	try {
		const date = moment().format('L');
		const after2daysFromToday = moment().add(1, 'days').format('L');
		console.log(after2daysFromToday);
		const allAccounts: any = await prisma.$queryRaw`
         SELECT * FROM accounts WHERE  expiration_date >= ${date} AND expiration_date <= ${after2daysFromToday}
        `;
		const dataAccounts: any = [];
		for (let index = 0; index < allAccounts.length; index++) {
			const account = allAccounts[index];

			const userInfo = await prisma.users.findFirst({
				select: {
					cellphone_user: true,
					name_user: true,
				},
				where: {
					id: account.id_user,
				},
			});
			const categoryInfo = await prisma.categories_account.findFirst({
				select: {
					category_name: true,
				},
				where: {
					id: account.id_category,
				},
			});
			console.log({
				...account,
				name_user: userInfo?.name_user,
				cellphone_user: userInfo?.cellphone_user,
				category: categoryInfo?.category_name,
			});
			dataAccounts.push({
				...account,
				name_user: userInfo?.name_user,
				cellphone_user: userInfo?.cellphone_user,
				category: categoryInfo?.category_name,
			});
		}

		return dataAccounts;
	} catch (error) {
		return [];
	}
}

async function addAccount(req: Request, res: Response) {
	const account = req.body;
	res.setHeader('Content-Type', 'application/json');
	try {

		const newaccount = { id: uuid(), ...account }
		await
		db.collection('accounts').add(newaccount);

		// buscar usuario por user_id y modificar accounts array
		const user = await db
			.collection('users')
			.where('id', '==', account.id_user)
			.get();

		if (user.docs.length > 0) {
			const userData = user.docs[0].data();

			const accounts = userData.accounts || [];
			accounts.push(newaccount);
			await db.collection('users').doc(user.docs[0].id).update({
				accounts: accounts,
			});
		}

		res.status(200).json(messageBody(null, MessagesAccounts.created, true));
	} catch (error) {
		res.status(401).json(messageBody(error, MessagesAccounts.error, false));
	}
}

async function updateAccount(req: Request, res: Response) {
	res.setHeader('Content-Type', 'application/json');
	try {
		const account = req.body;
		const accountDoc = await db
			.collection('accounts')
			.where('id', '==', account.id)
			.get();

		if (accountDoc.empty) {
			res
				.status(404)
				.json(messageBody(null, 'Account not found', false));
		}

		await db
			.collection('accounts')
			.doc(accountDoc.docs[0].id)
			.update(account);

		// Actualizar la cuenta en el array de cuentas del usuario relacionado
		const user = await db
			.collection('users')
			.where('id', '==', account.id_user)
			.get();

		if (user.docs.length > 0) {
			const userData = user.docs[0].data();
			const accounts = userData.accounts || [];
			const accountIndex = accounts.findIndex((acc: any) => acc.id === account.id);

			if (accountIndex !== -1) {
				accounts[accountIndex] = { ...accounts[accountIndex], ...account };
				await db.collection('users').doc(user.docs[0].id).update({
					accounts: accounts,
				});
			}
		}

		const result = { ...account };
		res.status(200).json(messageBody(result, MessagesAccounts.updated, true));
	} catch (error) {
		res.status(400).json(messageBody(error, MessagesAccounts.error, false));
	}
}

async function deleteAccount(req: Request, res: Response) {
	res.setHeader('Content-Type', 'application/json');
	console.log(req.query)
	try {
		const { id } = req.query;
		const accountDoc = await db
			.collection('accounts')
			.where('id', '==', id)
			.get();

		if (accountDoc.empty) {
			return res
				.status(404)
				.json(messageBody(null, 'Account not found', false));
		}

		const accountData = accountDoc.docs[0].data();

		const user = await db
			.collection('users')
			.where('id', '==', accountData.id_user)
			.get();

		if (user.docs.length > 0) {
			const userData = user.docs[0].data();

			const accounts = Array.isArray(userData.accounts) ? userData.accounts : [];
			const updatedAccounts = accounts.filter((acc: any) => acc.id !== id);

			const userDocRef = user.docs[0].ref;
			await userDocRef.update({ accounts: updatedAccounts });

		}


		await db.collection('accounts').doc(accountDoc.docs[0].id).delete();
		return res
			.status(200)
			.json(messageBody(accountData, MessagesAccounts.deleted, true));
	} catch (error) {
		console.log(error)
		return res
			.status(400)
			.json(messageBody(error, MessagesAccounts.error, false));
	}
}

export {
	getAllAccounts,
	getAccountsWithDate,
	addAccount,
	updateAccount,
	deleteAccount,
};
