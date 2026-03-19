export const ACCOUNT_INPUT_TEMPLATE = [
	'correo: ejemplo@correo.com',
	'contraseña: 123456',
	'perfil: 2',
	'pin: 4444',
	'vence: 26/12/2025',
].join('\n');

export const ACCOUNT_FORMAT_MESSAGE = [
	'✉️ Envía los datos con este formato:',
	'',
	ACCOUNT_INPUT_TEMPLATE,
].join('\n');

export const CONTACT_INPUT_TEMPLATE = '📞 3001234567 📧 cliente@ejemplo.com';

export const BOT_COMMANDS = [
	{ command: 'crear_cuenta', description: 'Crear una nueva cuenta' },
	{ command: 'actualizar_cuenta', description: 'Actualizar una cuenta existente' },
	{ command: 'garantia', description: 'Actualizar una cuenta por garantía' },
	{ command: 'buscar_cuentas', description: 'Buscar cuentas por correo o cliente' },
	{ command: 'proximos_vencer', description: 'Ver cuentas próximas a vencer' },
	{ command: 'cancelar', description: 'Cancelar el proceso actual' },
	{ command: 'ayuda', description: 'Mostrar los comandos disponibles' },
];

export const BOT_MESSAGES = {
	categoryPrompt: '📂 Ingresa la *categoría* de la cuenta:',
	cancelled: '❌ Proceso cancelado. Puedes iniciar un nuevo proceso cuando desees.',
	searchPrompt: '🔍 Por favor ingresa el correo o nombre del cliente para buscar las cuentas:',
	searchingUpcoming: '🔍 Buscando cuentas próximas a vencer...',
	warrantyPrompt: '✉️ Por favor envía el correo de la cuenta para extender la garantía o actualizar los datos:',
	updateEmailPrompt: '✉️ Ingresa por favor el correo de la cuenta a actualizar.',
	updateDataPrompt: `✏️ Ahora envía la información de la cuenta a actualizar con este formato:\n\n${ACCOUNT_FORMAT_MESSAGE}`,
	warrantyExtensionPrompt: '✉️ Por favor envía el correo de la cuenta para extender la garantía por 30 días adicionales:',
	clientNamePrompt: '👤 Ahora dime el nombre del cliente al que pertenece la cuenta:',
	userContactPrompt: [
		'👤 No encuentro a este cliente.',
		'Por favor envía su teléfono y correo así:',
		'',
		CONTACT_INPUT_TEMPLATE,
	].join('\n'),
	userContactInvalid: `⚠ Formato inválido. Envía el teléfono y correo así:\n\n${CONTACT_INPUT_TEMPLATE}`,
	accountFormatInvalid: `⚠ Formato no reconocido. Asegúrate de enviar algo como:\n\n${ACCOUNT_FORMAT_MESSAGE}`,
	accountDataMissing: '❌ Hubo un problema con los datos previos. Reinicia con /crear_cuenta.',
	accountUpdateMissing: '❌ No se encontró la cuenta a actualizar. Repite /actualizar_cuenta.',
	accountUpdateNotFound: '❌ No se encontró ninguna cuenta con el correo indicado.',
	categoryNotFound: '❌ Categoría no encontrada. Intenta nuevamente.',
	searchNoResults: '❌ No se encontraron cuentas que coincidan con la búsqueda. Intenta nuevamente.',
	needClientName: '⚠ Necesito el nombre del cliente. Intenta de nuevo:',
	warrantyFormatInvalid: '⚠️ No se pudo detectar el correo anterior. Asegúrate de seguir el formato correcto.',
	accountNotFoundByEmail: (email: string) => `❌ No se encontró ninguna cuenta con el correo *${email}*.`,
	accountUpdated: (email: string) => `✅ La cuenta *${email}* ha sido actualizada exitosamente.`,
	accountCreated: (clientName: string) => `✅ Cuenta para *${clientName}* registrada con éxito.`,
} as const;
