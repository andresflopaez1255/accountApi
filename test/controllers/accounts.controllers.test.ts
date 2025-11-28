import { expect } from 'chai';
import type { Request, Response } from 'express';
import {
	getAllAccounts,
	addAccount,
	updateAccount,
	deleteAccount,
	searchAccount
} from '../../src/controllers/accounts.controllers';
import * as useCaseModule from '../../src/usecases/accounts/getAllAccounts.usecase';
import * as createAccountModule from '../../src/usecases/accounts/createNewAccount.usecase';
import * as updateAccountModule from '../../src/usecases/accounts/updateAccount.usecase';
import * as deleteAccountModule from '../../src/usecases/accounts/deleteAccont.usecase';
import * as searchAccountModule from '../../src/usecases/accounts/searchDataAccounts.usecase';

describe('accounts.controllers', () => {
	describe('getAllAccounts', () => {
		it('debería retornar 200 con datos cuando hay cuentas', async () => {
			const mockAccounts = [
				{ id: '1', email_account: 'test1@example.com' },
				{ id: '2', email_account: 'test2@example.com' }
			];

			// Mock del use case
			const originalGetAll = useCaseModule.getAllAccountsUseCase;
			(useCaseModule as any).getAllAccountsUseCase = async () => mockAccounts;

			const mockReq = {} as Request;
			const mockRes = {
				setHeader: () => mockRes,
				status: (code: number) => {
					expect(code).to.equal(200);
					return mockRes;
				},
				send: (data: any) => {
					expect(data.status).to.be.true;
					expect(data.data).to.deep.equal(mockAccounts);
					return mockRes;
				}
			} as unknown as Response;

			await getAllAccounts(mockReq, mockRes);

			// Restaurar
			(useCaseModule as any).getAllAccountsUseCase = originalGetAll;
		});

		it('debería retornar 200 con mensaje cuando no hay cuentas', async () => {
			// Mock del use case
			const originalGetAll = useCaseModule.getAllAccountsUseCase;
			(useCaseModule as any).getAllAccountsUseCase = async () => [];

			const mockReq = {} as Request;
			const mockRes = {
				setHeader: () => mockRes,
				status: (code: number) => {
					expect(code).to.equal(200);
					return mockRes;
				},
				send: (data: any) => {
					expect(data.status).to.be.true;
					expect(data.data).to.be.an('array').that.is.empty;
					return mockRes;
				}
			} as unknown as Response;

			await getAllAccounts(mockReq, mockRes);

			// Restaurar
			(useCaseModule as any).getAllAccountsUseCase = originalGetAll;
		});

		it('debería retornar 400 cuando hay un error', async () => {
			// Mock del use case para lanzar error
			const originalGetAll = useCaseModule.getAllAccountsUseCase;
			(useCaseModule as any).getAllAccountsUseCase = async () => {
				throw new Error('Error de base de datos');
			};

			const mockReq = {} as Request;
			const mockRes = {
				setHeader: () => mockRes,
				status: (code: number) => {
					expect(code).to.equal(400);
					return mockRes;
				},
				send: (data: any) => {
					expect(data.status).to.be.false;
					return mockRes;
				}
			} as unknown as Response;

			await getAllAccounts(mockReq, mockRes);

			// Restaurar
			(useCaseModule as any).getAllAccountsUseCase = originalGetAll;
		});
	});

	describe('addAccount', () => {
		it('debería crear una cuenta exitosamente', async () => {
			const mockAccount = {
				email_account: 'test@example.com',
				pass_account: 'password123',
				name_profile: 'Perfil1',
				code_profile: 1234,
				expiration_date: '12/31/2024',
				id_user: 'user1',
				id_category: 'cat1'
			};

			const createdAccount = { id: 'new-id', ...mockAccount };

			// Mock del use case
			const originalCreate = createAccountModule.createNewAccountUseCase;
			(createAccountModule as any).createNewAccountUseCase = async () => createdAccount;

			const mockReq = {
				body: mockAccount
			} as Request;

			const mockRes = {
				setHeader: () => mockRes,
				status: (code: number) => {
					expect(code).to.equal(200);
					return mockRes;
				},
				json: (data: any) => {
					expect(data.status).to.be.true;
					return mockRes;
				}
			} as unknown as Response;

			await addAccount(mockReq, mockRes);

			// Restaurar
			(createAccountModule as any).createNewAccountUseCase = originalCreate;
		});

		it('debería retornar 401 cuando hay un error', async () => {
			// Mock del use case para lanzar error
			const originalCreate = createAccountModule.createNewAccountUseCase;
			(createAccountModule as any).createNewAccountUseCase = async () => {
				throw new Error('Error al crear cuenta');
			};

			const mockReq = {
				body: { email_account: 'test@example.com' }
			} as Request;

			const mockRes = {
				setHeader: () => mockRes,
				status: (code: number) => {
					expect(code).to.equal(401);
					return mockRes;
				},
				json: (data: any) => {
					expect(data.status).to.be.false;
					return mockRes;
				}
			} as unknown as Response;

			await addAccount(mockReq, mockRes);

			// Restaurar
			(createAccountModule as any).createNewAccountUseCase = originalCreate;
		});
	});

	describe('updateAccount', () => {
		it('debería actualizar una cuenta exitosamente', async () => {
			const mockAccount = {
				id: 'account-id',
				email_account: 'updated@example.com',
				pass_account: 'newpassword',
				name_profile: 'Perfil2',
				code_profile: 5678,
				expiration_date: '12/31/2025',
				id_user: 'user1',
				id_category: 'cat1'
			};

			// Mock del use case
			const originalUpdate = updateAccountModule.updateAccountUseCase;
			(updateAccountModule as any).updateAccountUseCase = async () => mockAccount;

			const mockReq = {
				body: mockAccount
			} as Request;

			const mockRes = {
				setHeader: () => mockRes,
				status: (code: number) => {
					expect(code).to.equal(200);
					return mockRes;
				},
				json: (data: any) => {
					expect(data.status).to.be.true;
					return mockRes;
				}
			} as unknown as Response;

			await updateAccount(mockReq, mockRes);

			// Restaurar
			(updateAccountModule as any).updateAccountUseCase = originalUpdate;
		});

		it('debería retornar 400 cuando hay un error', async () => {
			// Mock del use case para lanzar error
			const originalUpdate = updateAccountModule.updateAccountUseCase;
			(updateAccountModule as any).updateAccountUseCase = async () => {
				throw new Error('Error al actualizar');
			};

			const mockReq = {
				body: { id: 'account-id' }
			} as Request;

			const mockRes = {
				setHeader: () => mockRes,
				status: (code: number) => {
					expect(code).to.equal(400);
					return mockRes;
				},
				json: (data: any) => {
					expect(data.status).to.be.false;
					return mockRes;
				}
			} as unknown as Response;

			await updateAccount(mockReq, mockRes);

			// Restaurar
			(updateAccountModule as any).updateAccountUseCase = originalUpdate;
		});
	});

	describe('deleteAccount', () => {
		it('debería eliminar una cuenta exitosamente', async () => {
			const deletedAccount = { id: 'account-id', email_account: 'test@example.com' };

			// Mock del use case
			const originalDelete = deleteAccountModule.deleteAccountUseCase;
			(deleteAccountModule as any).deleteAccountUseCase = async () => deletedAccount;

			const mockReq = {
				query: { id: 'account-id' }
			} as unknown as Request;

			const mockRes = {
				setHeader: () => mockRes,
				status: (code: number) => {
					expect(code).to.equal(200);
					return mockRes;
				},
				json: (data: any) => {
					expect(data.status).to.be.true;
					return mockRes;
				}
			} as unknown as Response;

			await deleteAccount(mockReq, mockRes);

			// Restaurar
			(deleteAccountModule as any).deleteAccountUseCase = originalDelete;
		});

		it('debería retornar 400 cuando hay un error', async () => {
			// Mock del use case para lanzar error
			const originalDelete = deleteAccountModule.deleteAccountUseCase;
			(deleteAccountModule as any).deleteAccountUseCase = async () => {
				throw new Error('Error al eliminar');
			};

			const mockReq = {
				query: { id: 'account-id' }
			} as unknown as Request;

			const mockRes = {
				setHeader: () => mockRes,
				status: (code: number) => {
					expect(code).to.equal(400);
					return mockRes;
				},
				json: (data: any) => {
					expect(data.status).to.be.false;
					return mockRes;
				}
			} as unknown as Response;

			await deleteAccount(mockReq, mockRes);

			// Restaurar
			(deleteAccountModule as any).deleteAccountUseCase = originalDelete;
		});
	});

	describe('searchAccount', () => {
		it('debería buscar cuentas exitosamente', async () => {
			const mockResults = [
				{ id: '1', email_account: 'test@example.com' }
			];

			// Mock del use case
			const originalSearch = searchAccountModule.seacrhDataAccountsUseCase;
			(searchAccountModule as any).seacrhDataAccountsUseCase = async () => mockResults;

			const mockReq = {
				query: { q: 'test' }
			} as unknown as Request;

			const mockRes = {
				setHeader: () => mockRes,
				status: (code: number) => {
					expect(code).to.equal(200);
					return mockRes;
				},
				json: (data: any) => {
					expect(data.status).to.be.true;
					expect(data.data).to.deep.equal(mockResults);
					return mockRes;
				}
			} as unknown as Response;

			await searchAccount(mockReq, mockRes);

			// Restaurar
			(searchAccountModule as any).seacrhDataAccountsUseCase = originalSearch;
		});

		it('debería retornar 400 cuando hay un error', async () => {
			// Mock del use case para lanzar error
			const originalSearch = searchAccountModule.seacrhDataAccountsUseCase;
			(searchAccountModule as any).seacrhDataAccountsUseCase = async () => {
				throw new Error('Error en búsqueda');
			};

			const mockReq = {
				query: { q: 'test' }
			} as unknown as Request;

			const mockRes = {
				setHeader: () => mockRes,
				status: (code: number) => {
					expect(code).to.equal(400);
					return mockRes;
				},
				json: (data: any) => {
					expect(data.status).to.be.false;
					return mockRes;
				}
			} as unknown as Response;

			await searchAccount(mockReq, mockRes);

			// Restaurar
			(searchAccountModule as any).seacrhDataAccountsUseCase = originalSearch;
		});
	});
});

