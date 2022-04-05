'use strict';

import express,{Express} from 'express';
import morgan from 'morgan';
import router from './routes';
import cron from 'node-cron'
import { getAccountsWithDate } from './controllers/accounts.controllers';
import sendMessage from './controllers/messages.controller';
import { infoMessage } from './Interfaces';
import 'dotenv/config'
/* import { getAccountsWithDate } from './controllers/accounts.controllers';
 */const app:Express = express();



/** Logging */
router.use(morgan('dev'));
/** Parse the request */
router.use(express.urlencoded({ extended: false }));
/** Takes care of JSON data */
router.use(express.json());

/** RULES OF OUR API */
router.use((req, res, next) => {
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


app.use('/', router)

app.get('/', (req, res) => {
	res.send('hola...');
});

app.listen(process.env.PORT,()=>{
	console.log(`Example app listening on port ${process.env.PORT}`)
})

cron.schedule('00 19 * * *', async ()=>{
	const result = await getAccountsWithDate()

	if(result.length==0){
		return
	}
	result.map((info:infoMessage)=>{
		sendMessage(info)
	})
	
	console.log(result)
})