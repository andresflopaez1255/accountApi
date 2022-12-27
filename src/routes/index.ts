import express from 'express';
import { addAccount, deleteAccount, getAllAccounts, updateAccount } from '../controllers/accounts.controllers';
import { getCategories } from '../controllers/categories.controllers';
import {addUser, deleteUser, getUsers, updateUser } from '../controllers/users.controllers';
import Routes from './routes.names';

const router = express.Router();
const jsonParser = express.json()
//user endpoints
/**
 * @swagger
 * components:
 *    schema:
 *      User:
 *        type: object
 *        properties:
 *           id: 
 *            type: number
 *           name_user:
 *            type: string
 *           email_user:
 *            type: string
 *           cellphone_user:
 *            type: string
 *         
 */
/**
 * @swagger
 * /users:
 *   get:
 *     summary: Returns all users
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: the list of the users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#components/schema/User'
 *               
 *                 
 */

router.get(Routes.users, getUsers);


/**
 * @swagger
 * /new_user:
 *   post:
 *    summary: create new user
 *    tags: [Users]
 *    requestBody:
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            items:
 *             
 *    responses:
 *     200:
 *      description: create new user
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *      400:
 *       description: user already exists
 *       content:
 *         application/json:
 *           schema:
 *            type: object
 *            
 *    
 * 
 * 
 * 
 * 
 * 
  */
router.post(Routes.addUser, jsonParser,addUser)
/**
 * @swagger
 * /update_user:
 *   post:
 *    summary: update specified user
 *    tags: [Users]
 *    requestBody:
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *             id:
 *               type: number
 *             name_user: 
 *               type: string
 *             cellphone_user: 
 *               type: string
 *             email_user: 
 *               type: string
 *    responses:
 *     200:
 *      description: update user information successfully
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *      400:
 *       description: user already exists
 *       content:
 *         application/json:
 *           schema:
 *            type: object
 *            
 *    
 * 
 * 
 * 
 * 
 * 
  */
router.post(Routes.updateUser, jsonParser,updateUser)
router.delete(Routes.deleteUser, deleteUser);

// categories endpoints
router.get(Routes.categories, getCategories);
//accounts endpoints
router.get(Routes.accounts, getAllAccounts);
router.post(Routes.addAccount,jsonParser, addAccount)
router.get(`${Routes.deleteAccount}/:id`,deleteAccount)
router.post(Routes.updateAccount,jsonParser, updateAccount)
export default router;
