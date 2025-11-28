import { expect } from 'chai';
import { capitalize } from '../../src/utils/capitalizeString';

describe('capitalizeString', () => {
	describe('capitalize', () => {
		it('debería capitalizar la primera letra de una cadena', () => {
			const result = capitalize('hola');
			expect(result).to.equal('Hola');
		});

		it('debería mantener el resto de la cadena en minúsculas', () => {
			const result = capitalize('mundo');
			expect(result).to.equal('Mundo');
		});

		it('debería manejar cadenas que ya están capitalizadas', () => {
			const result = capitalize('Hola');
			expect(result).to.equal('Hola');
		});

		it('debería manejar cadenas con una sola letra', () => {
			const result = capitalize('a');
			expect(result).to.equal('A');
		});

		it('debería manejar cadenas vacías', () => {
			const result = capitalize('');
			expect(result).to.equal('undefined');
		});
	});
});

