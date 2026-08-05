import express from 'express';
import {
	addAccount,
	deleteAccount,
	getAllAccounts,
	searchAccount,
	updateAccount,
} from '../controllers/accounts.controllers';
import { vendorLogIn, vendorRecoveryPass, vendorRegistration } from '../controllers/auth.controllers';
import { addCategory, getCategories } from '../controllers/categories.controllers';
import { updateCategory, deleteCategory } from '../controllers/categories.controllers';
import {
	addUser,
	deleteUser,
	getUsers,
	searchUsers,
	updateUser,
} from '../controllers/users.controllers';
import Routes from './routes.names';
import { requireAuth } from '../middlewares/auth.middleware';
import { validate, validateAccount, validateCategory, validateUser, validateVendorLogin, validateVendorRegistration } from '../middlewares/validation.middleware';
import { addIncident, addProduct, addProvider, addSale, deleteIncident, deleteProduct, deleteProvider, deleteSale, getBusinessSummary, getClientHistory, getIncidents, getProducts, getProviders, getSales, updateIncident, updateProduct, updateProvider, updateSale } from '../controllers/operations.controllers';

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

router.get(Routes.users, requireAuth, getUsers);

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
router.post(Routes.addUser, requireAuth, jsonParser, validate(validateUser), addUser);
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
router.post(Routes.updateUser, requireAuth, jsonParser, validate(validateUser), updateUser);
/**
 * @swagger
 * /delete_user:
 *   delete:
 *    summary: delete a user
 *    parameters:
 *     - in: query
 *       name: id
 *       schema:
 *        type: string
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
router.delete(`${Routes.deleteUser}`, requireAuth, deleteUser);
router.get(Routes.searchUser, requireAuth, searchUsers);

// generate docs for categories endpoints

/**
 * @swagger
 * /categories:
 *   get:
 *     summary: Returns all categories
 *     tags: [Categories]
 *     responses:
 *       200:
 *         description: the list of the categories
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                $ref: '#components/schemas/Response'
 *               
 *
 *
 */

router.get(Routes.categories, requireAuth, getCategories);

router.post(Routes.addCategory, requireAuth, jsonParser, validate(validateCategory), addCategory);
router.post(Routes.updateCategory, requireAuth, jsonParser, validate(validateCategory), updateCategory);
router.delete(Routes.deleteCategory, requireAuth, deleteCategory);

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
router.get(Routes.accounts, requireAuth, getAllAccounts);
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
router.post(Routes.addAccount, requireAuth, jsonParser, validate(validateAccount), addAccount);
/**
 * @swagger
 * /delete_account:
 *   delete:
 *    summary: delete a user
 *    parameters:
 *     - in: query
 *       name: id
 *       schema:
 *        type: string
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
router.delete(`${Routes.deleteAccount}`, requireAuth, deleteAccount);

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
router.post(Routes.updateAccount, requireAuth, jsonParser, validate(validateAccount), updateAccount);
router.get(Routes.searchAccount, requireAuth, searchAccount);
router.post(Routes.register_vendors, jsonParser, validate(validateVendorRegistration), vendorRegistration);
router.post(Routes.logIn_vendor, jsonParser, validate(validateVendorLogin), vendorLogIn);
router.post(Routes.recovery_vendors, jsonParser, vendorRecoveryPass);

router.get(Routes.sales, requireAuth, getSales);
router.post(Routes.addSale, requireAuth, jsonParser, addSale);
router.post(Routes.updateSale, requireAuth, jsonParser, updateSale);
router.delete(Routes.deleteSale, requireAuth, deleteSale);
router.get(Routes.providers, requireAuth, getProviders);
router.post(Routes.addProvider, requireAuth, jsonParser, addProvider);
router.post(Routes.updateProvider, requireAuth, jsonParser, updateProvider);
router.delete(Routes.deleteProvider, requireAuth, deleteProvider);
router.get(Routes.incidents, requireAuth, getIncidents);
router.post(Routes.addIncident, requireAuth, jsonParser, addIncident);
router.post(Routes.updateIncident, requireAuth, jsonParser, updateIncident);
router.delete(Routes.deleteIncident, requireAuth, deleteIncident);
router.get(Routes.products, requireAuth, getProducts);
router.post(Routes.addProduct, requireAuth, jsonParser, addProduct);
router.post(Routes.updateProduct, requireAuth, jsonParser, updateProduct);
router.delete(Routes.deleteProduct, requireAuth, deleteProduct);
router.get(Routes.businessSummary, requireAuth, getBusinessSummary);
router.get(Routes.clientHistory, requireAuth, getClientHistory);

export default router;
