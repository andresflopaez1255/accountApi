'use strict';

import express, { Express, Request, Response } from 'express';
import morgan from 'morgan';
import cors from 'cors';
import cron from 'node-cron';
import * as swaggerUi from 'swagger-ui-express';
import 'dotenv/config';

import router from './routes';
import { getAccountsWithDate } from './controllers/accounts.controllers';
import sendMessage from './controllers/messages.controller';
import { infoMessage } from './Interfaces';
import { specs } from './swagger';
import { managerBotController } from './controllers/bot.controllers';

const app: Express = express();

/* ----------------------------- CONFIGURACIONES ----------------------------- */
const PORT = process.env.PORT || 3001;

const corsOptions = {
	credentials: true,
	origin: ['http://localhost:3001', 'https://accountapi-8smd.onrender.com'],
};

/* ----------------------------- MIDDLEWARES --------------------------------- */
app.use(cors(corsOptions));
app.use(morgan('dev'));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

/* ------------------------------- CORS HEADERS ------------------------------ */
app.use((req: Request, res: Response, next) => {
	res.header('Access-Control-Allow-Origin', '*');
	res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');

	if (req.method === 'OPTIONS') {
		res.header('Access-Control-Allow-Methods', 'GET, PATCH, DELETE, POST');
		res.status(200).json({});
	}
	next();
});

/* ------------------------------- SWAGGER DOCS ------------------------------ */
// swaggerUi.serve devuelve un arreglo de middlewares, por eso usamos el spread + casting
app.use(
	'/api-docs',
	...(swaggerUi.serve as unknown as express.RequestHandler[]),
	swaggerUi.setup(specs)
);

/* ---------------------------------- RUTAS ---------------------------------- */
app.use('/', router);

app.get('/', (req: Request, res: Response) => {
	res.send('hola...');
});

/* ------------------------------- CRON JOBS --------------------------------- */
cron.schedule('00 07 * * *', async () => {
	const result = await getAccountsWithDate();
	if (result.length === 0) return;

	result.forEach((info: infoMessage) => {
		sendMessage(info);
	});

	console.log(result);
});

/* ------------------------------- SERVIDOR ---------------------------------- */
app.listen(PORT, () => {
	console.log(`✅ Server is running on port ${PORT}`);
});

managerBotController(app);