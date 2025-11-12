import { db } from '../../firebase';
import { Account } from '../../Interfaces';
import { useCaseSpecificDataUser } from '../users/specificDataUser.usecase';

export const updateAccountUseCase = async (idAccount:string, account: Account) => {

	await db.collection('accounts').doc(idAccount).update({...account });	

	
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
		
	}

	const result = { ...account };
	return result;
}