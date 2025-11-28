import { expect } from 'chai';
import { resetSession, getSession, setSession } from '../../src/bot/bot.session';
import { BotStep } from '../../src/bot/bot.types';

describe('bot.session', () => {
	beforeEach(() => {
		// Limpiar sesiones antes de cada test
		resetSession(1);
		resetSession(2);
	});

	describe('setSession y getSession', () => {
		it('debería establecer y obtener una sesión correctamente', () => {
			const chatId = 12345;
			const session = { step: BotStep.WAITING_CATEGORY };

			setSession(chatId, session);
			const retrieved = getSession(chatId);

			expect(retrieved).to.deep.equal(session);
		});

		it('debería retornar undefined para una sesión que no existe', () => {
			const retrieved = getSession(99999);
			expect(retrieved).to.be.undefined;
		});

		it('debería actualizar una sesión existente', () => {
			const chatId = 12345;
			const session1 = { step: BotStep.WAITING_CATEGORY };
			const session2 = { step: BotStep.WAITING_ACCOUNT_GARANTY };

			setSession(chatId, session1);
			setSession(chatId, session2);

			const retrieved = getSession(chatId);
			expect(retrieved).to.deep.equal(session2);
		});

		it('debería manejar múltiples sesiones independientes', () => {
			const chatId1 = 11111;
			const chatId2 = 22222;
			const session1 = { step: BotStep.WAITING_CATEGORY };
			const session2 = { step: BotStep.WAITING_SEARCH_ACCOUNT };

			setSession(chatId1, session1);
			setSession(chatId2, session2);

			expect(getSession(chatId1)).to.deep.equal(session1);
			expect(getSession(chatId2)).to.deep.equal(session2);
		});
	});

	describe('resetSession', () => {
		it('debería eliminar una sesión existente', () => {
			const chatId = 12345;
			const session = { step: BotStep.WAITING_CATEGORY };

			setSession(chatId, session);
			expect(getSession(chatId)).to.exist;

			resetSession(chatId);
			expect(getSession(chatId)).to.be.undefined;
		});

		it('debería manejar resetear una sesión que no existe sin errores', () => {
			expect(() => resetSession(99999)).to.not.throw();
		});

		it('no debería afectar otras sesiones al resetear una', () => {
			const chatId1 = 11111;
			const chatId2 = 22222;
			const session1 = { step: BotStep.WAITING_CATEGORY };
			const session2 = { step: BotStep.WAITING_SEARCH_ACCOUNT };

			setSession(chatId1, session1);
			setSession(chatId2, session2);

			resetSession(chatId1);

			expect(getSession(chatId1)).to.be.undefined;
			expect(getSession(chatId2)).to.deep.equal(session2);
		});
	});
});

