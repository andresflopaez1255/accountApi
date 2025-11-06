import { db } from '../../firebase';

import { mapAccountWithCatAndUserUseCase } from './mapAccountWithCatAndUser.usecase';

export const getAllAccountsUseCase = async () => {
	const snapshot = await db.collection('accounts').orderBy('expiration_date', 'desc').get();
	const accounts = snapshot.docs.map(doc => doc.data());

	const enrichedAccounts = mapAccountWithCatAndUserUseCase(accounts);

	return enrichedAccounts;
};
