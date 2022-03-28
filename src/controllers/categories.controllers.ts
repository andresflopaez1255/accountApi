import { Request, Response } from 'express';
import prisma from '../utils/dbClient';
import messageBody from '../utils/messageBody';
import { MessagesCategories } from '../utils/messages';



async function getCategories(_req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>  {
	try {
		const allCategories = await prisma.categories_account.findMany();
		
		if (!allCategories.length) {
			return res.status(200).send(messageBody(allCategories, MessagesCategories.notSuccessful, true));
		}else {
			return res.status(200).send(messageBody(allCategories, MessagesCategories.successful, true));

		}
	} catch (error) {
		return res.status(200).send(messageBody(null, MessagesCategories.error, true));
		console.log(error);
	}


}

async function addCategory(req:Request, res: Response) {
	const category = req.body
	try {
		const CategoryIfExist = prisma.users.findFirst({
			where: category.id
		})
		if(!CategoryIfExist){
			await prisma.categories_account.create({
				data:category
			}); 
			
			res.status(200).json(messageBody(null,MessagesCategories.created,true))
		}
		res.status(202).json(messageBody(null,'category if exist',false))
	} catch (error) {
		res.status(401).json(messageBody(error,MessagesCategories.error,false))
	}
}

async function updateCategory(req:Request, res:Response) {
	
	
	try {
		
		const result = await prisma.categories_account.update({
			where: {
				id: parseInt('' + req.query.id)
			},
			data: req.body
		})
		res.status(200).json(messageBody(result,MessagesCategories.updated,true))
	} catch (error) {
		res.status(400).json(messageBody(error,MessagesCategories.error,false))
	}
}

async function deleteCategory(req:Request,res:Response) {
	console.log( req.query.id)
	try {
		

		const result = await prisma.categories_account.delete({
			where: {
				id:  parseInt(''+req.query.id)
			}

		})

		
		res.status(200).json(messageBody(result,MessagesCategories.deleted,true))
	} catch (error) {
		res.status(400).json(messageBody(error,MessagesCategories.error,false))
	}
}

export {
	getCategories,
	addCategory,
	updateCategory,
	deleteCategory
}