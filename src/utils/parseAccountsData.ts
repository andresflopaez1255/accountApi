import { Account } from '../Interfaces';

type AccountMessageData = {
	usuario: string;
	clave: string;
	perfil: string;
	pin: string;
	vence: string;
};

type ParsedAccountData = {
	service: string | null;
	email: string | null;
	password: string | null;
	profile: string | null;
	pin: string | null;
	rawExpire: string | null;
	expireISO: string | null;
	expireDate: Date | null;
};

const cleanText = (text: string): string => text.replace(/\*/g, '').replace(/\r/g, '').trim();

const readField = (text: string, patterns: RegExp[]): string | null => {
	for (const pattern of patterns) {
		const value = text.match(pattern)?.[1]?.trim();
		if (value) {
			return value;
		}
	}

	return null;
};

const appendOptionalLine = (lines: string[], label: string, value: string): void => {
	if (value.trim()) {
		lines.push(`${label}${value}`);
	}
};

function formatAccountMessage(data: AccountMessageData): string {
	return [
		`👤 *Usuario:* ${data.usuario}`,
		`🔑 *Clave:* ${data.clave}`,
		`📺 *Perfil:* ${data.perfil}`,
		`📌 *PIN:* ${data.pin}`,
		`⏰ *Vence:* ${data.vence}`,
		'',
		'📜 *Reglas para mantener la garantía:*',
		'⚠ Puedes usar solo (1) dispositivo',
		'⚠ Si se usa en más dispositivos puedes perder la garantía, sin derecho a devolución de dinero.',
		'',
		'☝😊 De esta manera podemos seguir brindándote el mejor servicio',
	].join('\n');
}

function parseAccountText(text: string): ParsedAccountData | null {
	if (typeof text !== 'string') {
		return null;
	}

	const cleaned = cleanText(text);
	const serviceMatch = cleaned.match(/(?:♥|👑|♻️)?\s*([A-Z0-9ÁÉÍÓÚÑ\s\-]+?)\s+\d+\s*pantill?a?/i);
	const service = serviceMatch ? serviceMatch[1].trim() : null;

	const email = readField(cleaned, [
		/Correo\s*[:\-]?\s*([^\r\n]+)/i,
		/correo\s*[:\-]?\s*([^\r\n]+)/i,
	]);
	const password = readField(cleaned, [
		/Clave\s*[:\-]?\s*([^\r\n]+)/i,
		/contrase(?:ñ|n)a\s*[:\-]?\s*([^\r\n]+)/i,
	]);
	const profile = readField(cleaned, [
		/Perfil\s*#?\s*([^\s\r\n]+)/i,
		/perfil\s*[:\-]?\s*([^\s\r\n]+)/i,
	]);
	const pin = readField(cleaned, [/pin\s*[:#]?\s*(\d{3,8})/i]);
	const rawExpire = readField(cleaned, [
		/Vence\s*[:\-]?\s*([0-9]{1,2}\/[0-9]{1,2}\/[0-9]{2,4})/i,
		/vence\s*[:\-]?\s*([0-9]{1,2}\/[0-9]{1,2}\/[0-9]{2,4})/i,
	]);

	let expireISO: string | null = null;
	let expireDate: Date | null = null;

	if (rawExpire) {
		const parts = rawExpire.split('/').map((value) => value.trim());
		if (parts.length === 3) {
			let [first, second, year] = parts;
			const parsedFirst = parseInt(first, 10);
			const parsedSecond = parseInt(second, 10);
			const isDayFirst = parsedFirst > 12 && parsedSecond <= 12;
			const day = isDayFirst ? first : second;
			const month = isDayFirst ? second : first;

			if (year.length === 2) {
				year = `20${year}`;
			}

			const iso = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
			const parsed = new Date(`${iso}T00:00:00Z`);
			if (!isNaN(parsed.getTime())) {
				expireISO = iso;
				expireDate = parsed;
			}
		}
	}

	return { service, email, password, profile, pin, rawExpire, expireISO, expireDate };
}

function updateTemplateFromObject(template: string, data: Account): string {
	const parsedTemplate = parseAccountText(template);
	const lines = [
		`👤 *Usuario:* ${data.email_account || parsedTemplate?.email || ''}`,
		`🔑 *Clave:* ${data.pass_account || parsedTemplate?.password || ''}`,
	];
	const profile = data.name_profile || parsedTemplate?.profile || '';
	const pin = data.code_profile !== undefined ? String(data.code_profile) : parsedTemplate?.pin || '';
	const expiration = data.expiration_date || parsedTemplate?.rawExpire || '';

	appendOptionalLine(lines, '📺 *Perfil:* ', profile);
	appendOptionalLine(lines, '📌 *PIN:* ', pin === '0' ? '' : pin);
	appendOptionalLine(lines, '⏰ *Vence:* ', expiration);

	lines.push(
		'',
		'📜 *Reglas para mantener la garantía:*',
		'⚠ Puedes usar solo (1) dispositivo',
		'⚠ Si se usa en más dispositivos puedes perder la garantía, sin derecho a devolución de dinero.',
		'',
		'☝😊 De esta manera podemos seguir brindándote el mejor servicio'
	);

	return lines.join('\n');
}

export { formatAccountMessage, parseAccountText, updateTemplateFromObject };
