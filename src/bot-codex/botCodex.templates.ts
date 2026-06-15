import { BOT_CODEX_ACCOUNT_TEMPLATES, BOT_CODEX_SUPPORTED_SERVICES_LABEL } from './botCodex.constants';

export const buildBotCodexHelpMessage = (): string => {
	return [
		'Bot Codex registra cuentas de streaming y las enlaza con usuarios en Firebase.',
		`Servicios soportados: ${BOT_CODEX_SUPPORTED_SERVICES_LABEL}.`,
		'Comandos: /crear_cuenta, /buscar_cuentas, /actualizar_cuenta, /garantia, /proximos_vencer, /cancelar, /plantilla.',
		'Puedes enviar la plantilla completa o la plantilla corta del sistema para iniciar el registro.',
		'Para la plantilla corta, luego solo se pide servicio, tipo y cliente; si el cliente no existe, se solicita el teléfono.',
		'',
		'Plantilla para cuenta completa:',
		BOT_CODEX_ACCOUNT_TEMPLATES.fullAccount,
		'',
		'Plantilla para perfil específico:',
		BOT_CODEX_ACCOUNT_TEMPLATES.profileAccount,
	].join('\n');
};
