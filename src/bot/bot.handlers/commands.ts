import type { Telegraf } from 'telegraf';
import { getAccountsWithDateExpitarion } from '../../controllers/accounts.controllers';
import { BOT_MESSAGES } from '../bot.constants';
import { resetSession, setSession } from '../bot.session';
import { BotStep } from '../bot.types';
import { buildHelpMessage, formatAccountsListMessage, replyMarkdown } from '../bot.utils';

type BotCommandHandler = Parameters<Telegraf['command']>[1];

const createFlowCommand = (step: BotStep, message: string): BotCommandHandler => {
	return async (ctx) => {
		setSession(ctx.chat.id, { step });
		await replyMarkdown(ctx, message);
	};
};

export const registerCommands = (bot: Telegraf): void => {
	bot.command('crear_cuenta', createFlowCommand(BotStep.WAITING_CATEGORY, BOT_MESSAGES.categoryPrompt));
	bot.command('garantia', createFlowCommand(BotStep.WAITING_ACCOUNT_GARANTY, BOT_MESSAGES.warrantyPrompt));
	bot.command('buscar_cuentas', createFlowCommand(BotStep.WAITING_SEARCH_ACCOUNT, BOT_MESSAGES.searchPrompt));
	bot.command(
		'actualizar_cuenta',
		createFlowCommand(BotStep.WAITING_EMAIL_TO_UPDATE_ACCOUNT, BOT_MESSAGES.updateEmailPrompt)
	);

	bot.command('cancelar', async (ctx) => {
		resetSession(ctx.chat.id);
		await replyMarkdown(ctx, BOT_MESSAGES.cancelled);
	});

	bot.command('proximos_vencer', async (ctx) => {
		await replyMarkdown(ctx, BOT_MESSAGES.searchingUpcoming);

		const accounts = await getAccountsWithDateExpitarion();
		if (accounts.length === 0) {
			await replyMarkdown(ctx, BOT_MESSAGES.searchNoResults);
			resetSession(ctx.chat.id);
			return;
		}

		await replyMarkdown(ctx, formatAccountsListMessage(accounts));
		resetSession(ctx.chat.id);
	});

	bot.command('ayuda', async (ctx) => {
		await replyMarkdown(ctx, buildHelpMessage());
	});
};
