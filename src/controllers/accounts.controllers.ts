/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* import { categories_account, Prisma, user } from '@prisma/client';
 */ import { Request, Response } from 'express';
import moment from 'moment';
import { infoMessage } from '../Interfaces';
import prisma from '../utils/dbClient';
import messageBody from '../utils/messageBody';
import { MessagesAccounts } from '../utils/messages';
import sendMessage from './messages.controller';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function getAllAccounts(
	req: Request,
	res: Response
): Promise<Response<any, Record<string, any>> | undefined> {
	const result = await getAccountsWithDate()

	if(result.length==0){
		return
	}
	result.map((info:infoMessage)=>{
		sendMessage(info)
	})
	
	console.log(result)
	try {
		const allAccounts = await prisma.accounts.findMany();
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
					id: account.id_user,
				},
			});

			dataAccounts.push({
				...account,
				name_user: userInfo?.name_user,
				cellphone_user: userInfo?.cellphone_user,
				category: categoryInfo?.category_name,
			});
		}

		if (!dataAccounts.length) {
			return res
				.status(200)
				.send(messageBody(dataAccounts, MessagesAccounts.notSuccessful, true));
		} else {
			return res
				.status(200)
				.send(messageBody(dataAccounts, MessagesAccounts.successful, true));
		}
	} catch (error) {
		return res
			.status(400)
			.send(messageBody(null, MessagesAccounts.error, true));
	}
}

async function getAccountsWithDate() {
	try {

		const date = moment().format('L')
		const after2daysFromToday = moment().add(1,'days').format('L')
		console.log(after2daysFromToday)
		const allAccounts: any = await prisma.$queryRaw`
         SELECT * FROM accounts WHERE  expiration_date >= ${date} AND expiration_date <= ${after2daysFromToday}
        `;
		console.log('okiii', allAccounts)
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
			})
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

async function addAccount(req:Request, res: Response) {
	const account = req.body
	try {
		const AccountIfExist = prisma.users.findFirst({
			where: account.id
		})
		if(!AccountIfExist){
			await prisma.categories_account.create({
				data:account
			}); 
			
			res.status(200).json(messageBody(null,MessagesAccounts.created,true))
		}
		res.status(202).json(messageBody(null,'category if exist',false))
	} catch (error) {
		res.status(401).json(messageBody(error,MessagesAccounts.error,false))
	}
}

async function updateAccount(req:Request, res:Response) {
	
	
	try {
		
		const result = await prisma.accounts.update({
			where: {
				id: parseInt('' + req.query.id)
			},
			data: req.body
		})
		res.status(200).json(messageBody(result,MessagesAccounts.updated,true))
	} catch (error) {
		res.status(400).json(messageBody(error,MessagesAccounts.error,false))
	}
}

async function deleteAccount(req:Request,res:Response) {
	console.log( req.query.id)
	try {
		

		const result = await prisma.accounts.delete({
			where: {
				id:  parseInt(''+req.query.id)
			}

		})

		
		res.status(200).json(messageBody(result,MessagesAccounts.deleted,true))
	} catch (error) {
		res.status(400).json(messageBody(error,MessagesAccounts.error,false))
	}
}


export { getAllAccounts, getAccountsWithDate,addAccount,updateAccount,deleteAccount };
