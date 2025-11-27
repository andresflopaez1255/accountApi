/* eslint-disable prefer-const */
/* eslint-disable no-useless-escape */

import { Account } from '../Interfaces';



function formatAccountMessage(data: any) {

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

/**
 * Extrae correo, clave, perfil y vencimiento desde una plantilla de texto.
 * Devuelve { email, password, profile, rawExpire, expireISO, expireDate }
 */
function parseAccountText(text:string) {
	if (typeof text !== 'string') return null;

	// Limpiar asteriscos y retornos de carro
	const cleaned = text.replace(/\*/g, '').replace(/\r/g, '');

	// Servicio (opcional)
	const serviceMatch = cleaned.match(/(?:♥|👑|♻️)?\s*([A-Z0-9ÁÉÍÓÚÑ\s\-]+?)\s+\d+\s*pantill?a?/i);
	const service = serviceMatch ? serviceMatch[1].trim() : null;

	// Email
	const emailMatch = cleaned.match(/Correo\s*[:\-]?\s*([^\r\n]+)/i);
	const email = emailMatch ? emailMatch[1].trim() : null;

	// Clave
	const passwordMatch = cleaned.match(/Clave\s*[:\-]?\s*([^\r\n]+)/i);
	const password = passwordMatch ? passwordMatch[1].trim() : null;

	// Perfil (opcional)
	let profile = null;
	const perfilMatch = cleaned.match(/Perfil[^\r\n]*#?\s*(p\d+[a-z0-9]*)/i);
	if (perfilMatch) profile = perfilMatch[1].trim();

	// PIN (opcional)
	let pin = null;
	const pinMatch = cleaned.match(/pin\s*[:#]?\s*(\d{3,8})/i);
	if (pinMatch) pin = pinMatch[1].trim();

	// Fecha de vencimiento
	const venceMatch = cleaned.match(/Vence\s*[:\-]?\s*([0-9]{1,2}\/[0-9]{1,2}\/[0-9]{2,4})/i);
	const rawExpire = venceMatch ? venceMatch[1].trim() : null;

	let expireISO = null;
	let expireDate = null;
	if (rawExpire) {
		const parts = rawExpire.split('/').map(s => s.trim());
		if (parts.length === 3) {
			let [d, m, y] = parts;
			if (y.length === 2) y = '20' + y;
			const iso = `${y}-${m.padStart(2,'0')}-${d.padStart(2,'0')}`;
			const parsed = new Date(iso + 'T00:00:00Z');
			if (!isNaN(parsed.getTime())) {
				expireISO = iso;
				expireDate = parsed;
			}
		}
	}

	return { service, email, password, profile, pin, rawExpire, expireISO, expireDate };
}

function updateTemplateFromObject(template:string, data:Account) {
	let updated = template;

	// Email
	if (data.email_account) {
		updated = updated.replace(/(Correo\s*[:\-]?\s*)([^\r\n]+)/i, `$1${data.email_account}`);
	}

	// Clave
	if (data.pass_account) {
		updated = updated.replace(/(Clave\s*[:\-]?\s*)([^\r\n]+)/i, `$1${data.pass_account}`);
	}

	// Perfil (solo si no está vacío)
	if (data.name_profile && data.name_profile !== '') {
		if (/Perfil[^\r\n]*/i.test(updated)) {
			updated = updated.replace(/(Perfil[^\r\n]*#?\s*)([^\s*]+)/i, `$1${data.name_profile}`);
		} else {
			// Si no hay línea de perfil, agregar antes de "Vence"
			updated = updated.replace(/(\*Vence.*\r?\n)/i, `*Perfil # ${data.name_profile}*\n$1`);
		}
	}

	// PIN (solo si no está vacío)
	if (data.code_profile !== undefined && String(data.code_profile) !== '') {
		const pinStr = String(data.code_profile);
		if (/pin\s*[:#]?\s*\d{3,8}/i.test(updated)) {
			updated = updated.replace(/(pin\s*[:#]?\s*)(\d{3,8})/i, `$1${pinStr}`);
		} else if (/Perfil/i.test(updated)) {
			updated = updated.replace(/(Perfil[^\r\n]*)/i, `$1 pin ${pinStr}`);
		} else {
			// Si no hay perfil ni pin, agregar antes de "Vence"
			updated = updated.replace(/(\*Vence.*\r?\n)/i, `*PIN ${pinStr}*\n$1`);
		}
	}

	// Fecha de vencimiento
	if (data.expiration_date) {
		updated = updated.replace(/(Vence\s*[:\-]?\s*)([0-9]{1,2}\/[0-9]{1,2}\/[0-9]{2,4})/i, `Vence ${data.expiration_date}`);
	}

	return updated;
}




export { formatAccountMessage, parseAccountText,updateTemplateFromObject };