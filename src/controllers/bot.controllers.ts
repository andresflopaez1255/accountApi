/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Telegraf } from 'telegraf';
import { v4 as uuid } from 'uuid';
import type { Express } from 'express';

import { getCategoryUseCase } from '../usecases/categories/getCategory.usecase';
import { useCaseSpecificDataUser } from '../usecases/users/specificDataUser.usecase';
import { createNewAccountUseCase } from '../usecases/accounts/createNewAccount.usecase';
import { db } from '../firebase';
import { capitalize } from '../utils/capitalizeString';
import { formatAccountMessage, parseAccountText, updateTemplateFromObject } from '../utils/parseAccountsData';
import { updateAccountUseCase } from '../usecases/accounts/updateAccount.usecase';
import { Account } from '../Interfaces';
import { seacrhDataAccountsUseCase } from '../usecases/accounts/searchDataAccounts.usecase';
import { getAccountsWithDateExpitarion } from './accounts.controllers';
import { getSpecificAccountUseCase } from '../usecases/accounts/getSpecificAccount.usecase';


type UserAccountData = {
	id?:string
	idUser?: string
	idCategory?:string
	email: string;
	password: string;
	profile: string;
	pin: string;
	expiration: string;
	clientName: string;

};

type UserSession = {
	step: 'WAITING_CATEGORY' | 'WAITING_ACCOUNT_DATA' | 'WAITING_NEW_USER' | 'WAITING_ACCOUNT_GARANTY'
	| 'WAITING_EMAIL_GARANTY' | 'WAITTING_SEARCH_ACCOUNT' | 'WAITTING_EMAILTO_UPDATE_ACCOUNT' | 'WAITTING_UPDATE_ACCOUNT';
	categoryId?: string;
	accountData?: UserAccountData;
};

const userSessions: Record<number, UserSession | undefined> = {};
export const managerBotController = async (app: Express) => {
	const bot = new Telegraf('7825975702:AAERv2QdXQhZm-9P0VAvwI0iRLjq05kKiHU');
	const webhookPath = `/bot${bot.secretPathComponent()}`;
	app.use(bot.webhookCallback(webhookPath));

	const webhookUrl = `https://accountapi-8smd.onrender.com${webhookPath}`;
	bot.telegram.setWebhook(webhookUrl);

	console.log(`🤖 Webhook configurado en ${webhookUrl}`);



	// Comando para iniciar creación
	bot.command('crear_cuenta', async (ctx) => {
		userSessions[ctx.chat.id] = { step: 'WAITING_CATEGORY' };
		ctx.reply('📂 Ingresa la *categoría* de la cuenta:', { parse_mode: 'Markdown' });
	});

	bot.command('garantia', async (ctx) => {
		userSessions[ctx.chat.id] = { step: 'WAITING_ACCOUNT_GARANTY' };
		await ctx.reply('✉️ Por favor envía el correo de la cuenta para extender la garantía o actualizar los datos:');
	});

	bot.command('cancelar', async (ctx) => {
		userSessions[ctx.chat.id] = undefined;
		await ctx.reply('❌ Proceso cancelado. Puedes iniciar un nuevo proceso cuando desees.');
	});


	bot.command('buscar_cuentas', async (ctx) => {
		userSessions[ctx.chat.id] = { step: 'WAITTING_SEARCH_ACCOUNT' };
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
		userSessions[ctx.chat.id] = undefined; // limpiar sesión
	})

	bot.command('actualizar_cuenta', async (ctx) => {
		userSessions[ctx.chat.id] = { step: 'WAITTING_EMAILTO_UPDATE_ACCOUNT' };
		await ctx.reply('🔍 Por favor ingresa el correo o nombre del cliente para buscar las cuentas:');
	})

	bot.on('text', async (ctx): Promise<void> => {
		const session = userSessions[ctx.chat.id];

		if (!session) return; // si no está en flujo, ignorar

		switch (session.step) {

		case 'WAITING_EMAIL_GARANTY': {
			session.step = 'WAITING_ACCOUNT_GARANTY';
			await ctx.reply('✉️ Por favor envía el correo de la cuenta para extender la garantía por 30 días adicionales:');
			break;
		}

		case 'WAITTING_SEARCH_ACCOUNT': {
			const searchQuery = ctx.message.text.trim();
			const results = (await seacrhDataAccountsUseCase(searchQuery)) as Account[];

			if (results.length === 0) {
				await ctx.reply('❌ No se encontraron cuentas que coincidan con la búsqueda. Intenta nuevamente.');
				return;
			}

			let responseMessage = '🔍 *Cuentas encontradas:*\n\n';

			if (results.length == 1) {
				const plantilla = formatAccountMessage(
					{
						usuario: results[0].email_account,
						clave: results[0].pass_account,
						perfil: results[0].name_profile,
						pin: results[0].code_profile,
						vence: results[0].expiration_date,
					}
				);
				await ctx.reply(plantilla, { parse_mode: 'Markdown' });
				userSessions[ctx.chat.id] = undefined; // limpiar sesión
				return;
			}
			results.forEach((account, index) => {

				responseMessage += `${index + 1}. Usuario: *${account.email_account}*\n   Perfil: *${account.name_profile}*\n   Vence: *${account.expiration_date}*\n\n`;
			});

			await ctx.reply(responseMessage, { parse_mode: 'Markdown' });
			userSessions[ctx.chat.id] = undefined; // limpiar sesión
			break;

		}

		case 'WAITING_CATEGORY': {
			const category = capitalize(ctx.message.text.trim());
			console.log(category)
			const categoryData = await getCategoryUseCase('category_name', category);
			console.log(categoryData)

			if (!categoryData) {
				await ctx.reply('❌ Categoría no encontrada. Intenta nuevamente.');
				return;
			}

			session.categoryId = categoryData.id;
			session.step = 'WAITING_ACCOUNT_DATA';

			await ctx.reply('✉️ Envía los datos de la cuenta con este formato:\n\n`correo contraseña perfil pin XXXX Válido hasta DD/MM/YYYY hh:mm am/pm -05\nCliente : Nombre`', { parse_mode: 'Markdown' });
			break;
		}

		case 'WAITING_ACCOUNT_DATA': {
			const regex = /(.*?)\s+(\S+)\s+(\d+)\s+pin\s+(\d+)\s+Válido hasta\s+(.*?)\s*Cliente\s*:\s*(.*)/i;
			const match = ctx.message.text.match(regex);

			if (!match) {
				await ctx.reply('⚠ Formato no reconocido. Por favor sigue el ejemplo correctamente.');
				return;
			}

			const [_, email, password, profile, pin, expiration, clientName] = match;

			const userData = await useCaseSpecificDataUser('name_user', clientName.trim());
			session.accountData = { email, password, profile, pin, expiration, clientName };

			if (userData.empty) {
				session.step = 'WAITING_NEW_USER';
				await ctx.reply(`👤 El cliente "${clientName}" no existe.\nPor favor envíame su teléfono y correo con este formato:\n\n📞 3001234567 📧 cliente@ejemplo.com`);
				return;
			}

			// si existe, crea cuenta directamente
			const newAccount = await createNewAccountUseCase({
				email_account: email,
				pass_account: password,
				name_profile: profile,
				code_profile: parseInt(pin, 10),
				expiration_date: expiration,
				id_user: userData.docs[0].data().id,
				id_category: session.categoryId!,
			});


			await ctx.reply(`✅ Cuenta para *${clientName}* creada con éxito.`, { parse_mode: 'Markdown' });
			userSessions[ctx.chat.id] = undefined;
			const plantilla = formatAccountMessage(
				{
					usuario: newAccount.email_account,
					clave: newAccount.pass_account,
					perfil: newAccount.name_profile,
					pin: newAccount.code_profile,
					vence: newAccount.expiration_date,
				}
			);
			await ctx.reply(plantilla, { parse_mode: 'Markdown' });
			break;
		}

		case 'WAITING_NEW_USER': {
			const parts = ctx.message.text.split(/\s+/);
			const phone = parts[0];


			const account = session.accountData;
			if (!account) {
				// If account data is missing, inform user and reset session
				userSessions[ctx.chat.id] = undefined;
				await ctx.reply('❌ Datos de la cuenta faltan. Por favor reinicia el proceso con /crear_cuenta.');
				return;
			}

			const { clientName } = account;

			const newUser = {
				id: uuid(),
				name_user: clientName,
				cellphone_user: phone,
				email_user: null,
			};

			await db.collection('users').add(newUser);

			await createNewAccountUseCase({
				email_account: account.email,
				pass_account: account.password,
				name_profile: account.profile,
				code_profile: parseInt(account.pin, 10),
				expiration_date: account.expiration,
				id_user: newUser.id,
				id_category: session.categoryId!,
			});

			await ctx.reply(`✅ Usuario *${clientName}* y su cuenta fueron creados correctamente.`, { parse_mode: 'Markdown' });
			// Limpia la sesión del usuario
			userSessions[ctx.chat.id] = undefined;
			const plantilla = formatAccountMessage(
				{
					usuario: account.email,
					clave: account.password,
					perfil: account.profile,
					pin: account.pin,
					vence: account.expiration,
				}
			);
			await ctx.reply(plantilla, { parse_mode: 'Markdown' });


			break;
		}

		case 'WAITING_ACCOUNT_GARANTY': {
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


			const plantilla = formatAccountMessage(
				{
					usuario: newEmail,
					clave: newPassword,
					perfil: newProfile,
					pin: newPin,
					vence: newExpiration,
				}
			);

			console.log(newEmail)
			await ctx.reply(`✅ La cuenta *${newEmail}* ha sido actualizada exitosamente.`, { parse_mode: 'Markdown' });

			await ctx.reply(plantilla, { parse_mode: 'Markdown' });
			userSessions[ctx.chat.id] = undefined;
			break;
		}

		case 'WAITTING_EMAILTO_UPDATE_ACCOUNT': {
			await ctx.reply('Ingresa por favor el correo de la cuenta a actualizar')
			const email_account = ctx.message.text
			const account = await getSpecificAccountUseCase('email_account', email_account)

			if (account.exists) {
				const accountData = account.data() as Account
				userSessions[ctx.chat.id] = {step:'WAITTING_UPDATE_ACCOUNT',accountData: {
					id: accountData.id,
					idUser: accountData.id_user,
					idCategory: accountData.id_category,
					clientName:'',
					email: accountData.email_account,
					expiration: accountData.expiration_date,
					password: accountData.pass_account,
					pin: accountData.code_profile.toString(),
					profile: accountData.name_profile
				}}
			}

          
			userSessions[ctx.chat.id] = {step:'WAITTING_EMAILTO_UPDATE_ACCOUNT'}

			break

		}

		case 'WAITTING_UPDATE_ACCOUNT':{
			await ctx.reply('Envia por favor la informacion de la cuenta a actualizar')
			const account = session.accountData!
			const AccountRaw = parseAccountText(ctx.message.text)
			const newAccount:Account = {
				id: account.id!,
				id_user: account.idUser!,
				id_category: account.idCategory!,
				code_profile: AccountRaw?.pin ? parseInt(AccountRaw.pin):0,
				email_account: AccountRaw?.email ?? '',
				expiration_date: AccountRaw?.rawExpire ?? '',
				name_profile: AccountRaw?.profile ?? '',
				pass_account: AccountRaw?.password ?? ''


			}

			const responseAccount = await updateAccountUseCase(account.id!, newAccount )
			const newTemplate = await updateTemplateFromObject(ctx.message.text, responseAccount)
			await ctx.reply(newTemplate, {parse_mode:'Markdown'})

		}




		}
		bot.telegram.setMyCommands([
			{ command: 'crear_cuenta', description: 'Crear una nueva cuenta' },
			{ command: 'actualizar_cuenta', description: 'Ver todas las cuentas' },
			{ command: 'listar_cuentas', description: 'Ver todas las cuentas' },
			{ command: 'garantia', description: 'actualizar cuenta  por garantia' },
			{ command: 'buscar_cuentas', description: 'Buscar cuentas por correo o cliente' },
			{ command: 'proximos_vencer', description: 'Proximas cuentas a vencer' },
			{ command: 'cancelar', description: 'Cancelar el proceso actual' },
			{ command: 'ayuda', description: 'Mostrar los comandos disponibles' },
		]);
		userSessions[ctx.chat.id] = undefined;
	});


	




}