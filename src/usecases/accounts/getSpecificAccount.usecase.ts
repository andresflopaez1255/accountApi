import { db } from '../../firebase';

export const getSpecificAccountUseCase = async (accountId: string) => {
	const accountDoc = await db
		.collection('accounts')
		.where('id', '==', accountId)
		.get();

	if (accountDoc.empty) {
		throw new Error('Account not found');
	}

	const accountData = accountDoc.docs[0] ;
	return accountData;
}