import { expect } from 'chai';
import type { Context } from 'telegraf';
import { replyMarkdown, replyWithAccountTemplate } from '../../src/bot/bot.utils';

describe('bot.utils', () => {
	describe('replyMarkdown', () => {
		it('debería llamar a ctx.reply con el mensaje y parse_mode Markdown', async () => {
			const mockReply = async (message: string, options?: any) => {
				expect(message).to.equal('*Hola* mundo');
				expect(options?.parse_mode).to.equal('Markdown');
				return { message_id: 1 } as any;
			};

			const mockCtx = {
				reply: mockReply
			} as unknown as Context;

			await replyMarkdown(mockCtx, '*Hola* mundo');
		});

		it('debería manejar mensajes sin formato markdown', async () => {
			let capturedMessage = '';
			const mockReply = async (message: string) => {
				capturedMessage = message;
				return { message_id: 1 } as any;
			};

			const mockCtx = {
				reply: mockReply
			} as unknown as Context;

			await replyMarkdown(mockCtx, 'Mensaje simple');
			expect(capturedMessage).to.equal('Mensaje simple');
		});
	});

	describe('replyWithAccountTemplate', () => {
		it('debería formatear y enviar un mensaje de cuenta correctamente', async () => {
			let capturedMessage = '';
			const mockReply = async (message: string) => {
				capturedMessage = message;
				return { message_id: 1 } as any;
			};

			const mockCtx = {
				reply: mockReply
			} as unknown as Context;

			const account = {
				email_account: 'test@example.com',
				pass_account: 'password123',
				name_profile: 'Perfil1',
				code_profile: 1234,
				expiration_date: '12/31/2024'
			};

			await replyWithAccountTemplate(mockCtx, account);

			expect(capturedMessage).to.include('test@example.com');
			expect(capturedMessage).to.include('password123');
			expect(capturedMessage).to.include('Perfil1');
			expect(capturedMessage).to.include('1234');
			expect(capturedMessage).to.include('12/31/2024');
			expect(capturedMessage).to.include('Reglas para mantener la garantía');
		});

		it('debería manejar PIN vacío correctamente', async () => {
			let capturedMessage = '';
			const mockReply = async (message: string) => {
				capturedMessage = message;
				return { message_id: 1 } as any;
			};

			const mockCtx = {
				reply: mockReply
			} as unknown as Context;

			const account = {
				email_account: 'test@example.com',
				pass_account: 'password123',
				name_profile: 'Perfil1',
				code_profile: '',
				expiration_date: '12/31/2024'
			};

			await replyWithAccountTemplate(mockCtx, account);

			expect(capturedMessage).to.include('test@example.com');
			expect(capturedMessage).to.include('PIN:');
		});

		it('debería manejar PIN como string', async () => {
			let capturedMessage = '';
			const mockReply = async (message: string) => {
				capturedMessage = message;
				return { message_id: 1 } as any;
			};

			const mockCtx = {
				reply: mockReply
			} as unknown as Context;

			const account = {
				email_account: 'test@example.com',
				pass_account: 'password123',
				name_profile: 'Perfil1',
				code_profile: '5678',
				expiration_date: '12/31/2024'
			};

			await replyWithAccountTemplate(mockCtx, account);

			expect(capturedMessage).to.include('5678');
		});
	});
});

