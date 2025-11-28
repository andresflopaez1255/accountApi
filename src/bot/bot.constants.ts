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
	{ command: 'crear_cuenta', description: 'Crear una nueva cuenta' },
	{ command: 'actualizar_cuenta', description: 'Ver todas las cuentas' },
	{ command: 'listar_cuentas', description: 'Ver todas las cuentas' },
	{ command: 'garantia', description: 'actualizar cuenta  por garantia' },
	{ command: 'buscar_cuentas', description: 'Buscar cuentas por correo o cliente' },
	{ command: 'proximos_vencer', description: 'Proximas cuentas a vencer' },
	{ command: 'cancelar', description: 'Cancelar el proceso actual' },
	{ command: 'ayuda', description: 'Mostrar los comandos disponibles' },
];

