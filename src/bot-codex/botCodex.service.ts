import { v4 as uuid } from 'uuid';
import { Account } from '../Interfaces';
import { db } from '../firebase';
import { seacrhDataAccountsUseCase } from '../usecases/accounts/searchDataAccounts.usecase';
import { createNewAccountUseCase } from '../usecases/accounts/createNewAccount.usecase';
import { updateAccountUseCase } from '../usecases/accounts/updateAccount.usecase';
import {
	BotCodexAccountRecord,
	BotCodexCategory,
	BotCodexParsedInput,
	BotCodexRegistrationPayload,
	BotCodexRegistrationResult,
} from './botCodex.types';

type FirestoreDoc = FirebaseFirestore.QueryDocumentSnapshot<FirebaseFirestore.DocumentData>;

const findUserDocument = async (user: BotCodexParsedInput['user']): Promise<FirestoreDoc | null> => {
	const queries = [];

	if (user.email) {
		queries.push(db.collection('users').where('email_user', '==', user.email).limit(1));
	}

	if (user.phone) {
		queries.push(db.collection('users').where('cellphone_user', '==', user.phone).limit(1));
	}

	queries.push(db.collection('users').where('name_user', '==', user.name).limit(1));

	for (const query of queries) {
		const snapshot = await query.get();
		if (!snapshot.empty) {
			return snapshot.docs[0];
		}
	}

	return null;
};

const ensureUser = async (user: BotCodexParsedInput['user']): Promise<string> => {
	const existingUserDoc = await findUserDocument(user);
	if (existingUserDoc) {
		return existingUserDoc.data().id as string;
	}

	const userId = uuid();
	await db.collection('users').add({
		id: userId,
		name_user: user.name,
		cellphone_user: user.phone || '',
		email_user: user.email || '',
	});

	return userId;
};

const findCategoryDocument = async (categoryName: string): Promise<FirestoreDoc | null> => {
	const snapshot = await db
		.collection('categories_account')
		.where('category_name', '==', categoryName)
		.limit(1)
		.get();

	return snapshot.empty ? null : snapshot.docs[0];
};

const ensureCategory = async (categoryName: BotCodexCategory['category_name']): Promise<BotCodexCategory> => {
	const existingCategoryDoc = await findCategoryDocument(categoryName);
	if (existingCategoryDoc) {
		return existingCategoryDoc.data() as BotCodexCategory;
	}

	const category: BotCodexCategory = {
		id: uuid(),
		category_name: categoryName,
	};

	await db.collection('categories_account').add(category);
	return category;
};

const findExistingAccountDocument = async (
	categoryId: string,
	accountEmail: string,
	profileName: string
): Promise<FirestoreDoc | null> => {
	const snapshot = await db
		.collection('accounts')
		.where('id_category', '==', categoryId)
		.where('email_account', '==', accountEmail)
		.get();

	if (snapshot.empty) {
		return null;
	}

	return snapshot.docs.find((doc) => doc.data().name_profile === profileName) || null;
};

export const buildBotCodexRegistrationPayload = async (
	input: BotCodexParsedInput
): Promise<BotCodexRegistrationPayload> => {
	const userId = await ensureUser(input.user);
	const category = await ensureCategory(input.service);

	return {
		userId,
		categoryId: category.id,
		account: {
			email_account: input.accountEmail,
			pass_account: input.accountPassword,
			name_profile: input.profileName,
			code_profile: parseInt(input.pin, 10) || 0,
			expiration_date: input.expirationDate,
			id_user: userId,
			id_category: category.id,
		},
	};
};

export const registerStreamingAccountInFirebase = async (
	input: BotCodexParsedInput
): Promise<BotCodexRegistrationResult> => {
	const payload = await buildBotCodexRegistrationPayload(input);
	const existingAccountDoc = await findExistingAccountDocument(
		payload.categoryId,
		payload.account.email_account,
		payload.account.name_profile
	);

	if (existingAccountDoc) {
		const current = existingAccountDoc.data() as Account;
		const updatedAccount: Account = {
			...current,
			...payload.account,
			id: current.id,
		};

		await updateAccountUseCase(existingAccountDoc.id, updatedAccount);

		return {
			action: 'updated',
			account: updatedAccount,
			userId: payload.userId,
			categoryId: payload.categoryId,
			service: input.service,
			accountType: input.accountType,
		};
	}

	const createdAccount = await createNewAccountUseCase(payload.account);

	return {
		action: 'created',
		account: createdAccount,
		userId: payload.userId,
		categoryId: payload.categoryId,
		service: input.service,
		accountType: input.accountType,
	};
};

export const userExistsForRegistration = async (user: BotCodexParsedInput['user']): Promise<boolean> => {
	const userDoc = await findUserDocument(user);
	return Boolean(userDoc);
};

export const searchStreamingAccounts = async (query: string): Promise<Account[]> => {
	return (await seacrhDataAccountsUseCase(query)) as Account[];
};

export const findAccountRecordsByEmail = async (email: string): Promise<BotCodexAccountRecord[]> => {
	const snapshot = await db.collection('accounts').where('email_account', '==', email).get();

	return snapshot.docs.map((doc) => ({
		docId: doc.id,
		account: doc.data() as Account,
	}));
};

export const findAccountRecord = async (
	email: string,
	profileName?: string
): Promise<BotCodexAccountRecord | null> => {
	const accountRecords = await findAccountRecordsByEmail(email);
	if (accountRecords.length === 0) {
		return null;
	}

	if (!profileName) {
		return accountRecords.length === 1 ? accountRecords[0] : null;
	}

	return accountRecords.find((record) => record.account.name_profile === profileName) || null;
};

export const updateStreamingAccountRecord = async (docId: string, account: Account): Promise<Account> => {
	return updateAccountUseCase(docId, account);
};
