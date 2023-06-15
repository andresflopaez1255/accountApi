import express from 'express';
import {
	addAccount,
	deleteAccount,
	getAllAccounts,
	updateAccount,
} from '../controllers/accounts.controllers';
import { vendorLogIn, vendorRecoveryPass, vendorRegistration } from '../controllers/auth.controllers';
import { addCategory, getCategories } from '../controllers/categories.controllers';
import {
	addUser,
	deleteUser,
	getUsers,
	updateUser,
} from '../controllers/users.controllers';
import Routes from './routes.names';

const router = express.Router();
const jsonParser = express.json();
//user endpoints
/**
 * @swagger
 * components:
 *    schemas:
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
 *     
 *      Response:
 *        type: object
 *        properties:
 *           message:
 *            type: string
 *           status:
 *            type: boolean
 *           data:
 *            type: array | null | object
 *           
 *      Account:
 *          type: object
 *          properties:
 *            id:
 *              type: number
 *            id_user:  
 *              type: number
 *            email_account:
 *              type: string
 *            pass_account:
 *              type: string
 *            name_profile:
 *              type: string
 *            code_profile:
 *              type: number
 *            id_category:
 *              type: number
 *            expiration_date:
 *              type: string
 *            name_user:
 *              type: string
 *            cellphone_user:
 *              type: string
 *            category:
 *              type: string
 * 
 *      NewAccount:
 *          type: object
 *          properties:
 *            id_user:  
 *              type: number
 *            email_account:
 *              type: string
 *            pass_account:
 *              type: string
 *            name_profile:
 *              type: string
 *            code_profile:
 *              type: number
 *            id_category:
 *              type: number
 *            expiration_date:
 *              type: string
 *            
 *           
 *             
 *          
 * 
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
 *                 $ref: '#components/schemas/User'
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
 *           $ref: '#components/schemas/User'
 *    responses:
 *     200:
 *      description: create new user
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#components/schemas/Response'
 *      400:
 *       description: user already exists
 *       content:
 *         application/json:
 *           schema:
 *            $ref: '#components/schemas/Response'
 * 
 *            
 *
 *
 *
 *
 *
 *
 *
 */
router.post(Routes.addUser, jsonParser, addUser);
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
 *            $ref: '#components/schemas/Response'
 *      400:
 *       description: user already exists
 *       content:
 *         application/json:
 *           schema:
 *            $ref: '#components/schemas/Response'
 *                    
 *                
 * 
  */
router.post(Routes.updateUser, jsonParser, updateUser);
/**
 * @swagger
 * /delete_user:
 *   delete:
 *    summary: delete a user
 *    parameters:
 *     - in: query
 *       name: id
 *       schema:
 *        type: integer
 *       required: true
 *       
 *       
 *    tags: [Users]
 *    
 *    responses:
 *     200:
 *      description: delete a user successfully
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#components/schemas/Response'
 *      400:
 *       description: user already exists
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#components/schemas/Response'
 *                    
 *                
 * 
  */
router.delete(`${Routes.deleteUser}`, deleteUser);

// categories endpoints
router.get(Routes.categories, getCategories);

router.post(Routes.addCategory,jsonParser, addCategory, );

//accounts endpoints

/**
 * @swagger
 * /accounts:
 *   get:
 *     summary: Returns all accounts
 *     tags: [Accounts]
 *     responses:
 *       200:
 *         description: the list of the accounts
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                $ref: '#components/schemas/Account'
 *               
 *
 *
 */
router.get(Routes.accounts, getAllAccounts);
/**
 * @swagger
 * /new_account:
 *   post:
 *    summary: create new account for user
 *    tags: [Accounts]
 *    requestBody:
 *      content:
 *        application/json:
 *          schema:
 *           $ref: '#components/schemas/NewAccount'
 *    responses:
 *     200:
 *      description: created new account
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#components/schemas/Response'
 *      400:
 *       description: aacounts already exists
 *       content:
 *         application/json:
 *           schema:
 *            $ref: '#components/schemas/Response'
 * 
 *   
 *
 */
router.post(Routes.addAccount, jsonParser, addAccount);
/**
 * @swagger
 * /delete_account:
 *   delete:
 *    summary: delete a user
 *    parameters:
 *     - in: query
 *       name: id
 *       schema:
 *        type: integer
 *       required: true
 *       
 *       
 *    tags: [Accounts]
 *    
 *    responses:
 *     200:
 *      description: delete a account successfully
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#components/schemas/Response'
 *     
 *        
 */
router.delete(`${Routes.deleteAccount}`, deleteAccount);

/**
 * @swagger
 * /update_account:
 *   post:
 *    summary: create new account for user
 *    tags: [Accounts]
 *    requestBody:
 *      content:
 *        application/json:
 *          schema:
 *           $ref: '#components/schemas/Account'
 *    responses:
 *     200:
 *      description: created new account
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#components/schemas/Response'
 *      400:
 *       description: aacounts already exists
 *       content:
 *         application/json:
 *           schema:
 *            $ref: '#components/schemas/Response'
 * 
 *   
 *
 */
router.post(Routes.updateAccount, jsonParser, updateAccount);
router.post(Routes.register_vendors, jsonParser, vendorRegistration);
router.post(Routes.logIn_vendor, jsonParser, vendorLogIn);
router.post(Routes.recovery_vendors, jsonParser, vendorRecoveryPass);

export default router;
