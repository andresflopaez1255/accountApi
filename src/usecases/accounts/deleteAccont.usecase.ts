import { db } from '../../firebase';
import { Account } from '../../Interfaces';
import { useCaseSpecificDataUser } from '../users/specificDataUser.usecase';
import { getSpecificAccountUseCase } from './getSpecificAccount.usecase';


export const deleteAccountUseCase = async (id: string) => {
	
	const accountSnapshot = await getSpecificAccountUseCase(id);


	if (!accountSnapshot) {
		throw new Error('Account not found');
	}

	const accountData = accountSnapshot.data();
	const accountId = accountSnapshot.id;

	
	const user = await useCaseSpecificDataUser('id', accountData.id_user);
	if (!user) {
		throw new Error('User not found');
	}
   
	const userData = user.docs[0].data();
	const userId = user.docs[0].id;
	
	const updatedAccounts =  userData.accounts.filter((acc: Account) => acc.id !== id);

	await db.collection('users').doc(userId).update({
		accounts: updatedAccounts,
	});

	
	await db.collection('accounts').doc(accountId).delete();

	return accountData;
};
