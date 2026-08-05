/* eslint-disable @typescript-eslint/no-non-null-assertion */
import type { Context } from 'telegraf';
import { v4 as uuid } from 'uuid';
import { db } from '../../firebase';
import { capitalize } from '../../utils/capitalizeString';
import { formatDigitalGame, formatGameSubscription, parseAccountText, updateTemplateFromObject } from '../../utils/parseAccountsData';
import { getCategoryUseCase } from '../../usecases/categories/getCategory.usecase';
import { useCaseSpecificDataUser } from '../../usecases/users/specificDataUser.usecase';
import { createNewAccountUseCase } from '../../usecases/accounts/createNewAccount.usecase';
import { updateAccountUseCase } from '../../usecases/accounts/updateAccount.usecase';
import { seacrhDataAccountsUseCase } from '../../usecases/accounts/searchDataAccounts.usecase';
import { getSpecificAccountUseCase } from '../../usecases/accounts/getSpecificAccount.usecase';
import { Account } from '../../Interfaces';
import { BotStep, type UserSession } from '../bot.types';
import { resetSession, setSession } from '../bot.session';
import { ACCOUNT_FORMAT_MESSAGE } from '../bot.constants';
import { replyMarkdown, replyWithAccountTemplate } from '../bot.utils';

const fieldValue = (text: string, label: string): string => text.match(new RegExp(`^${label}\\s*:\\s*(.+)$`, 'im'))?.[1]?.trim() || '';
const numericValue = (text: string, label: string): number => Number(fieldValue(text, label).replace(/[^0-9.,]/g, '').replace(',', '.')) || 0;

const saveSale = async (data: { type: 'game' | 'subscription'; service: string; email: string; password: string; clientName: string; price: number; cost: number; expiration?: string; accountType?: string }) => {
	const customer = data.clientName ? await db.collection('users').where('name_user', '==', data.clientName).limit(1).get() : null;
	const id = uuid();
	await db.collection('sales').doc(id).set({
		id,
		line: data.type === 'game' ? 'game' : 'subscription',
		service: data.service,
		client_id: customer && !customer.empty ? customer.docs[0].data().id : '',
		client_name: data.clientName || 'Venta sin cliente asociado',
		price: data.price,
		cost: data.cost,
		payment_status: 'paid',
		payment_method: 'Por confirmar',
		sale_date: new Date().toISOString().slice(0, 10),
		renewal_date: data.expiration || '',
		created_at: new Date().toISOString(),
	});
};

export const handleTextMessage = async (ctx: Context, session: UserSession): Promise<void> => {
	if (!ctx.chat || !ctx.message || !('text' in ctx.message)) return;
	
	console.log(session)
	switch (session.step) {
	case BotStep.WAITING_GAME_SALE: {
		const raw = ctx.message.text;
		const game = fieldValue(raw, 'Juego'); const email = fieldValue(raw, 'Correo'); const password = fieldValue(raw, '(?:Clave|Contraseña)');
		const accountType = fieldValue(raw, 'Tipo') || 'Principal'; const customer = fieldValue(raw, 'Cliente'); const price = numericValue(raw, 'Precio'); const cost = numericValue(raw, 'Costo');
		if (!game || !email || !password || !price) { await ctx.reply('⚠️ Necesito Juego, Correo, Clave y Precio. Tipo, Cliente y Costo pueden ajustarse después.'); return; }
		await saveSale({ type: 'game', service: game, email, password, clientName: customer, price, cost, accountType });
		await replyMarkdown(ctx, formatDigitalGame({ juego: game, servicio: game, usuario: email, clave: password, tipoCuenta: accountType }));
		await ctx.reply(`✅ Venta registrada: ${game} · $${price.toLocaleString('es-CO')}`); resetSession(ctx.chat.id); break;
	}
	case BotStep.WAITING_SUBSCRIPTION_SALE: {
		const raw = ctx.message.text;
		const subscription = fieldValue(raw, '(?:Suscripción|Suscripcion)'); const email = fieldValue(raw, 'Correo'); const password = fieldValue(raw, '(?:Clave|Contraseña)');
		const expiration = fieldValue(raw, 'Vence'); const customer = fieldValue(raw, 'Cliente'); const price = numericValue(raw, 'Precio'); const cost = numericValue(raw, 'Costo');
		if (!subscription || !email || !password || !expiration || !price) { await ctx.reply('⚠️ Necesito Suscripción, Correo, Clave, Vence y Precio.'); return; }
		await saveSale({ type: 'subscription', service: subscription, email, password, clientName: customer, price, cost, expiration });
		await replyMarkdown(ctx, formatGameSubscription({ servicio: subscription, usuario: email, clave: password, vence: expiration }));
		await ctx.reply(`✅ Venta registrada: ${subscription} · $${price.toLocaleString('es-CO')}`); resetSession(ctx.chat.id); break;
	}

	case BotStep.WAITING_EMAIL_GARANTY: {
		session.step = BotStep.WAITING_ACCOUNT_GARANTY;
		setSession(ctx.chat.id, session);
		await ctx.reply('✉️ Por favor envía el correo de la cuenta para extender la garantía por 30 días adicionales:');
		break;
	}

	case BotStep.WAITING_SEARCH_ACCOUNT: {
		const searchQuery = ctx.message.text.trim();
		const results = (await seacrhDataAccountsUseCase(searchQuery)) as Account[];

		if (results.length === 0) {
			await ctx.reply('❌ No se encontraron cuentas que coincidan con la búsqueda. Intenta nuevamente.');
			return;
		}

		let responseMessage = '🔍 *Cuentas encontradas:*\n\n';

		if (results.length == 1) {
			await replyWithAccountTemplate(ctx, {
				email_account: results[0].email_account,
				pass_account: results[0].pass_account,
				name_profile: results[0].name_profile,
				code_profile: results[0].code_profile,
				expiration_date: results[0].expiration_date,
				service: (results[0] as Account & { category?: string }).category,
			});
			resetSession(ctx.chat.id); // limpiar sesión
			return;
		}
		results.forEach((account, index) => {
			responseMessage += `${index + 1}. Usuario: *${account.email_account}*\n   Perfil: *${account.name_profile}*\n   Vence: *${account.expiration_date}*\n\n`;
		});

		await ctx.reply(responseMessage, { parse_mode: 'Markdown' });
		resetSession(ctx.chat.id); // limpiar sesión
		break;
	}

	case BotStep.WAITING_CATEGORY: {
		const category = capitalize(ctx.message.text.trim());
		console.log(category)
		const categoryData = await getCategoryUseCase('category_name', category);
		console.log(categoryData)

		if (!categoryData) {
			await ctx.reply('❌ Categoría no encontrada. Intenta nuevamente.');
			return;
		}

		session.categoryId = categoryData.id;
		session.step = BotStep.WAITING_ACCOUNT_DATA;
		setSession(ctx.chat.id, session);

		await replyMarkdown(ctx, ACCOUNT_FORMAT_MESSAGE);
		break;
	}

	case BotStep.WAITING_ACCOUNT_DATA: {
		const raw = ctx.message.text;
		const email = raw.match(/correo\s*:\s*([^\s]+)/i)?.[1]?.trim();
		const password = raw.match(/(?:clave|contraseña)\s*:\s*([^\n]+)/i)?.[1]?.trim();
		const profile = raw.match(/perfil\s*:\s*([^\n]+)/i)?.[1]?.trim() || '1';
		const pin = raw.match(/pin\s*:\s*(\d+)/i)?.[1]?.trim() || '';
		const expiration = raw.match(/vence\s*:\s*([0-9]{1,2}\/[0-9]{1,2}\/[0-9]{2,4})/i)?.[1]?.trim();

		if (!email || !password || !expiration) {
			await ctx.reply('⚠️ Necesito Correo, Clave y Vence. El Perfil y el PIN son opcionales.');
			return;
		}

		session.accountData = {
			email,
			password,
			profile,
			pin,
			expiration,
			clientName: '',
		};
		session.step = BotStep.WAITING_VALIDATE_USER;
		setSession(ctx.chat.id, session);

		await ctx.reply(
			'👤 Ahora dime el nombre del cliente al que pertenece la cuenta:'
		);
		break;
	}

	case BotStep.WAITING_VALIDATE_USER: {
		const account = session.accountData;
		if (!account) {
			resetSession(ctx.chat.id);
			await ctx.reply(
				'❌ Hubo un problema con los datos previos. Reinicia con /crear_cuenta.'
			);
			return;
		}

		const clientName = ctx.message.text.trim();
		if (!clientName) {
			await ctx.reply('⚠ Necesito el nombre del cliente. Intenta de nuevo:');
			return;
		}

		session.accountData = { ...account, clientName };
		setSession(ctx.chat.id, session);

		const userData = await useCaseSpecificDataUser('name_user', clientName);

		if (userData.empty) {
			session.step = BotStep.WAITING_NEW_USER;
			setSession(ctx.chat.id, session);
			await ctx.reply(
				`👤 No encuentro a "${clientName}".\n` +
					'Por favor envía su teléfono y correo así:\n\n' +
					'📞 3001234567 📧 cliente@ejemplo.com'
			);
			return;
		}

		const newAccount = await createNewAccountUseCase({
			email_account: account.email,
			pass_account: account.password,
			name_profile: account.profile,
			code_profile: account.pin ? parseInt(account.pin, 10) : 0,
			expiration_date: account.expiration,
			id_user: userData.docs[0].data().id,
			id_category: session.categoryId!,
		});

		await replyMarkdown(
			ctx,
			`✅ Cuenta para *${clientName}* registrada con éxito.`,
		);
		resetSession(ctx.chat.id);

		await replyWithAccountTemplate(ctx, newAccount);
		break;
	}

	case BotStep.WAITING_NEW_USER: {
		const account = session.accountData;
		if (!account) {
			resetSession(ctx.chat.id);
			await ctx.reply('❌ Datos de la cuenta faltan. Por favor reinicia el proceso con /crear_cuenta.');
			return;
		}

		const phoneMatch = ctx.message.text.match(/(\+?\d[\d\s-]{6,}\d)/);
		const emailMatch = ctx.message.text.match(/[^\s@]+@[^\s@]+\.[^\s@]+/);

		if (!phoneMatch || !emailMatch) {
			await ctx.reply('⚠ Formato inválido. Envía el teléfono y correo así: 📞 3001234567 📧 cliente@ejemplo.com');
			return;
		}

		const phone = phoneMatch[1].replace(/\s|-/g, '');
		const email = emailMatch[0];
		const { clientName } = account;
		const userID = uuid();
		const newUser = {
			id: userID,
			name_user: clientName,
			cellphone_user: phone,
			email_user: email,
		};

		await db.collection('users').add(newUser);
		const newAccount = await createNewAccountUseCase({
			email_account: account.email,
			pass_account: account.password,
			name_profile: account.profile,
			code_profile: account.pin ? parseInt(account.pin, 10) : 0,
			expiration_date: account.expiration,
			id_user: userID,
			id_category: session.categoryId!,
		});

		await replyMarkdown(
			ctx,
			`✅ Cuenta para *${clientName}* registrada con éxito.`,
		);
		resetSession(ctx.chat.id);

		await replyWithAccountTemplate(ctx, newAccount);
		break;
	}
	case BotStep.WAITING_ACCOUNT_GARANTY: {
		const rawMessage = ctx.message.text;
		const message = rawMessage.replace(/[*_]/g, '').replace(/\s+/g, ' ').trim();

		const oldEmailMatch = message.match(/cuenta[_:\s]+([^\s]+)/i);
		if (!oldEmailMatch) {
			await ctx.reply('⚠️ No se pudo detectar el correo anterior. Asegúrate de seguir el formato correcto.');
			return;
		}
		const oldEmail = oldEmailMatch[1].trim();

		const accountsSnapshot = await db.collection('accounts').where('email_account', '==', oldEmail).get();

		if (accountsSnapshot.empty) {
			await ctx.reply(`❌ No se encontró ninguna cuenta con el correo *${oldEmail}*.`);
			return;
		}

		const accountDoc = accountsSnapshot.docs[0];
		const accountData = accountDoc.data() as Account;

		const newEmail = message.match(/Correo:\s*([^\s]+)/i)?.[1]?.trim() || accountData.email_account;
		const newPassword = message.match(/Clave:\s*([^\s]+)/i)?.[1]?.trim() || accountData.pass_account;
		const newProfile = message.match(/Perfil\s*#?\s*(\S+)/i)?.[1]?.trim() || accountData.name_profile;
		const newPin = message.match(/pin\s*(\d+)/i)?.[1]?.trim() || accountData.code_profile;
		const newExpiration = message.match(/Vence:\s*([^\n]+)/i)?.[1]?.trim() || accountData.expiration_date;

		await updateAccountUseCase(accountData.id!, {
			...accountData,
			email_account: newEmail,
			pass_account: newPassword,
			name_profile: newProfile,
			code_profile: parseInt(newPin.toString(), 10),
			expiration_date: newExpiration,
		});

		console.log(newEmail)
		await ctx.reply(`✅ La cuenta *${newEmail}* ha sido actualizada exitosamente.`, { parse_mode: 'Markdown' });

		await replyWithAccountTemplate(ctx, {
			email_account: newEmail,
			pass_account: newPassword,
			name_profile: newProfile,
			code_profile: newPin,
			expiration_date: newExpiration,
		});
		resetSession(ctx.chat.id);
		break;
	}

	case BotStep.WAITING_UPDATE_ACCOUNT: {
		const account = session.accountData;
		if (!account) {
			resetSession(ctx.chat.id);
			await ctx.reply('❌ No se encontró la cuenta a actualizar. Repite /actualizar_cuenta.');
			return;
		}

		const AccountRaw = parseAccountText(ctx.message.text)
		const newAccount: Account = {
			id: account.id!,
			id_user: account.idUser!,
			id_category: account.idCategory!,
			code_profile: AccountRaw?.pin ? parseInt(AccountRaw.pin) : 0,
			email_account: AccountRaw?.email ?? '',
			expiration_date: AccountRaw?.rawExpire ?? '',
			name_profile: AccountRaw?.profile ?? '',
			pass_account: AccountRaw?.password ?? ''
		}

		const responseAccount = await updateAccountUseCase(account.idDoc!, newAccount)
		const newTemplate = await updateTemplateFromObject(ctx.message.text, responseAccount)
		await ctx.reply(newTemplate, { parse_mode: 'Markdown' })
		resetSession(ctx.chat.id);
		break;
	}

	case BotStep.WAITING_EMAIL_TO_UPDATE_ACCOUNT: {
		const email_account = ctx.message?.text?.trim();
		if (!email_account) return;

		const account = await getSpecificAccountUseCase('email_account', email_account);
		if (!account.exists) {
			await ctx.reply(`❌ No se encontró ninguna cuenta con el correo ${email_account}`);
			return;
		}

		const accountData = account.data() as Account;

		session.accountData = {
			idDoc: account.id,
			id: accountData.id,
			idUser: accountData.id_user,
			idCategory: accountData.id_category,
			clientName: '',
			email: accountData.email_account,
			expiration: accountData.expiration_date,
			password: accountData.pass_account,
			pin: accountData.code_profile.toString(),
			profile: accountData.name_profile
		}

		session.step = BotStep.WAITING_UPDATE_ACCOUNT
		setSession(ctx.chat.id, session);

		await ctx.reply('✏️ Ahora envía la información de la cuenta a actualizar siguiendo el formato habitual.')

		break;
	}
	}
};
