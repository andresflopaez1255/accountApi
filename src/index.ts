'use strict';
import swaggerUI from 'swagger-ui-express';
import express, {Express, Request, Response } from 'express';
import morgan from 'morgan';
import router from './routes';
import cron from 'node-cron'
import { getAccountsWithDate } from './controllers/accounts.controllers';
import sendMessage from './controllers/messages.controller';
import { infoMessage } from './Interfaces';
import cors from 'cors'
import 'dotenv/config'
import { specs } from './swagger';
/* import { getAccountsWithDate } from './controllers/accounts.controllers';
 */const app:Express = express();
const corsOptions = {
	credentials: true,
	origin: ['http://localhost:3001',"https://accountapi-8smd.onrender.com"] // Whitelist the domains you want to allow
};

app.use(cors(corsOptions));

const PORT = process.env.PORT || 3001; // Cambia a un puerto diferente
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

/** Logging */
router.use(morgan('dev'));
/** Parse the request */
router.use(express.urlencoded({ extended: false }));
/** Takes care of JSON data */
router.use(express.json());

/** RULES OF OUR API */
router.use((req:Request, res:Response, next) => {
	// set the CORS policy
	res.header('Access-Control-Allow-Origin', '*');
	// set the CORS headers
	res.header('Access-Control-Allow-Headers', 'origin, X-Requested-With,Content-Type,Accept, Authorization');
	// set the CORS method headers
	if (req.method === 'OPTIONS') {
		res.header('Access-Control-Allow-Methods', 'GET PATCH DELETE POST');
		return res.status(200).json({});
	}
	next();
	return true;
});
app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(specs));


app.use('/', router)

app.get('/', (req:Request, res:Response) => {
	res.send('hola...');
});



cron.schedule('00 07 * * *', async ()=>{
	const result = await getAccountsWithDate()

	if(result.length==0){
		return
	}
	result.map((info:infoMessage)=>{
		sendMessage(info)
	})
	
	console.log(result)
})

