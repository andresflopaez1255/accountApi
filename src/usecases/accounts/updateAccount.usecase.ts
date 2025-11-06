import { db } from '../../firebase';
import { Account } from '../../Interfaces';
import { useCaseSpecificDataUser } from '../users/specificDataUser.usecase';
import { getSpecificAccountUseCase } from './getSpecificAccount.usecase';

export const updateAccountUseCase = async (account: Account) => {

	console.log(account)
	
	// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
	const accountDoc = await getSpecificAccountUseCase(account.id!);

	if (!accountDoc) {
		throw new Error('Account not found');
	}

	const accountId = accountDoc.id;

	// Actualizar la cuenta en la colección de cuentas
	await db.collection('accounts').doc(accountId).update({...account });	

	// Actualizar la cuenta en el array de cuentas del usuario relacionado
	const user = await useCaseSpecificDataUser('id', account.id_user);
	console.log('length....',user.docs.length > 0)

	if (user.docs.length > 0) {
		const userData = user.docs[0].data();
		const accounts = userData.accounts || [];
		const accountIndex = accounts.findIndex((acc: Account) => acc.id === account.id);

		if (accountIndex !== -1) {
			accounts[accountIndex] = { ...accounts[accountIndex], ...account };
			await db.collection('users').doc(user.docs[0].id).update({
				accounts: accounts,
			});
		}
		console.log('ok....')
	}

	const result = { ...account };
	return result;
}