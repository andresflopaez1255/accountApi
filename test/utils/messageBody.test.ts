import { expect } from 'chai';
import messageBody from '../../src/utils/messageBody';

describe('messageBody', () => {
	it('debería crear un objeto con message, status y data', () => {
		const data = { id: 1, name: 'test' };
		const message = 'Operación exitosa';
		const status = true;

		const result = messageBody(data, message, status);

		expect(result).to.have.property('message', message);
		expect(result).to.have.property('status', status);
		expect(result).to.have.property('data', data);
	});

	it('debería manejar datos null', () => {
		const result = messageBody(null, 'Error', false);
		
		expect(result.data).to.be.null;
		expect(result.status).to.be.false;
		expect(result.message).to.equal('Error');
	});

	it('debería manejar arrays como datos', () => {
		const data = [1, 2, 3];
		const result = messageBody(data, 'Lista obtenida', true);
		
		expect(result.data).to.deep.equal(data);
		expect(result.status).to.be.true;
	});

	it('debería manejar strings como datos', () => {
		const data = 'texto de prueba';
		const result = messageBody(data, 'Mensaje', true);
		
		expect(result.data).to.equal(data);
	});
});

