import type { UserSession } from './bot.types';

export const userSessions: Record<number, UserSession | undefined> = {};

export const resetSession = (chatId: number): void => {
	userSessions[chatId] = undefined;
};

export const getSession = (chatId: number): UserSession | undefined => {
	return userSessions[chatId];
};

export const setSession = (chatId: number, session: UserSession): void => {
	userSessions[chatId] = session;
};

