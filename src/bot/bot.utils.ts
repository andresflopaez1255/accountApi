import type { Context } from 'telegraf';
import type { AccountListItem, AccountTemplatePayload, ParsedContactData } from './bot.types';
import { BOT_COMMANDS } from './bot.constants';
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

export const formatAccountsListMessage = (accounts: AccountListItem[], title = '🔍 *Cuentas encontradas:*'): string => {
	return [
		title,
		'',
		...accounts.map((account, index) => (
			`${index + 1}. Usuario: *${account.email_account}*\n` +
			`   Perfil: *${account.name_profile}*\n` +
			`   Vence: *${account.expiration_date}*`
		)),
	].join('\n\n');
};

export const buildHelpMessage = (): string => {
	return [
		'🤖 *Comandos disponibles:*',
		'',
		...BOT_COMMANDS.map(({ command, description }) => `/${command} - ${description}`),
	].join('\n');
};

export const parseContactData = (text: string): ParsedContactData | null => {
	const phoneMatch = text.match(/(\+?\d[\d\s-]{6,}\d)/);
	const emailMatch = text.match(/[^\s@]+@[^\s@]+\.[^\s@]+/);

	if (!phoneMatch || !emailMatch) {
		return null;
	}

	return {
		phone: phoneMatch[1].replace(/\s|-/g, ''),
		email: emailMatch[0],
	};
};
