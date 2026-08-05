import type { UserSession } from './bot.types';

export const userSessions: Record<number, UserSession | undefined> = {};

export const resetSession = (chatId: number): void => {
	userSessions[chatId] = undefined;
};

export const getSession = (chatId: number): UserSession | undefined => {
	const session = userSessions[chatId];
	if (session?.expiresAt && session.expiresAt < Date.now()) {
		resetSession(chatId);
		return undefined;
	}
	return session;
};

export const setSession = (chatId: number, session: UserSession): void => {
	userSessions[chatId] = { ...session, createdAt: session.createdAt || Date.now(), expiresAt: Date.now() + 20 * 60 * 1000 };
};
