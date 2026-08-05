import type { Context } from 'telegraf';
import type { AccountTemplatePayload } from './bot.types';
import { formatAccountMessage, formatDigitalGame, formatGameSubscription } from '../utils/parseAccountsData';

export const replyMarkdown = (ctx: Context, message: string) => ctx.reply(message, { parse_mode: 'Markdown' });

export const replyWithAccountTemplate = async (ctx: Context, account: AccountTemplatePayload): Promise<void> => {
	const service = account.service || '';
	const data = {
		usuario: account.email_account,
		clave: account.pass_account,
		perfil: account.name_profile,
		pin: account.code_profile && Number(account.code_profile) > 0 ? String(account.code_profile).trim() : '',
		vence: account.expiration_date,
		servicio: service,
		juego: service,
	};
	const message = /game\s*pass|ps\s*plus|playstation\s*plus/i.test(service)
		? formatGameSubscription(data)
		: /ps5|ps4|xbox|juego|game/i.test(service)
			? formatDigitalGame(data)
			: formatAccountMessage(data);
	await replyMarkdown(
		ctx,
		message
	);
};
