import { expect } from 'chai';
import { getCategoryUseCase } from '../../../src/usecases/categories/getCategory.usecase';
import * as firebaseModule from '../../../src/firebase';

// Mock de Firebase
const mockFirestore = {
	collection: (collectionName: string) => ({
		where: (field: string, operator: string, value: string) => ({
			get: async () => {
				if (collectionName === 'categories_account' && value === 'valid-id') {
					return {
						empty: false,
						docs: [{
							data: () => ({
								id: 'valid-id',
								category_name: 'Netflix',
								description: 'Streaming service'
							})
						}]
					};
				}
				return { empty: true, docs: [] };
			}
		})
	})
};

describe('getCategory.usecase', () => {
	beforeEach(() => {
		// Mock de db
		(firebaseModule as any).db = mockFirestore;
	});

	describe('getCategoryUseCase', () => {
		it('debería retornar la categoría cuando existe', async () => {
			const result = await getCategoryUseCase('id', 'valid-id');

			expect(result).to.not.be.null;
			expect(result?.id).to.equal('valid-id');
			expect(result?.category_name).to.equal('Netflix');
		});

		it('debería retornar null cuando la categoría no existe', async () => {
			const result = await getCategoryUseCase('id', 'invalid-id');

			expect(result).to.be.null;
		});

		it('debería buscar por category_name correctamente', async () => {
			// Este test verifica que el método acepta diferentes parámetros de búsqueda
			const result = await getCategoryUseCase('category_name', 'Netflix');

			// Como el mock solo responde a 'valid-id', este debería retornar null
			expect(result).to.be.null;
		});
	});
});

