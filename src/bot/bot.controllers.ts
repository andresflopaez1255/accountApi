import { Telegraf } from 'telegraf';
import type { Express } from 'express';
import { registerCommands } from './bot.handlers/commands';
import { handleTextMessage } from './bot.handlers/textHandlers';
import { getSession } from './bot.session';
import { BOT_COMMANDS } from './bot.constants';

export const managerBotController = async (_app: Express) => {
	void _app;
	const token = process.env.BOT_TOKEN;
	if (!token) {
		console.warn('Telegram bot disabled: BOT_TOKEN is not configured.');
		return;
	}
	const bot = new Telegraf(token);
	const allowedChats = (process.env.BOT_ALLOWED_CHAT_IDS || '').split(',').map((value) => value.trim()).filter(Boolean);
	bot.use(async (ctx, next) => {
		if (allowedChats.length && (!ctx.chat || !allowedChats.includes(String(ctx.chat.id)))) {
			if ('reply' in ctx) await ctx.reply('⛔ No tienes autorización para usar este bot.');
			return;
		}
		return next();
	});
	const webhookPath = `/bot${bot.secretPathComponent()}`;
	_app.use(bot.webhookCallback(webhookPath));

	const publicUrl = process.env.BOT_WEBHOOK_URL;
	try {
		if (publicUrl) await bot.telegram.setWebhook(`${publicUrl.replace(/\/$/, '')}${webhookPath}`);
		console.log(`🤖 Telegram webhook path configured at ${webhookPath}`);
	} catch (error) {
		console.error('Telegram webhook could not be configured. Check BOT_TOKEN and BOT_WEBHOOK_URL.', error);
		return;
	}



	// Registrar todos los comandos
	registerCommands(bot);

	// Manejar mensajes de texto
	bot.on('text', async (ctx): Promise<void> => {
		const session = getSession(ctx.chat.id);

		if (!session) return; // si no está en flujo, ignorar

		await handleTextMessage(ctx, session);
	});

	// Configurar comandos del bot
	try {
		await bot.telegram.setMyCommands(BOT_COMMANDS);
	} catch (error) {
		console.error('Telegram commands could not be configured. Check BOT_TOKEN.', error);
	}
}
