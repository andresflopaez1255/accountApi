import { BotCodexSession } from './botCodex.types';

const sessions: Record<number, BotCodexSession | undefined> = {};

export const getBotCodexSession = (chatId: number): BotCodexSession | undefined => sessions[chatId];

export const setBotCodexSession = (chatId: number, session: BotCodexSession): void => {
	sessions[chatId] = session;
};

export const resetBotCodexSession = (chatId: number): void => {
	sessions[chatId] = undefined;
};
