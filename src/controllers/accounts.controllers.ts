/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* import { categories_account, Prisma, user } from '@prisma/client';
 */ import { Request, Response } from 'express';

import messageBody from '../utils/messageBody';
import { MessagesAccounts } from '../utils/messages';
import { getAllAccountsUseCase } from '../usecases/accounts/getAllAccounts.usecase';
import { createNewAccountUseCase } from '../usecases/accounts/createNewAccount.usecase';
import { updateAccountUseCase } from '../usecases/accounts/updateAccount.usecase';
import { deleteAccountUseCase } from '../usecases/accounts/deleteAccont.usecase';
import { seacrhDataAccountsUseCase } from '../usecases/accounts/searchDataAccounts.usecase';
import { db } from '../firebase';
import moment from 'moment';
import { useCaseSpecificDataUser } from '../usecases/users/specificDataUser.usecase';
import { getCategoryUseCase } from '../usecases/categories/getCategory.usecase';
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function getAllAccounts(
	req: Request,
	res: Response
): Promise<Response<any, Record<string, any>> | undefined> {
	try {
		res.setHeader('Content-Type', 'application/json');
		const accounts = await getAllAccountsUseCase();

		if (!accounts.length) {
			return res
				.status(200)
				.send(messageBody(accounts, MessagesAccounts.notSuccessful, true));
		} else {
			return res
				.status(200)
				.send(messageBody(accounts, MessagesAccounts.successful, true));
		}
	} catch (error) {
		console.log(error);
		return res
			.status(400)
			.send(messageBody(null, MessagesAccounts.error, false));
	}
}

async function getAccountsWithDateExpitarion() {
	try {
	
		const snapshot = await db.collection('accounts').get();
		const accountsToNotify: any[] = await Promise.all(
			snapshot.docs.map(async (doc) => {

				const data = doc.data();
				const userData = await useCaseSpecificDataUser('id', data.id_user);
				const categoryInfo = await getCategoryUseCase('id', data.id_category)
				const userinfo = userData.docs[0].data();
			
				const expiration = moment(data.expiration_date, 'MM/DD/YYYY');
				const limit = moment().add(2, 'days');
				const today = moment();

				if (expiration.isSameOrBefore(limit, 'day') && expiration.isSameOrAfter(today, 'day')) {
					const daysLeft = expiration.diff(today, 'days');
					return { id: doc.id, cellphone_user: userinfo.cellphone_user,category_name: categoryInfo?.category_name, ...data, daysLeft };
				}

				return null; 
			})
		);

	
		const filteredAccounts = accountsToNotify.filter((a) => a !== null);

	

		return filteredAccounts;
	} catch (error) {
		return [];
	}
}

async function addAccount(req: Request, res: Response) {
	const account = req.body;
	res.setHeader('Content-Type', 'application/json');
	try {

		const newAccount = createNewAccountUseCase(account);

		res.status(200).json(messageBody(newAccount, MessagesAccounts.created, true));
	} catch (error) {
		res.status(401).json(messageBody(error, MessagesAccounts.error, false));
	}
}

async function updateAccount(req: Request, res: Response) {
	res.setHeader('Content-Type', 'application/json');
	try {
		const account = req.body;
		const result = await updateAccountUseCase(account.id, account);

		res.status(200).json(messageBody(result, MessagesAccounts.updated, true));
	} catch (error) {
		res.status(400).json(messageBody(error, MessagesAccounts.error, false));
	}
}

async function deleteAccount(req: Request, res: Response) {
	res.setHeader('Content-Type', 'application/json');
	console.log(req.query)
	try {
		const accountId = req.query.id as string;
		const accountData = await deleteAccountUseCase(accountId);
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

async function searchAccount(req: Request, res: Response) {
	res.setHeader('Content-Type', 'application/json');
	const params = req.query.q as string;
	try {
		const result = await seacrhDataAccountsUseCase(params);
		console.log(result)
		
		res.status(200).json(messageBody(result, MessagesAccounts.updated, true));
	} catch (error) {
		res.status(400).json(messageBody(error, MessagesAccounts.error, false));
	}
	
}

export {
	getAllAccounts,
	getAccountsWithDateExpitarion,
	addAccount,
	updateAccount,
	deleteAccount,
	searchAccount
};
