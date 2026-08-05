export const ACCOUNT_FORMAT_MESSAGE = [
	'✉️ Envía los datos con este formato:',
	'',
	'correo: ejemplo@correo.com',
	'contraseña: 123456',
	'perfil: 2',
	'pin: 4444',
	'Vence: 26/12/2025',
].join('\n');

export const BOT_COMMANDS = [
	{ command: 'start', description: 'Abrir menú de operación' },
	{ command: 'crear_cuenta', description: 'Registrar una cuenta' },
	{ command: 'buscar_cuentas', description: 'Buscar una cuenta o cliente' },
	{ command: 'proximos_vencer', description: 'Ver vencimientos próximos' },
	{ command: 'cancelar', description: 'Cancelar el proceso actual' },
	{ command: 'ayuda', description: 'Mostrar el menú de ayuda' },
];
