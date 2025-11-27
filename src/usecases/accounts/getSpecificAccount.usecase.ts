import { db } from '../../firebase';

export const getSpecificAccountUseCase = async (searchQuery:string, queryParams: string) => {
	console.log('queryy params',queryParams)
	const accountDoc = await db
		.collection('accounts')
		.where(searchQuery, '==', queryParams)
		.get();

	if (accountDoc.empty) {
		throw new Error('Account not found');
	}

	const accountData = accountDoc.docs[0] ;
	return accountData;
}