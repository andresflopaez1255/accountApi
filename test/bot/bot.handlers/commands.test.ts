import { expect } from 'chai';
import type { Telegraf } from 'telegraf';
import { registerCommands } from '../../../src/bot/bot.handlers/commands';
import { getSession, resetSession } from '../../../src/bot/bot.session';
import { BotStep } from '../../../src/bot/bot.types';
import * as accountsController from '../../../src/controllers/accounts.controllers';

describe('bot.handlers/commands', () => {
	let mockBot: Partial<Telegraf>;
	let commandHandlers: Map<string, Function>;

	beforeEach(() => {
		commandHandlers = new Map();
		mockBot = {
			command: (command: string, handler: Function) => {
				commandHandlers.set(command, handler);
			}
		};

		// Limpiar sesiones antes de cada test
		resetSession(12345);
	});

	describe('registerCommands', () => {
		it('debería registrar todos los comandos', () => {
			registerCommands(mockBot as Telegraf);

			expect(commandHandlers.has('crear_cuenta')).to.be.true;
			expect(commandHandlers.has('garantia')).to.be.true;
			expect(commandHandlers.has('cancelar')).to.be.true;
			expect(commandHandlers.has('buscar_cuentas')).to.be.true;
			expect(commandHandlers.has('proximos_vencer')).to.be.true;
			expect(commandHandlers.has('actualizar_cuenta')).to.be.true;
		});

		it('debería establecer sesión WAITING_CATEGORY al ejecutar crear_cuenta', async () => {
			registerCommands(mockBot as Telegraf);
			const handler = commandHandlers.get('crear_cuenta');

			const mockCtx = {
				chat: { id: 12345 },
				reply: async () => ({ message_id: 1 })
			} as any;

			await handler!(mockCtx);

			const session = getSession(12345);
			expect(session?.step).to.equal(BotStep.WAITING_CATEGORY);
		});

		it('debería establecer sesión WAITING_ACCOUNT_GARANTY al ejecutar garantia', async () => {
			registerCommands(mockBot as Telegraf);
			const handler = commandHandlers.get('garantia');

			const mockCtx = {
				chat: { id: 12345 },
				reply: async () => ({ message_id: 1 })
			} as any;

			await handler!(mockCtx);

			const session = getSession(12345);
			expect(session?.step).to.equal(BotStep.WAITING_ACCOUNT_GARANTY);
		});

		it('debería resetear sesión al ejecutar cancelar', async () => {
			registerCommands(mockBot as Telegraf);
			
			// Primero establecer una sesión
			const mockCtx1 = {
				chat: { id: 12345 },
				reply: async () => ({ message_id: 1 })
			} as any;

			const crearHandler = commandHandlers.get('crear_cuenta');
			await crearHandler!(mockCtx1);
			expect(getSession(12345)).to.exist;

			// Luego cancelar
			const cancelHandler = commandHandlers.get('cancelar');
			await cancelHandler!(mockCtx1);

			expect(getSession(12345)).to.be.undefined;
		});

		it('debería establecer sesión WAITING_SEARCH_ACCOUNT al ejecutar buscar_cuentas', async () => {
			registerCommands(mockBot as Telegraf);
			const handler = commandHandlers.get('buscar_cuentas');

			const mockCtx = {
				chat: { id: 12345 },
				reply: async () => ({ message_id: 1 })
			} as any;

			await handler!(mockCtx);

			const session = getSession(12345);
			expect(session?.step).to.equal(BotStep.WAITING_SEARCH_ACCOUNT);
		});

		it('debería establecer sesión WAITING_EMAIL_TO_UPDATE_ACCOUNT al ejecutar actualizar_cuenta', async () => {
			registerCommands(mockBot as Telegraf);
			const handler = commandHandlers.get('actualizar_cuenta');

			const mockCtx = {
				chat: { id: 12345 },
				reply: async () => ({ message_id: 1 })
			} as any;

			await handler!(mockCtx);

			const session = getSession(12345);
			expect(session?.step).to.equal(BotStep.WAITING_EMAIL_TO_UPDATE_ACCOUNT);
		});

		it('debería llamar a getAccountsWithDateExpitarion al ejecutar proximos_vencer', async () => {
			registerCommands(mockBot as Telegraf);
			const handler = commandHandlers.get('proximos_vencer');

			let capturedMessage = '';
			const mockAccounts = [
				{
					email_account: 'test@example.com',
					name_profile: 'Perfil1',
					expiration_date: '12/31/2024'
				}
			];

			// Mock de la función
			const originalGetAccounts = accountsController.getAccountsWithDateExpitarion;
			(accountsController as any).getAccountsWithDateExpitarion = async () => mockAccounts;

			const mockCtx = {
				chat: { id: 12345 },
				reply: async (message: string) => {
					capturedMessage = message;
					return { message_id: 1 };
				}
			} as any;

			await handler!(mockCtx);

			expect(capturedMessage).to.include('Cuentas encontradas');
			expect(capturedMessage).to.include('test@example.com');
			expect(getSession(12345)).to.be.undefined; // Debe limpiar la sesión

			// Restaurar
			(accountsController as any).getAccountsWithDateExpitarion = originalGetAccounts;
		});
	});
});

