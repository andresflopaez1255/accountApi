import { expect } from 'chai';
import { generateCode } from '../../src/utils/codeGenerator';

describe('codeGenerator', () => {
	describe('generateCode', () => {
		it('debería generar un código de 5 caracteres', () => {
			const code = generateCode();
			expect(code).to.have.lengthOf(5);
		});

		it('debería generar códigos diferentes en múltiples llamadas', () => {
			// Aunque es posible que sean iguales por azar, es muy improbable
			// Probamos varias veces para aumentar la confianza
			const codes = Array.from({ length: 10 }, () => generateCode());
			const uniqueCodes = new Set(codes);
			expect(uniqueCodes.size).to.be.greaterThan(1);
		});

		it('debería generar códigos que solo contengan caracteres válidos', () => {
			const validChars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
			const code = generateCode();
			
			for (const char of code) {
				expect(validChars).to.include(char, `El carácter '${char}' no es válido`);
			}
		});

		it('no debería incluir caracteres confusos como I, O, 0, 1', () => {
			const code = generateCode();
			const invalidChars = ['I', 'O', '0', '1'];
			
			for (const char of invalidChars) {
				expect(code).to.not.include(char, `El código no debería contener '${char}'`);
			}
		});
	});
});

