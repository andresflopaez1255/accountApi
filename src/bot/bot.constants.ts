export const ACCOUNT_FORMAT_MESSAGE = [
	'✉️ Envía los datos una línea por campo:',
	'',
	'Correo: ejemplo@correo.com',
	'Clave: 123456',
	'Perfil: 2  (opcional, por defecto 1)',
	'PIN: 4444  (opcional)',
	'Vence: 04/09/2026',
	'Precio: 25000',
	'Costo: 10000  (opcional)',
].join('\n');

export const BOT_COMMANDS = [
	{ command: 'start', description: 'Abrir menú de operación' },
	{ command: 'crear_cuenta', description: 'Registrar una cuenta' },
	{ command: 'buscar_cuentas', description: 'Buscar una cuenta o cliente' },
	{ command: 'proximos_vencer', description: 'Ver vencimientos próximos' },
	{ command: 'cancelar', description: 'Cancelar el proceso actual' },
	{ command: 'ayuda', description: 'Mostrar el menú de ayuda' },
];
