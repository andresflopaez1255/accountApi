import { Markup, type Context, type Telegraf } from 'telegraf';
import { BotStep } from '../bot.types';
import { resetSession, setSession } from '../bot.session';
import { db } from '../../firebase';
import { getAccountsWithDateExpitarion } from '../../controllers/accounts.controllers';

const menu = Markup.inlineKeyboard([
	[Markup.button.callback('➕ Cuenta streaming', 'menu:create'), Markup.button.callback('🎮 Vender juego', 'menu:game')],
	[Markup.button.callback('🚀 Vender suscripción', 'menu:subscription'), Markup.button.callback('🔎 Buscar', 'menu:search')],
	[Markup.button.callback('⏰ Vencimientos', 'menu:expiring'), Markup.button.callback('❔ Ayuda', 'menu:help')],
]);

export const showMenu = async (ctx: Context): Promise<void> => {
	await ctx.reply('👋 *AF PlayZone — Operación*\nElige una acción para continuar.', { parse_mode: 'Markdown', ...menu });
};

const showCategories = async (ctx: Context): Promise<void> => {
	const categories = (await db.collection('categories_account').get()).docs.map((doc) => doc.data());
	if (!categories.length) { await ctx.reply('No hay plataformas creadas todavía.'); return; }
	const buttons = categories.slice(0, 20).map((category) => [Markup.button.callback(category.category_name, `category:${category.id}`)]);
	await ctx.reply('📂 *Elige la plataforma:*', { parse_mode: 'Markdown', ...Markup.inlineKeyboard(buttons) });
};

export const registerCommands = (bot: Telegraf): void => {
	bot.start((ctx) => showMenu(ctx));
	bot.command('ayuda', (ctx) => showMenu(ctx));
	bot.command('crear_cuenta', async (ctx) => { setSession(ctx.chat.id, { step: BotStep.WAITING_CATEGORY }); await showCategories(ctx); });
	bot.command('buscar_cuentas', async (ctx) => { setSession(ctx.chat.id, { step: BotStep.WAITING_SEARCH_ACCOUNT }); await ctx.reply('🔎 Escribe el correo de la cuenta o el nombre del cliente.'); });
	bot.command('proximos_vencer', async (ctx) => {
		const accounts = await getAccountsWithDateExpitarion();
		if (!accounts.length) { await ctx.reply('✅ No hay cuentas por vencer en los próximos dos días.'); return; }
		const text = accounts.slice(0, 20).map((account, index) => `${index + 1}. *${account.email_account}* · ${account.category_name || 'Servicio'}\nVence: ${account.expiration_date}`).join('\n\n');
		await ctx.reply(`⏰ *Próximos vencimientos*\n\n${text}`, { parse_mode: 'Markdown' });
	});
	bot.command('cancelar', async (ctx) => { resetSession(ctx.chat.id); await ctx.reply('Proceso cancelado.'); await showMenu(ctx); });

	bot.action('menu:create', async (ctx) => { if (!ctx.chat) return; await ctx.answerCbQuery(); setSession(ctx.chat.id, { step: BotStep.WAITING_CATEGORY }); await showCategories(ctx); });
	bot.action('menu:search', async (ctx) => { if (!ctx.chat) return; await ctx.answerCbQuery(); setSession(ctx.chat.id, { step: BotStep.WAITING_SEARCH_ACCOUNT }); await ctx.reply('🔎 Escribe el correo de la cuenta o el nombre del cliente.'); });
	bot.action('menu:game', async (ctx) => { if (!ctx.chat) return; await ctx.answerCbQuery(); setSession(ctx.chat.id, { step: BotStep.WAITING_GAME_SALE }); await ctx.reply('🎮 *Venta de juego digital*\n\nJuego: EA Sports FC 25\nCorreo: correo@ejemplo.com\nClave: contraseña\nTipo: Principal\nCliente: Nombre del cliente\nPrecio: 80000\nCosto: 50000', { parse_mode: 'Markdown' }); });
	bot.action('menu:subscription', async (ctx) => { if (!ctx.chat) return; await ctx.answerCbQuery(); setSession(ctx.chat.id, { step: BotStep.WAITING_SUBSCRIPTION_SALE }); await ctx.reply('🚀 *Venta de suscripción*\n\nSuscripción: PS Plus Extra\nCorreo: correo@ejemplo.com\nClave: contraseña\nVence: 04/09/2026\nCliente: Nombre del cliente\nPrecio: 60000\nCosto: 40000', { parse_mode: 'Markdown' }); });
	bot.action('menu:expiring', async (ctx) => { await ctx.answerCbQuery(); await ctx.reply('Usa /proximos_vencer para consultar la agenda.'); });
	bot.action('menu:help', async (ctx) => { await ctx.answerCbQuery(); await ctx.reply('Usa los botones del menú. Puedes cancelar cualquier flujo con /cancelar.'); });
	bot.action(/^category:(.+)$/, async (ctx) => {
		if (!ctx.chat || !ctx.match?.[1]) return;
		await ctx.answerCbQuery();
		setSession(ctx.chat.id, { step: BotStep.WAITING_ACCOUNT_DATA, categoryId: ctx.match[1] });
		await ctx.reply('✉️ Envía los datos así (PIN es opcional):\n\nCorreo: correo@ejemplo.com\nClave: contraseña\nPerfil: 1\nPIN: 1234\nVence: 04/09/2026');
	});
};
