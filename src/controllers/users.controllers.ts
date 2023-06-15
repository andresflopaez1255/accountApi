import { Request, Response } from 'express';
import prisma from '../utils/dbClient';
import messageBody from '../utils/messageBody';
import { MessagesUsers } from '../utils/messages';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function getUsers(
	req: Request,
	res: Response
): Promise<Response<any, Record<string, any>> | undefined> {
	try {
		const allusers = await prisma.users.findMany();

		if (!allusers.length) {
			return res
				.status(200)
				.send(messageBody(allusers, MessagesUsers.notSuccessful, true));
		} else {
			return res
				.status(200)
				.send(messageBody(allusers, MessagesUsers.successful, true));
		}
	} catch (error) {
		return res.status(400).send(messageBody(null, MessagesUsers.error, true));
		console.log(error);
	}
}

async function addUser(req:Request, res: Response) {
	const user = req.body
	res.setHeader('Content-Type', 'application/json');

	try {
		const userIfExist = await prisma.users.findFirst({
			where: {
				cellphone_user: user.cellphone_user
			}
		}).catch(err => {
			console.log('Error',err)
		})
		if(!userIfExist){
			await prisma.users.create({
				data:user
			}).catch(console.log); 
			
			res.status(200).json(messageBody(null,MessagesUsers.created,true))
		}
		res.status(400).json(messageBody(null,'el usuario ya existe',true))

	} catch (error) {
		res.status(401).json(messageBody(error,MessagesUsers.error,false))
	}
}

async function updateUser(req:Request, res:Response) {
	
	
	try {
		
		const result = await prisma.users.update({
			where: {
				id: parseInt('' + req.body.id)
			},
			data: req.body
		})
		res.status(200).json(messageBody(result,MessagesUsers.updated,true))
	} catch (error) {
		res.status(400).json(messageBody(error,MessagesUsers.error,false))
	}
}

async function deleteUser(req:Request,res:Response) {
	const id = req.query.id?.toString() ?? ''
	console.log(id)
	try {
		

		const result = await prisma.users.delete({
			where: {
				id: parseInt(id)
			}

		})

		await prisma.accounts.deleteMany({
			where: {
				id:  parseInt(id)
			}

		})
		
		res.status(200).json(messageBody(result,MessagesUsers.deleted,true))
	} catch (error) {
		res.status(400).json(messageBody(error,MessagesUsers.error,false))
	}
}
export { getUsers, addUser, updateUser, deleteUser};
