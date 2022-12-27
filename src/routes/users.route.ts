
import Routes from './routes.names';
import express from 'express';
import { addUser, deleteUser, getUsers, updateUser } from '../controllers/users.controllers';

const router = express.Router();
const jsonParser = express.json()

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
 *               
 *                 
 */

router.get(Routes.users, getUsers);
router.post(Routes.addUser, jsonParser,addUser)
router.put(Routes.updateUser, jsonParser,updateUser)
router.delete(Routes.deleteUser, deleteUser);