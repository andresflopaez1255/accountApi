import messagebird from 'messagebird';
import { infoMessage } from '../Interfaces';

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const sender = messagebird(process.env.TOKEN!)
console.log(process.env.TOKEN)
const sendMessage = (info:infoMessage) => {
	const params = {
		originator: 'TestMessage',
		recipients: [info.cellphone_user],
		body: `Hola ${info.name_user} te escribimos desde AF Entretimiento\n \nQueremos recordarte que tu servicio de ${info.category} vence el dia ${info.expiration_date}.\n\nSi deseas renovarla o adquierir alguno denuestros servicios comunicate a +57 312 874 4662 😁`,
	};

	sender.messages.create(params, function (err, response) {
		if (err) {
			return console.log(err);
		}
		console.log(response);
	});
	
};



export default sendMessage;
