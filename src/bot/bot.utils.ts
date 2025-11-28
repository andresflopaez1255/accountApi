import type { Context } from 'telegraf';
import type { AccountTemplatePayload } from './bot.types';
import { formatAccountMessage } from '../utils/parseAccountsData';

export const replyMarkdown = (ctx: Context, message: string) => ctx.reply(message, { parse_mode: 'Markdown' });

export const replyWithAccountTemplate = async (ctx: Context, account: AccountTemplatePayload): Promise<void> => {
	await replyMarkdown(
		ctx,
		formatAccountMessage({
			usuario: account.email_account,
			clave: account.pass_account,
			perfil: account.name_profile,
			pin: account.code_profile !== undefined ? String(account.code_profile).trim() : '',
			vence: account.expiration_date,
		})
	);
};

