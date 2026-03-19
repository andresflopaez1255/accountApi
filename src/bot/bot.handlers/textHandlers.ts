/* eslint-disable @typescript-eslint/no-non-null-assertion */
import type { Context } from 'telegraf';
import { v4 as uuid } from 'uuid';
import { Account } from '../../Interfaces';
import { db } from '../../firebase';
import { getCategoryUseCase } from '../../usecases/categories/getCategory.usecase';
import { createNewAccountUseCase } from '../../usecases/accounts/createNewAccount.usecase';
import { getSpecificAccountUseCase } from '../../usecases/accounts/getSpecificAccount.usecase';
import { seacrhDataAccountsUseCase } from '../../usecases/accounts/searchDataAccounts.usecase';
import { updateAccountUseCase } from '../../usecases/accounts/updateAccount.usecase';
import { useCaseSpecificDataUser } from '../../usecases/users/specificDataUser.usecase';
import { capitalize } from '../../utils/capitalizeString';
import { parseAccountText, updateTemplateFromObject } from '../../utils/parseAccountsData';
import { ACCOUNT_FORMAT_MESSAGE, BOT_MESSAGES } from '../bot.constants';
import { resetSession, setSession } from '../bot.session';
import { BotStep, UserSession } from '../bot.types';
import {
	formatAccountsListMessage,
	parseContactData,
	replyMarkdown,
	replyWithAccountTemplate,
} from '../bot.utils';

type BotTextHandler = (ctx: Context, session: UserSession, text: string) => Promise<void>;

const saveSessionStep = (chatId: number, session: UserSession, step: BotStep): void => {
	session.step = step;
	setSession(chatId, session);
};

const createAccountFromSession = (
	session: UserSession,
	userId: string,
	overrides?: Partial<Account>
): Account => {
	const account = session.accountData!;

	return {
		email_account: account.email,
		pass_account: account.password,
		name_profile: account.profile,
		code_profile: parseInt(account.pin, 10),
		expiration_date: account.expiration,
		id_user: userId,
		id_category: session.categoryId!,
		...overrides,
	};
};

const handleWaitingEmailGaranty: BotTextHandler = async (ctx, session) => {
	saveSessionStep(ctx.chat!.id, session, BotStep.WAITING_ACCOUNT_GARANTY);
	await replyMarkdown(ctx, BOT_MESSAGES.warrantyExtensionPrompt);
};

const handleWaitingSearchAccount: BotTextHandler = async (ctx, _session, text) => {
	const results = (await seacrhDataAccountsUseCase(text.trim())) as Account[];

	if (results.length === 0) {
		await replyMarkdown(ctx, BOT_MESSAGES.searchNoResults);
		return;
	}

	if (results.length === 1) {
		await replyWithAccountTemplate(ctx, {
			email_account: results[0].email_account,
			pass_account: results[0].pass_account,
			name_profile: results[0].name_profile,
			code_profile: results[0].code_profile,
			expiration_date: results[0].expiration_date,
		});
		resetSession(ctx.chat!.id);
		return;
	}

	await replyMarkdown(ctx, formatAccountsListMessage(results));
	resetSession(ctx.chat!.id);
};

const handleWaitingCategory: BotTextHandler = async (ctx, session, text) => {
	const category = capitalize(text.trim());
	const categoryData = await getCategoryUseCase('category_name', category);

	if (!categoryData) {
		await replyMarkdown(ctx, BOT_MESSAGES.categoryNotFound);
		return;
	}

	session.categoryId = categoryData.id;
	saveSessionStep(ctx.chat!.id, session, BotStep.WAITING_ACCOUNT_DATA);
	await replyMarkdown(ctx, ACCOUNT_FORMAT_MESSAGE);
};

const handleWaitingAccountData: BotTextHandler = async (ctx, session, text) => {
	const parsedAccount = parseAccountText(text);

	if (!parsedAccount?.email || !parsedAccount.password || !parsedAccount.profile || !parsedAccount.pin || !parsedAccount.rawExpire) {
		await replyMarkdown(ctx, BOT_MESSAGES.accountFormatInvalid);
		return;
	}

	session.accountData = {
		email: parsedAccount.email,
		password: parsedAccount.password,
		profile: parsedAccount.profile,
		pin: parsedAccount.pin,
		expiration: parsedAccount.rawExpire,
		clientName: '',
	};

	saveSessionStep(ctx.chat!.id, session, BotStep.WAITING_VALIDATE_USER);
	await replyMarkdown(ctx, BOT_MESSAGES.clientNamePrompt);
};

const handleWaitingValidateUser: BotTextHandler = async (ctx, session, text) => {
	const account = session.accountData;
	if (!account) {
		resetSession(ctx.chat!.id);
		await replyMarkdown(ctx, BOT_MESSAGES.accountDataMissing);
		return;
	}

	const clientName = text.trim();
	if (!clientName) {
		await replyMarkdown(ctx, BOT_MESSAGES.needClientName);
		return;
	}

	session.accountData = { ...account, clientName };
	setSession(ctx.chat!.id, session);

	const userData = await useCaseSpecificDataUser('name_user', clientName);

	if (userData.empty) {
		saveSessionStep(ctx.chat!.id, session, BotStep.WAITING_NEW_USER);
		await replyMarkdown(ctx, `👤 No encuentro a "${clientName}".\n\n${BOT_MESSAGES.userContactPrompt}`);
		return;
	}

	const newAccount = await createNewAccountUseCase(createAccountFromSession(session, userData.docs[0].data().id));
	await replyMarkdown(ctx, BOT_MESSAGES.accountCreated(clientName));
	resetSession(ctx.chat!.id);
	await replyWithAccountTemplate(ctx, newAccount);
};

const handleWaitingNewUser: BotTextHandler = async (ctx, session, text) => {
	const account = session.accountData;
	if (!account) {
		resetSession(ctx.chat!.id);
		await replyMarkdown(ctx, BOT_MESSAGES.accountDataMissing);
		return;
	}

	const contact = parseContactData(text);
	if (!contact) {
		await replyMarkdown(ctx, BOT_MESSAGES.userContactInvalid);
		return;
	}

	const userID = uuid();
	await db.collection('users').add({
		id: userID,
		name_user: account.clientName,
		cellphone_user: contact.phone,
		email_user: contact.email,
	});

	const newAccount = await createNewAccountUseCase(createAccountFromSession(session, userID));
	await replyMarkdown(ctx, BOT_MESSAGES.accountCreated(account.clientName));
	resetSession(ctx.chat!.id);
	await replyWithAccountTemplate(ctx, newAccount);
};

const handleWaitingAccountGaranty: BotTextHandler = async (ctx, _session, text) => {
	const message = text.replace(/[*_]/g, '').replace(/\s+/g, ' ').trim();
	const oldEmailMatch = message.match(/cuenta[_:\s]+([^\s]+)/i);

	if (!oldEmailMatch) {
		await replyMarkdown(ctx, BOT_MESSAGES.warrantyFormatInvalid);
		return;
	}

	const oldEmail = oldEmailMatch[1].trim();
	const accountsSnapshot = await db.collection('accounts').where('email_account', '==', oldEmail).get();

	if (accountsSnapshot.empty) {
		await replyMarkdown(ctx, BOT_MESSAGES.accountNotFoundByEmail(oldEmail));
		return;
	}

	const accountDoc = accountsSnapshot.docs[0];
	const accountData = accountDoc.data() as Account;
	const parsedAccount = parseAccountText(message);

	const updatedAccount: Account = {
		...accountData,
		email_account: parsedAccount?.email || accountData.email_account,
		pass_account: parsedAccount?.password || accountData.pass_account,
		name_profile: parsedAccount?.profile || accountData.name_profile,
		code_profile: parsedAccount?.pin ? parseInt(parsedAccount.pin, 10) : accountData.code_profile,
		expiration_date: parsedAccount?.rawExpire || accountData.expiration_date,
	};

	await updateAccountUseCase(accountData.id!, updatedAccount);
	await replyMarkdown(ctx, BOT_MESSAGES.accountUpdated(updatedAccount.email_account));
	await replyWithAccountTemplate(ctx, {
		email_account: updatedAccount.email_account,
		pass_account: updatedAccount.pass_account,
		name_profile: updatedAccount.name_profile,
		code_profile: updatedAccount.code_profile,
		expiration_date: updatedAccount.expiration_date,
	});
	resetSession(ctx.chat!.id);
};

const handleWaitingUpdateAccount: BotTextHandler = async (ctx, session, text) => {
	const account = session.accountData;
	if (!account) {
		resetSession(ctx.chat!.id);
		await replyMarkdown(ctx, BOT_MESSAGES.accountUpdateMissing);
		return;
	}

	const parsedAccount = parseAccountText(text);
	if (!parsedAccount?.email || !parsedAccount.password || !parsedAccount.profile || !parsedAccount.pin || !parsedAccount.rawExpire) {
		await replyMarkdown(ctx, BOT_MESSAGES.accountFormatInvalid);
		return;
	}

	const newAccount: Account = {
		id: account.id!,
		id_user: account.idUser!,
		id_category: account.idCategory!,
		code_profile: parseInt(parsedAccount.pin, 10),
		email_account: parsedAccount.email,
		expiration_date: parsedAccount.rawExpire,
		name_profile: parsedAccount.profile,
		pass_account: parsedAccount.password,
	};

	const responseAccount = await updateAccountUseCase(account.idDoc!, newAccount);
	await replyMarkdown(ctx, BOT_MESSAGES.accountUpdated(responseAccount.email_account));
	await replyMarkdown(ctx, updateTemplateFromObject(text, responseAccount));
	resetSession(ctx.chat!.id);
};

const handleWaitingEmailToUpdateAccount: BotTextHandler = async (ctx, session, text) => {
	const emailAccount = text.trim();
	if (!emailAccount) {
		await replyMarkdown(ctx, BOT_MESSAGES.accountUpdateNotFound);
		return;
	}

	try {
		const account = await getSpecificAccountUseCase('email_account', emailAccount);
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
			profile: accountData.name_profile,
		};

		saveSessionStep(ctx.chat!.id, session, BotStep.WAITING_UPDATE_ACCOUNT);
		await replyMarkdown(ctx, BOT_MESSAGES.updateDataPrompt);
	} catch (_error) {
		await replyMarkdown(ctx, BOT_MESSAGES.accountUpdateNotFound);
	}
};

const stepHandlers: Record<BotStep, BotTextHandler> = {
	[BotStep.WAITING_EMAIL_GARANTY]: handleWaitingEmailGaranty,
	[BotStep.WAITING_SEARCH_ACCOUNT]: handleWaitingSearchAccount,
	[BotStep.WAITING_CATEGORY]: handleWaitingCategory,
	[BotStep.WAITING_ACCOUNT_DATA]: handleWaitingAccountData,
	[BotStep.WAITING_VALIDATE_USER]: handleWaitingValidateUser,
	[BotStep.WAITING_NEW_USER]: handleWaitingNewUser,
	[BotStep.WAITING_ACCOUNT_GARANTY]: handleWaitingAccountGaranty,
	[BotStep.WAITING_UPDATE_ACCOUNT]: handleWaitingUpdateAccount,
	[BotStep.WAITING_EMAIL_TO_UPDATE_ACCOUNT]: handleWaitingEmailToUpdateAccount,
};

export const handleTextMessage = async (ctx: Context, session: UserSession): Promise<void> => {
	if (!ctx.chat || !ctx.message || !('text' in ctx.message)) {
		return;
	}

	const handler = stepHandlers[session.step];
	if (!handler) {
		return;
	}

	await handler(ctx, session, ctx.message.text);
};
