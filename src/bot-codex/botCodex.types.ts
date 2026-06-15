import { Account } from '../Interfaces';

export const SUPPORTED_STREAMING_SERVICES = [
	'Netflix',
	'Amazon',
	'Disney',
	'Crunchyroll',
] as const;

export type SupportedStreamingService = typeof SUPPORTED_STREAMING_SERVICES[number];

export type BotCodexAccountType = 'FULL_ACCOUNT' | 'PROFILE_ACCOUNT';

export type BotCodexUserInput = {
	name: string;
	email?: string;
	phone?: string;
};

export type BotCodexParsedInput = {
	service: SupportedStreamingService;
	accountType: BotCodexAccountType;
	user: BotCodexUserInput;
	accountEmail: string;
	accountPassword: string;
	profileName: string;
	pin: string;
	expirationDate: string;
};

export type BotCodexCategory = {
	id: string;
	category_name: SupportedStreamingService;
};

export type BotCodexRegistrationPayload = {
	userId: string;
	categoryId: string;
	account: Account;
};

export type BotCodexRegistrationResult = {
	action: 'created' | 'updated';
	account: Account;
	userId: string;
	categoryId: string;
	service: SupportedStreamingService;
	accountType: BotCodexAccountType;
};

export type BotCodexDraftAccount = {
	accountEmail: string;
	accountPassword: string;
	profileName: string;
	pin: string;
	expirationDate: string;
};

export enum BotCodexStep {
	WAITING_CREATE_TEMPLATE = 'WAITING_CREATE_TEMPLATE',
	WAITING_CREATE_COMPLEMENT = 'WAITING_CREATE_COMPLEMENT',
	WAITING_CREATE_PHONE = 'WAITING_CREATE_PHONE',
	WAITING_SEARCH_QUERY = 'WAITING_SEARCH_QUERY',
	WAITING_UPDATE_LOOKUP = 'WAITING_UPDATE_LOOKUP',
	WAITING_UPDATE_TEMPLATE = 'WAITING_UPDATE_TEMPLATE',
	WAITING_WARRANTY_LOOKUP = 'WAITING_WARRANTY_LOOKUP',
	WAITING_WARRANTY_DATA = 'WAITING_WARRANTY_DATA',
}

export type BotCodexAccountRecord = {
	docId: string;
	account: Account;
};

export type BotCodexSession = {
	step: BotCodexStep;
	targetAccount?: BotCodexAccountRecord;
	draftAccount?: BotCodexDraftAccount;
	pendingInput?: BotCodexParsedInput;
};
