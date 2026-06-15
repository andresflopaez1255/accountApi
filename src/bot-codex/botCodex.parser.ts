import { BOT_CODEX_PROFILE_PLACEHOLDER, BOT_CODEX_SERVICE_ALIASES } from './botCodex.constants';
import {
	BotCodexAccountType,
	BotCodexParsedInput,
	SupportedStreamingService,
} from './botCodex.types';

const readField = (text: string, patterns: RegExp[]): string | null => {
	for (const pattern of patterns) {
		const value = text.match(pattern)?.[1]?.trim();
		if (value) {
			return value;
		}
	}

	return null;
};

const normalizeServiceKey = (value: string): string => {
	return value
		.toLowerCase()
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '')
		.replace(/[^a-z]/g, '');
};

export const normalizeStreamingService = (value: string): SupportedStreamingService | null => {
	const normalized = BOT_CODEX_SERVICE_ALIASES[normalizeServiceKey(value)];
	return normalized || null;
};

export const normalizeAccountType = (value: string): BotCodexAccountType | null => {
	const normalized = value.trim().toLowerCase();

	if (['cuenta', 'completa', 'full', 'full_account'].includes(normalized)) {
		return 'FULL_ACCOUNT';
	}

	if (['perfil', 'profile', 'profile_account'].includes(normalized)) {
		return 'PROFILE_ACCOUNT';
	}

	return null;
};

export const parseBotCodexInput = (input: string): BotCodexParsedInput | null => {
	if (typeof input !== 'string' || !input.trim()) {
		return null;
	}

	const text = input.replace(/\r/g, '').trim();
	const rawService = readField(text, [/servicio\s*:\s*([^\n]+)/i]);
	const rawType = readField(text, [/tipo\s*:\s*([^\n]+)/i]);
	const clientName = readField(text, [/cliente\s*:\s*([^\n]+)/i]);
	const phone = readField(text, [/telefono\s*:\s*([^\n]+)/i, /tel[eé]fono\s*:\s*([^\n]+)/i]);
	const userEmail = readField(text, [/correo_cliente\s*:\s*([^\n]+)/i, /email_cliente\s*:\s*([^\n]+)/i]);
	const accountEmail = readField(text, [/correo_cuenta\s*:\s*([^\n]+)/i, /correo\s*:\s*([^\n]+)/i]);
	const accountPassword = readField(text, [/clave\s*:\s*([^\n]+)/i, /contrase(?:ñ|n)a\s*:\s*([^\n]+)/i]);
	const profileName = readField(text, [/perfil\s*:\s*([^\n]+)/i]) || BOT_CODEX_PROFILE_PLACEHOLDER;
	const pin = readField(text, [/pin\s*:\s*([^\n]+)/i]) || '0';
	const expirationDate = readField(text, [/vence\s*:\s*([^\n]+)/i]);

	if (!rawService || !rawType || !clientName || !accountEmail || !accountPassword || !expirationDate) {
		return null;
	}

	const service = normalizeStreamingService(rawService);
	const accountType = normalizeAccountType(rawType);

	if (!service || !accountType) {
		return null;
	}

	if (accountType === 'PROFILE_ACCOUNT' && profileName === BOT_CODEX_PROFILE_PLACEHOLDER) {
		return null;
	}

	return {
		service,
		accountType,
		user: {
			name: clientName,
			email: userEmail || undefined,
			phone: phone ? phone.replace(/\s|-/g, '') : undefined,
		},
		accountEmail,
		accountPassword,
		profileName,
		pin,
		expirationDate,
	};
};
