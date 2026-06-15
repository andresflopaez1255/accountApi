import { Telegraf } from 'telegraf';
import { Account } from '../Interfaces';
import { getAccountsWithDateExpitarion } from '../controllers/accounts.controllers';
import { getCategoryUseCase } from '../usecases/categories/getCategory.usecase';
import { parseAccountText } from '../utils/parseAccountsData';
import { BOT_CODEX_ACCOUNT_TEMPLATES, BOT_CODEX_PROFILE_PLACEHOLDER } from './botCodex.constants';
import { parseBotCodexInput, registerStreamingAccountFromText } from './index';
import { buildBotCodexHelpMessage } from './botCodex.templates';
import {
	buildBotCodexRegistrationPayload,
	findAccountRecord,
	findAccountRecordsByEmail,
	registerStreamingAccountInFirebase,
	searchStreamingAccounts,
	updateStreamingAccountRecord,
	userExistsForRegistration,
} from './botCodex.service';
import { getBotCodexSession, resetBotCodexSession, setBotCodexSession } from './botCodex.session';
import {
	BotCodexAccountRecord,
	BotCodexAccountType,
	BotCodexDraftAccount,
	BotCodexSession,
	BotCodexStep,
	SupportedStreamingService,
} from './botCodex.types';

const BOT_CODEX_COMMANDS = [
	{ command: 'start', description: 'Iniciar Bot Codex' },
	{ command: 'ayuda', description: 'Ver instrucciones y formato' },
	{ command: 'plantilla', description: 'Ver plantillas de registro' },
	{ command: 'crear_cuenta', description: 'Registrar una cuenta o perfil' },
	{ command: 'buscar_cuentas', description: 'Buscar cuentas por correo o cliente' },
	{ command: 'proximos_vencer', description: 'Ver cuentas próximas a vencer' },
	{ command: 'actualizar_cuenta', description: 'Actualizar una cuenta existente' },
	{ command: 'garantia', description: 'Actualizar vencimiento o datos de una cuenta' },
	{ command: 'cancelar', description: 'Cancelar el flujo actual' },
];

const buildTemplateMessage = (): string => {
	return [
		'Plantilla para cuenta completa:',
		'',
		BOT_CODEX_ACCOUNT_TEMPLATES.fullAccount,
		'',
		'Plantilla para perfil específico:',
		'',
		BOT_CODEX_ACCOUNT_TEMPLATES.profileAccount,
	].join('\n');
};

const buildCompactTemplateHelpMessage = (): string => {
	return [
		'También puedes pegar la plantilla corta del sistema:',
		'',
		'correo: hksoyagua+luz3@gmail.com',
		'contraseña: 230916',
		'perfil: 5',
		'pin: 9999',
		'vence: 09/04/2026',
	].join('\n');
};

const buildComplementMessage = (): string => {
	return [
		'Perfecto. Ya organicé la cuenta base.',
		'Ahora envía solo los datos faltantes para registrarla.',
		'El tipo se detecta automáticamente según si la cuenta trae perfil o no:',
		'',
		'servicio: netflix',
		'cliente: Juan Perez',
	].join('\n');
};

const buildPhoneRequestMessage = (): string => {
	return [
		'No encontré ese cliente registrado.',
		'Envíame solo el teléfono para crearlo y terminar el registro.',
		'',
		'telefono: 3001234567',
	].join('\n');
};

const parsePhoneInput = (text: string): string | null => {
	const phone = text.match(/(?:telefono|tel[eé]fono)\s*:\s*([^\n]+)/i)?.[1]?.trim() || text.trim();
	const normalized = phone.replace(/\s|-/g, '');
	return normalized ? normalized : null;
};

const buildLookupHelpMessage = (): string => {
	return [
		'Usa uno de estos formatos para ubicar una cuenta:',
		'',
		'correo_cuenta: cuenta@stream.com',
		'correo_cuenta: cuenta@stream.com',
		'perfil: infantil1',
	].join('\n');
};

const buildSuccessMessage = (action: 'created' | 'updated'): string => {
	return action === 'created'
		? '✅ Cuenta registrada correctamente en Firebase.'
		: '♻️ Cuenta actualizada correctamente en Firebase.';
};

const inferAccountType = (account: Account): BotCodexAccountType => {
	return !account.name_profile || account.name_profile === BOT_CODEX_PROFILE_PLACEHOLDER
		? 'FULL_ACCOUNT'
		: 'PROFILE_ACCOUNT';
};

const buildAccountTemplateMessage = (
	service: SupportedStreamingService | string,
	accountType: BotCodexAccountType,
	account: Account
): string => {
	const title = accountType === 'FULL_ACCOUNT' ? `Cuenta completa ${service}` : `Perfil ${service}`;
	const lines = [
		`*${title}*`,
		'',
		`👤 *Usuario:* ${account.email_account}`,
		`🔑 *Clave:* ${account.pass_account}`,
	];

	if (accountType === 'PROFILE_ACCOUNT' && account.name_profile && account.name_profile !== BOT_CODEX_PROFILE_PLACEHOLDER) {
		lines.push(`📺 *Perfil:* ${account.name_profile}`);
	}

	if (account.code_profile) {
		lines.push(`📌 *PIN:* ${account.code_profile}`);
	}

	lines.push(
		`⏰ *Vence:* ${account.expiration_date}`,
		'',
		'📜 *Reglas para mantener la garantía:*',
		'⚠ Puedes usar solo (1) dispositivo',
		'⚠ Si se usa en más dispositivos puedes perder la garantía, sin derecho a devolución de dinero.',
		'',
		'☝😊 De esta manera podemos seguir brindándote el mejor servicio'
	);

	return lines.join('\n');
};

const buildSuccessTemplateResponse = (
	action: 'created' | 'updated',
	service: SupportedStreamingService | string,
	accountType: BotCodexAccountType,
	account: Account
): string => {
	return [
		buildSuccessMessage(action),
		'',
		buildAccountTemplateMessage(service, accountType, account),
	].join('\n');
};

const buildAccountsListMessage = (accounts: Account[], title = '🔍 Cuentas encontradas:'): string => {
	return [
		title,
		'',
		...accounts.map((account, index) => [
			`${index + 1}. ${account.email_account}`,
			`Perfil: ${account.name_profile}`,
			`Vence: ${account.expiration_date}`,
		].join('\n')),
	].join('\n\n');
};

const buildDraftFromCompactTemplate = (text: string): BotCodexDraftAccount | null => {
	const parsed = parseAccountText(text);

	if (!parsed?.email || !parsed.password || !parsed.rawExpire) {
		return null;
	}

	return {
		accountEmail: parsed.email,
		accountPassword: parsed.password,
		profileName: parsed.profile || BOT_CODEX_PROFILE_PLACEHOLDER,
		pin: parsed.pin || '',
		expirationDate: parsed.rawExpire,
	};
};

const buildFullTemplateFromDraft = (draft: BotCodexDraftAccount, complement: string): string => {
	const inferredType = draft.profileName === BOT_CODEX_PROFILE_PLACEHOLDER ? 'cuenta' : 'perfil';

	return [
		complement.trim(),
		`tipo: ${inferredType}`,
		`correo_cuenta: ${draft.accountEmail}`,
		`clave: ${draft.accountPassword}`,
		`perfil: ${draft.profileName}`,
		`pin: ${draft.pin}`,
		`vence: ${draft.expirationDate}`,
	].join('\n');
};

const parseLookupInput = (text: string): { email: string; profile?: string } | null => {
	const email = text.match(/correo_cuenta\s*:\s*([^\n]+)/i)?.[1]?.trim() || text.trim();
	const profile = text.match(/perfil\s*:\s*([^\n]+)/i)?.[1]?.trim();

	if (!email) {
		return null;
	}

	return { email, profile };
};

const resolveTargetAccount = async (text: string): Promise<BotCodexAccountRecord | null> => {
	const lookup = parseLookupInput(text);
	if (!lookup) {
		return null;
	}

	if (lookup.profile) {
		return findAccountRecord(lookup.email, lookup.profile);
	}

	const matches = await findAccountRecordsByEmail(lookup.email);
	return matches.length === 1 ? matches[0] : null;
};

const applyWarrantyUpdate = async (
	targetAccount: BotCodexAccountRecord,
	text: string
): Promise<Account> => {
	const newExpiration = text.match(/vence\s*:\s*([^\n]+)/i)?.[1]?.trim() || text.trim();
	const updatedAccount: Account = {
		...targetAccount.account,
		expiration_date: newExpiration,
	};

	return updateStreamingAccountRecord(targetAccount.docId, updatedAccount);
};

const getAccountService = async (account: Account): Promise<SupportedStreamingService | string> => {
	const category = await getCategoryUseCase('id', account.id_category);
	return category?.category_name || 'Servicio';
};

const handleCreateFlow = async (bot: Telegraf, chatId: number): Promise<void> => {
	setBotCodexSession(chatId, { step: BotCodexStep.WAITING_CREATE_TEMPLATE });
	await bot.telegram.sendMessage(chatId, [
		'📝 Envía la plantilla completa o la plantilla corta del sistema para registrar la cuenta o perfil.',
		'',
		buildTemplateMessage(),
		'',
		buildCompactTemplateHelpMessage(),
	].join('\n'));
};

const handleSearchFlow = async (bot: Telegraf, chatId: number): Promise<void> => {
	setBotCodexSession(chatId, { step: BotCodexStep.WAITING_SEARCH_QUERY });
	await bot.telegram.sendMessage(chatId, '🔍 Envía el correo de la cuenta o el nombre del cliente para buscar.');
};

const handleUpdateFlow = async (bot: Telegraf, chatId: number): Promise<void> => {
	setBotCodexSession(chatId, { step: BotCodexStep.WAITING_UPDATE_LOOKUP });
	await bot.telegram.sendMessage(chatId, [
		'✏️ Primero envía el correo de la cuenta a actualizar.',
		buildLookupHelpMessage(),
	].join('\n\n'));
};

const handleWarrantyFlow = async (bot: Telegraf, chatId: number): Promise<void> => {
	setBotCodexSession(chatId, { step: BotCodexStep.WAITING_WARRANTY_LOOKUP });
	await bot.telegram.sendMessage(chatId, [
		'🛡️ Envía el correo de la cuenta a renovar o actualizar por garantía.',
		buildLookupHelpMessage(),
	].join('\n\n'));
};

const handleSessionText = async (
	bot: Telegraf,
	chatId: number,
	text: string,
	session: BotCodexSession
): Promise<boolean> => {
	switch (session.step) {
	case BotCodexStep.WAITING_CREATE_TEMPLATE: {
		const draftAccount = buildDraftFromCompactTemplate(text);
		if (draftAccount) {
			setBotCodexSession(chatId, {
				step: BotCodexStep.WAITING_CREATE_COMPLEMENT,
				draftAccount,
			});
			await bot.telegram.sendMessage(chatId, buildComplementMessage());
			return true;
		}

		const result = await registerStreamingAccountFromText(text);
		resetBotCodexSession(chatId);
		await bot.telegram.sendMessage(
			chatId,
			buildSuccessTemplateResponse(result.action, result.service, result.accountType, result.account),
			{ parse_mode: 'Markdown' }
		);
		return true;
	}

	case BotCodexStep.WAITING_CREATE_COMPLEMENT: {
		const draftAccount = session.draftAccount;
		if (!draftAccount) {
			resetBotCodexSession(chatId);
			await bot.telegram.sendMessage(chatId, '❌ Se perdió la plantilla base. Usa /crear_cuenta de nuevo.');
			return true;
		}

		const fullTemplate = buildFullTemplateFromDraft(draftAccount, text);
		const parsedInput = parseBotCodexInput(fullTemplate);
		if (!parsedInput) {
			throw new Error(buildBotCodexHelpMessage());
		}

		const userExists = await userExistsForRegistration(parsedInput.user);
		if (!userExists) {
			setBotCodexSession(chatId, {
				step: BotCodexStep.WAITING_CREATE_PHONE,
				draftAccount,
				pendingInput: parsedInput,
			});
			await bot.telegram.sendMessage(chatId, buildPhoneRequestMessage());
			return true;
		}

		const result = await registerStreamingAccountInFirebase(parsedInput);
		resetBotCodexSession(chatId);
		await bot.telegram.sendMessage(
			chatId,
			buildSuccessTemplateResponse(result.action, result.service, result.accountType, result.account),
			{ parse_mode: 'Markdown' }
		);
		return true;
	}

	case BotCodexStep.WAITING_CREATE_PHONE: {
		const pendingInput = session.pendingInput;
		if (!pendingInput) {
			resetBotCodexSession(chatId);
			await bot.telegram.sendMessage(chatId, '❌ Se perdió el contexto del registro. Usa /crear_cuenta de nuevo.');
			return true;
		}

		const phone = parsePhoneInput(text);
		if (!phone) {
			await bot.telegram.sendMessage(chatId, buildPhoneRequestMessage());
			return true;
		}

		const result = await registerStreamingAccountInFirebase({
			...pendingInput,
			user: {
				...pendingInput.user,
				phone,
			},
		});
		resetBotCodexSession(chatId);
		await bot.telegram.sendMessage(
			chatId,
			buildSuccessTemplateResponse(result.action, result.service, result.accountType, result.account),
			{ parse_mode: 'Markdown' }
		);
		return true;
	}

	case BotCodexStep.WAITING_SEARCH_QUERY: {
		const accounts = await searchStreamingAccounts(text.trim());
		resetBotCodexSession(chatId);
		await bot.telegram.sendMessage(
			chatId,
			accounts.length === 0 ? '❌ No se encontraron cuentas.' : buildAccountsListMessage(accounts)
		);
		return true;
	}

	case BotCodexStep.WAITING_UPDATE_LOOKUP: {
		const targetAccount = await resolveTargetAccount(text);
		if (!targetAccount) {
			await bot.telegram.sendMessage(chatId, [
				'❌ No pude ubicar una cuenta exacta con esos datos.',
				'Si hay varios perfiles con el mismo correo, agrega también el perfil.',
				buildLookupHelpMessage(),
			].join('\n\n'));
			return true;
		}

		setBotCodexSession(chatId, {
			step: BotCodexStep.WAITING_UPDATE_TEMPLATE,
			targetAccount,
		});

		await bot.telegram.sendMessage(chatId, [
			'✏️ Cuenta encontrada. Ahora envía la nueva plantilla completa o la plantilla corta del sistema para actualizarla.',
			'',
			buildTemplateMessage(),
			'',
			buildCompactTemplateHelpMessage(),
		].join('\n'));
		return true;
	}

	case BotCodexStep.WAITING_UPDATE_TEMPLATE: {
		const targetAccount = session.targetAccount;
		if (!targetAccount) {
			resetBotCodexSession(chatId);
			await bot.telegram.sendMessage(chatId, '❌ Se perdió el contexto de la cuenta. Usa /actualizar_cuenta de nuevo.');
			return true;
		}

		const compactDraft = buildDraftFromCompactTemplate(text);
		if (compactDraft) {
			const updatedAccount: Account = {
				...targetAccount.account,
				email_account: compactDraft.accountEmail,
				pass_account: compactDraft.accountPassword,
				name_profile: compactDraft.profileName,
				code_profile: parseInt(compactDraft.pin, 10) || 0,
				expiration_date: compactDraft.expirationDate,
				id: targetAccount.account.id,
			};
			await updateStreamingAccountRecord(targetAccount.docId, updatedAccount);
			resetBotCodexSession(chatId);
			await bot.telegram.sendMessage(
				chatId,
				buildSuccessTemplateResponse(
					'updated',
					await getAccountService(updatedAccount),
					inferAccountType(updatedAccount),
					updatedAccount
				),
				{ parse_mode: 'Markdown' }
			);
			return true;
		}

		const parsedInput = parseBotCodexInput(text);
		if (!parsedInput) {
			throw new Error(buildBotCodexHelpMessage());
		}

		const payload = await buildBotCodexRegistrationPayload(parsedInput);
		const updatedAccount: Account = {
			...payload.account,
			id: targetAccount.account.id,
		};
		await updateStreamingAccountRecord(targetAccount.docId, updatedAccount);
		resetBotCodexSession(chatId);
		await bot.telegram.sendMessage(
			chatId,
			buildSuccessTemplateResponse('updated', parsedInput.service, parsedInput.accountType, updatedAccount),
			{ parse_mode: 'Markdown' }
		);
		return true;
	}

	case BotCodexStep.WAITING_WARRANTY_LOOKUP: {
		const targetAccount = await resolveTargetAccount(text);
		if (!targetAccount) {
			await bot.telegram.sendMessage(chatId, [
				'❌ No pude ubicar una cuenta exacta con esos datos.',
				buildLookupHelpMessage(),
			].join('\n\n'));
			return true;
		}

		setBotCodexSession(chatId, {
			step: BotCodexStep.WAITING_WARRANTY_DATA,
			targetAccount,
		});

		await bot.telegram.sendMessage(chatId, [
			'🛡️ Cuenta encontrada. Ahora envía solo la nueva fecha o una línea como:',
			'vence: 26/12/2025',
		].join('\n'));
		return true;
	}

	case BotCodexStep.WAITING_WARRANTY_DATA: {
		const targetAccount = session.targetAccount;
		if (!targetAccount) {
			resetBotCodexSession(chatId);
			await bot.telegram.sendMessage(chatId, '❌ Se perdió el contexto de la cuenta. Usa /garantia de nuevo.');
			return true;
		}

		const updatedAccount = await applyWarrantyUpdate(targetAccount, text);
		const service = await getAccountService(updatedAccount);
		const accountType = inferAccountType(updatedAccount);
		resetBotCodexSession(chatId);
		await bot.telegram.sendMessage(
			chatId,
			[
				'🛡️ Garantía o vencimiento actualizado correctamente.',
				'',
				buildAccountTemplateMessage(service, accountType, updatedAccount),
			].join('\n'),
			{ parse_mode: 'Markdown' }
		);
		return true;
	}
	}

	return false;
};

export const managerBotCodexController = async (): Promise<Telegraf> => {
	const botToken = process.env.TELEGRAM_BOT_TOKEN || '7825975702:AAERv2QdXQhZm-9P0VAvwI0iRLjq05kKiHU';
	const bot = new Telegraf(botToken);
	const runMode = process.env.TELEGRAM_BOT_MODE || 'polling';

	bot.start(async (ctx) => {
		resetBotCodexSession(ctx.chat.id);
		await ctx.reply(buildBotCodexHelpMessage());
	});

	bot.command('ayuda', async (ctx) => {
		resetBotCodexSession(ctx.chat.id);
		await ctx.reply(buildBotCodexHelpMessage());
	});

	bot.command('plantilla', async (ctx) => {
		await ctx.reply([buildTemplateMessage(), '', buildCompactTemplateHelpMessage()].join('\n'));
	});

	bot.command('crear_cuenta', async (ctx) => {
		await handleCreateFlow(bot, ctx.chat.id);
	});

	bot.command('buscar_cuentas', async (ctx) => {
		await handleSearchFlow(bot, ctx.chat.id);
	});

	bot.command('actualizar_cuenta', async (ctx) => {
		await handleUpdateFlow(bot, ctx.chat.id);
	});

	bot.command('garantia', async (ctx) => {
		await handleWarrantyFlow(bot, ctx.chat.id);
	});

	bot.command('cancelar', async (ctx) => {
		resetBotCodexSession(ctx.chat.id);
		await ctx.reply('❌ Proceso cancelado.');
	});

	bot.command('proximos_vencer', async (ctx) => {
		const accounts = await getAccountsWithDateExpitarion();
		await ctx.reply(
			accounts.length === 0 ? '✅ No hay cuentas próximas a vencer.' : buildAccountsListMessage(accounts)
		);
	});

	bot.on('text', async (ctx) => {
		const text = ctx.message.text.trim();
		if (text.startsWith('/')) {
			return;
		}

		const session = getBotCodexSession(ctx.chat.id);
		if (session) {
			try {
				const handled = await handleSessionText(bot, ctx.chat.id, text, session);
				if (handled) {
					return;
				}
			} catch (error) {
				resetBotCodexSession(ctx.chat.id);
				const message = error instanceof Error ? error.message : '❌ Ocurrió un error procesando la solicitud.';
				await ctx.reply(message);
				return;
			}
		}

		try {
			const result = await registerStreamingAccountFromText(text);
			await ctx.reply(
				buildSuccessTemplateResponse(result.action, result.service, result.accountType, result.account),
				{ parse_mode: 'Markdown' }
			);
		} catch (error) {
			const draftAccount = buildDraftFromCompactTemplate(text);
			if (draftAccount) {
				setBotCodexSession(ctx.chat.id, {
					step: BotCodexStep.WAITING_CREATE_COMPLEMENT,
					draftAccount,
				});
				await ctx.reply(buildComplementMessage());
				return;
			}

			const message = error instanceof Error ? error.message : buildBotCodexHelpMessage();
			await ctx.reply([message, '', buildCompactTemplateHelpMessage()].join('\n'));
		}
	});

	await bot.telegram.setMyCommands(BOT_CODEX_COMMANDS);

	if (runMode === 'polling') {
		await bot.launch();
		process.once('SIGINT', () => bot.stop('SIGINT'));
		process.once('SIGTERM', () => bot.stop('SIGTERM'));
		console.log('🤖 Bot Codex activo en modo local (polling).');
		return bot;
	}

	const webhookPath = `/bot${bot.secretPathComponent()}`;
	const webhookBaseUrl = process.env.TELEGRAM_BOT_WEBHOOK_URL || 'https://accountapi-8smd.onrender.com';
	const webhookUrl = `${webhookBaseUrl}${webhookPath}`;

	await bot.telegram.setWebhook(webhookUrl);
	console.log(`🤖 Bot Codex activo en webhook: ${webhookUrl}`);

	return bot;
};
