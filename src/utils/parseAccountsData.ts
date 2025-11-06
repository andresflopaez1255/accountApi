function parseAccountMessage(message: string) {
	const lines = message.split('\n');
	const data:any = {};

	for (const line of lines) {
		const [key, value] = line.split(':').map(s => s.trim());
		if (!key || !value) continue;

		switch (key.toLowerCase()) {
		case 'correo': data.email = value; break;
		case 'contraseña': data.password = value; break;
		case 'perfil': data.profile = value; break;
		case 'pin': data.pin = value; break;
		case 'vence': data.expiration = value; break;
		case 'cliente': data.username = value; break;
		}
	}

	return data;
}

function parseDataUser(message:string) {
	const lines = message.split('\n');
	const data:any = {};

	
		
		

	data.name_user = lines[0].trim();
	data.cellphone_user = lines[1].trim()	;


	return data;
	
}



function formatAccountMessage(data:any) {
	
	return (
	
		`👤 *Usuario:* ${data.usuario}\n` +
    `🔑 *Clave:* ${data.clave}\n` +
    `📺 *Perfil:* ${data.perfil}\n` +
    `📌 *PIN:* ${data.pin}\n` +
    `⏰ *Vence:* ${data.vence}\n\n` +
    '📜 *Reglas para mantener la garantía:*\n' +
    '⚠ Puedes usar solo (1) dispositivo\n' +
    '⚠ Si se usa en más dispositivos puedes perder la garantía, sin derecho a devolución de dinero.\n\n' +
    '☝😊 De esta manera podemos seguir brindándote el mejor servicio'
	);
}


export { parseAccountMessage, parseDataUser, formatAccountMessage };