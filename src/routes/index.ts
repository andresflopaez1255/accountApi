import express from 'express';
import { addAccount, getAllAccounts } from '../controllers/accounts.controllers';
import { getCategories } from '../controllers/categories.controllers';
import {addUser, deleteUser, getUsers, updateUser } from '../controllers/users.controllers';
import Routes from './routes.names';

const router = express.Router();
const jsonParser = express.json()
//user endpoints
router.get(Routes.users, getUsers);
router.post(Routes.addUser, jsonParser,addUser)
router.put(Routes.updateUser, jsonParser,updateUser)
router.delete(Routes.deleteUser, deleteUser);

// categories endpoints
router.get(Routes.categories, getCategories);
//accounts endpoints
router.get(Routes.accounts, getAllAccounts);
router.post(Routes.addAccount,jsonParser, addAccount)

export default router;
