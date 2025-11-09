
import { messaging } from '../firebase';


const sendMessage = async (noti: any) => {

	const message = {

		topic: 'expiraciones',
		data: {
			title: 'Cuenta por vencer',
			body: 'Haz clic para contactar al cliente',
			service: noti.category_name,
			cellphone_user: noti.cellphone_user,
			email_account: noti.email_account
		},

	};

	try {
		await messaging.send(message);
		console.log(`✅ Notificación enviada: ${noti.email_account || noti.id}`);
	} catch (error) {
		console.error('❌ Error al enviar notificación:', error);
	}
}





export default sendMessage;
