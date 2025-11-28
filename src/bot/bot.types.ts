export type UserAccountData = {
	idDoc?: string
	id?: string
	idUser?: string
	idCategory?: string
	email: string;
	password: string;
	profile: string;
	pin: string;
	expiration: string;
	clientName: string;
};

export enum BotStep {
	WAITING_CATEGORY = 'WAITING_CATEGORY',
	WAITING_ACCOUNT_DATA = 'WAITING_ACCOUNT_DATA',
	WAITING_VALIDATE_USER = 'WAITING_VALIDATE_USER',
	WAITING_NEW_USER = 'WAITING_NEW_USER',
	WAITING_ACCOUNT_GARANTY = 'WAITING_ACCOUNT_GARANTY',
	WAITING_EMAIL_GARANTY = 'WAITING_EMAIL_GARANTY',
	WAITING_SEARCH_ACCOUNT = 'WAITING_SEARCH_ACCOUNT',
	WAITING_EMAIL_TO_UPDATE_ACCOUNT = 'WAITING_EMAIL_TO_UPDATE_ACCOUNT',
	WAITING_UPDATE_ACCOUNT = 'WAITING_UPDATE_ACCOUNT',
}

export type UserSession = {
	step: BotStep;
	categoryId?: string;
	accountData?: UserAccountData;
};

export type AccountTemplatePayload = {
	email_account: string;
	pass_account: string;
	name_profile: string;
	code_profile: number | string;
	expiration_date: string;
};

