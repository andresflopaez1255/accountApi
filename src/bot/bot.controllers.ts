import { Telegraf } from 'telegraf';
import type { Express } from 'express';
import { registerCommands } from './bot.handlers/commands';
import { handleTextMessage } from './bot.handlers/textHandlers';
import { getSession } from './bot.session';
import { BOT_COMMANDS } from './bot.constants';

export const managerBotController = async (_app: Express) => {
	void _app;
	const bot = new Telegraf('7825975702:AAERv2QdXQhZm-9P0VAvwI0iRLjq05kKiHU');
	const webhookPath = `/bot${bot.secretPathComponent()}`;
	_app.use(bot.webhookCallback(webhookPath));

	const webhookUrl = `https://accountapi-8smd.onrender.com${webhookPath}`;
	bot.telegram.setWebhook(webhookUrl);

	console.log(`🤖 Webhook configurado en ${webhookUrl}`);



	// Registrar todos los comandos
	registerCommands(bot);

	// Manejar mensajes de texto
	bot.on('text', async (ctx): Promise<void> => {
		const session = getSession(ctx.chat.id);

		if (!session) return; // si no está en flujo, ignorar

		await handleTextMessage(ctx, session);
	});

	// Configurar comandos del bot
	bot.telegram.setMyCommands(BOT_COMMANDS);
}
