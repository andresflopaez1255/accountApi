import { SupportedStreamingService } from './botCodex.types';

export const BOT_CODEX_PROFILE_PLACEHOLDER = 'CUENTA_COMPLETA';

export const BOT_CODEX_ACCOUNT_TEMPLATES = {
	fullAccount: [
		'servicio: netflix',
		'tipo: cuenta',
		'cliente: Juan Perez',
		'telefono: 3001234567',
		'correo_cliente: juan@email.com',
		'correo_cuenta: cuenta@stream.com',
		'clave: 123456',
		'vence: 26/12/2025',
	].join('\n'),
	profileAccount: [
		'servicio: disney',
		'tipo: perfil',
		'cliente: Maria Perez',
		'telefono: 3001234567',
		'correo_cliente: maria@email.com',
		'correo_cuenta: disney@stream.com',
		'clave: abc123',
		'perfil: infantil1',
		'pin: 4455',
		'vence: 26/12/2025',
	].join('\n'),
};

export const BOT_CODEX_SUPPORTED_SERVICES_LABEL = 'Netflix, Amazon, Disney, Crunchyroll';

export const BOT_CODEX_SERVICE_ALIASES: Record<string, SupportedStreamingService> = {
	netflix: 'Netflix',
	amazon: 'Amazon',
	amazonprime: 'Amazon',
	'amazon prime': 'Amazon',
	primevideo: 'Amazon',
	'prime video': 'Amazon',
	disney: 'Disney',
	disneyplus: 'Disney',
	'disney plus': 'Disney',
	crunchyroll: 'Crunchyroll',
	chruncryroll: 'Crunchyroll',
	crunchiroll: 'Crunchyroll',
};
