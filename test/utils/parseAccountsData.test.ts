import { expect } from 'chai';
import { formatAccountMessage, parseAccountText, updateTemplateFromObject } from '../../src/utils/parseAccountsData';
import { Account } from '../../src/Interfaces';

describe('parseAccountsData', () => {
	describe('formatAccountMessage', () => {
		it('debería formatear un mensaje de cuenta correctamente', () => {
			const data = {
				usuario: 'test@example.com',
				clave: 'password123',
				perfil: 'Perfil1',
				pin: '1234',
				vence: '12/31/2024'
			};

			const result = formatAccountMessage(data);

			expect(result).to.include('Usuario:');
			expect(result).to.include('test@example.com');
			expect(result).to.include('Clave:');
			expect(result).to.include('password123');
			expect(result).to.include('Perfil:');
			expect(result).to.include('Perfil1');
			expect(result).to.include('PIN:');
			expect(result).to.include('1234');
			expect(result).to.include('Vence:');
			expect(result).to.include('12/31/2024');
			expect(result).to.include('Reglas para mantener la garantía');
		});

		it('debería manejar PIN vacío', () => {
			const data = {
				usuario: 'test@example.com',
				clave: 'password123',
				perfil: 'Perfil1',
				pin: '',
				vence: '12/31/2024'
			};

			const result = formatAccountMessage(data);
			expect(result).to.include('PIN:');
		});
	});

	describe('parseAccountText', () => {
		it('debería parsear un texto de cuenta correctamente', () => {
			const text = `
				Correo: test@example.com
				Clave: password123
				Perfil # p1
				pin: 1234
				Vence: 12/31/2024
			`;

			const result = parseAccountText(text);

			expect(result).to.not.be.null;
			expect(result?.email).to.equal('test@example.com');
			expect(result?.password).to.equal('password123');
			expect(result?.profile).to.equal('p1');
			expect(result?.pin).to.equal('1234');
			expect(result?.rawExpire).to.equal('12/31/2024');
		});

		it('debería retornar null para texto no válido', () => {
			const result = parseAccountText(null as any);
			expect(result).to.be.null;
		});

		it('debería parsear fecha con formato de 2 dígitos en el año', () => {
			const text = 'Vence: 12/31/24';
			const result = parseAccountText(text);

			expect(result?.rawExpire).to.equal('12/31/24');
			expect(result?.expireISO).to.equal('2024-12-31');
		});

		it('debería manejar campos opcionales faltantes', () => {
			const text = 'Correo: test@example.com\nClave: password123';
			const result = parseAccountText(text);

			expect(result?.email).to.equal('test@example.com');
			expect(result?.password).to.equal('password123');
			expect(result?.profile).to.be.null;
			expect(result?.pin).to.be.null;
		});
	});

	describe('updateTemplateFromObject', () => {
		it('debería actualizar un template con datos de cuenta', () => {
			const template = `
				Correo: old@example.com
				Clave: oldpass
				Perfil # oldprofile
				pin: 0000
				Vence: 01/01/2024
			`;

			const account: Account = {
				id: '1',
				email_account: 'new@example.com',
				pass_account: 'newpass',
				name_profile: 'newprofile',
				code_profile: 1234,
				expiration_date: '12/31/2024',
				id_category: 'cat1',
				id_user: 'user1'
			};

			const result = updateTemplateFromObject(template, account);

			expect(result).to.include('new@example.com');
			expect(result).to.include('newpass');
			expect(result).to.include('newprofile');
			expect(result).to.include('1234');
			expect(result).to.include('12/31/2024');
		});

		it('debería agregar perfil si no existe en el template', () => {
			const template = 'Correo: test@example.com\nVence: 12/31/2024';
			const account: Account = {
				id: '1',
				email_account: 'test@example.com',
				pass_account: 'pass',
				name_profile: 'newprofile',
				code_profile: 0,
				expiration_date: '12/31/2024',
				id_category: 'cat1',
				id_user: 'user1'
			};

			const result = updateTemplateFromObject(template, account);
			expect(result).to.include('newprofile');
		});

		it('debería manejar campos vacíos sin actualizar', () => {
			const template = 'Correo: test@example.com\nClave: pass';
			const account: Account = {
				id: '1',
				email_account: 'test@example.com',
				pass_account: 'pass',
				name_profile: '',
				code_profile: 0,
				expiration_date: '12/31/2024',
				id_category: 'cat1',
				id_user: 'user1'
			};

			const result = updateTemplateFromObject(template, account);
			// No debería agregar perfil si está vacío
			expect(result).to.not.include('Perfil');
		});
	});
});

