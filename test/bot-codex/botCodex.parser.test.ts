import { expect } from 'chai';
import {
	normalizeAccountType,
	normalizeStreamingService,
	parseBotCodexInput,
} from '../../src/bot-codex/botCodex.parser';

describe('bot-codex.parser', () => {
	describe('normalizeStreamingService', () => {
		it('debería normalizar aliases de servicios soportados', () => {
			expect(normalizeStreamingService('netflix')).to.equal('Netflix');
			expect(normalizeStreamingService('Amazon Prime')).to.equal('Amazon');
			expect(normalizeStreamingService('Disney Plus')).to.equal('Disney');
			expect(normalizeStreamingService('chruncryroll')).to.equal('Crunchyroll');
		});

		it('debería retornar null para servicios no soportados', () => {
			expect(normalizeStreamingService('HBO')).to.be.null;
		});
	});

	describe('normalizeAccountType', () => {
		it('debería normalizar cuenta completa y perfil', () => {
			expect(normalizeAccountType('cuenta')).to.equal('FULL_ACCOUNT');
			expect(normalizeAccountType('perfil')).to.equal('PROFILE_ACCOUNT');
		});
	});

	describe('parseBotCodexInput', () => {
		it('debería parsear una cuenta completa', () => {
			const result = parseBotCodexInput([
				'servicio: netflix',
				'tipo: cuenta',
				'cliente: Juan Perez',
				'correo_cuenta: cuenta@stream.com',
				'clave: 123456',
				'vence: 26/12/2025',
			].join('\n'));

			expect(result).to.not.be.null;
			expect(result?.service).to.equal('Netflix');
			expect(result?.accountType).to.equal('FULL_ACCOUNT');
			expect(result?.profileName).to.equal('CUENTA_COMPLETA');
			expect(result?.pin).to.equal('0');
			expect(result?.user.phone).to.be.undefined;
			expect(result?.user.email).to.be.undefined;
		});

		it('debería parsear una cuenta por perfil', () => {
			const result = parseBotCodexInput([
				'servicio: chruncryroll',
				'tipo: perfil',
				'cliente: Maria Perez',
				'correo_cuenta: crunchy@stream.com',
				'clave: abc123',
				'perfil: anime4',
				'pin: 7788',
				'vence: 26/12/2025',
			].join('\n'));

			expect(result).to.not.be.null;
			expect(result?.service).to.equal('Crunchyroll');
			expect(result?.accountType).to.equal('PROFILE_ACCOUNT');
			expect(result?.profileName).to.equal('anime4');
			expect(result?.pin).to.equal('7788');
		});

		it('debería retornar null si falta perfil en una cuenta tipo perfil', () => {
			const result = parseBotCodexInput([
				'servicio: disney',
				'tipo: perfil',
				'cliente: Maria Perez',
				'correo_cuenta: disney@stream.com',
				'clave: abc123',
				'vence: 26/12/2025',
			].join('\n'));

			expect(result).to.be.null;
		});

		it('debería conservar teléfono si viene informado', () => {
			const result = parseBotCodexInput([
				'servicio: netflix',
				'tipo: cuenta',
				'cliente: Juan Perez',
				'telefono: 3001234567',
				'correo_cuenta: cuenta@stream.com',
				'clave: 123456',
				'vence: 26/12/2025',
			].join('\n'));

			expect(result?.user.phone).to.equal('3001234567');
		});
	});
});
