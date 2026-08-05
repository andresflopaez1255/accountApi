import { db } from '../../firebase';
import { Account } from '../../Interfaces';
import { useCaseSpecificDataUser } from '../users/specificDataUser.usecase';

export const updateAccountUseCase = async (idAccount:string, account: Account) => {
	const direct = await db.collection('accounts').doc(idAccount).get();
	const snapshot = direct.exists ? direct : await db.collection('accounts').where('id', '==', idAccount).limit(1).get().then((result) => result.docs[0]);
	if (!snapshot || !snapshot.exists) throw new Error('Account not found');
	const accountId = snapshot.id;
	await db.collection('accounts').doc(accountId).update({ ...account, id: snapshot.data()?.id || account.id, updated_at: new Date().toISOString() });

	
	const user = await useCaseSpecificDataUser('id', account.id_user);
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

	const result = { ...account, id: snapshot.data()?.id || account.id };
	return result;
}
