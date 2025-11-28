import type { Telegraf } from 'telegraf';
import { BotStep } from '../bot.types';
import { resetSession, setSession } from '../bot.session';
import { replyMarkdown } from '../bot.utils';
import { getAccountsWithDateExpitarion } from '../../controllers/accounts.controllers';

export const registerCommands = (bot: Telegraf): void => {
	// Comando para iniciar creación
	bot.command('crear_cuenta', async (ctx) => {
		setSession(ctx.chat.id, { step: BotStep.WAITING_CATEGORY });
		await replyMarkdown(ctx, '📂 Ingresa la *categoría* de la cuenta:');
	});

	bot.command('garantia', async (ctx) => {
		setSession(ctx.chat.id, { step: BotStep.WAITING_ACCOUNT_GARANTY });
		await ctx.reply('✉️ Por favor envía el correo de la cuenta para extender la garantía o actualizar los datos:');
	});

	bot.command('cancelar', async (ctx) => {
		resetSession(ctx.chat.id);
		await ctx.reply('❌ Proceso cancelado. Puedes iniciar un nuevo proceso cuando desees.');
	});

	bot.command('buscar_cuentas', async (ctx) => {
		setSession(ctx.chat.id, { step: BotStep.WAITING_SEARCH_ACCOUNT });
		await ctx.reply('🔍 Por favor ingresa el correo o nombre del cliente para buscar las cuentas:');
	});

	bot.command('proximos_vencer', async (ctx) => {
		await ctx.reply('🔍 Buscando cuentas proximas a vencer');

		const data = await getAccountsWithDateExpitarion()
		let responseMessage = '🔍 *Cuentas encontradas:*\n\n';
		data.forEach((account, index) => {
			console.log(account)
			responseMessage += `${index + 1}. Usuario: *${account.email_account}*\n   Perfil: *${account.name_profile}*\n   Vence: *${account.expiration_date}*\n\n`;
		});
		await ctx.reply(responseMessage, { parse_mode: 'Markdown' });
		resetSession(ctx.chat.id); // limpiar sesión
	});

	bot.command('actualizar_cuenta', async (ctx) => {
		setSession(ctx.chat.id, { step: BotStep.WAITING_EMAIL_TO_UPDATE_ACCOUNT });
		await ctx.reply('Ingresa por favor el correo de la cuenta a actualizar')
	});
};

