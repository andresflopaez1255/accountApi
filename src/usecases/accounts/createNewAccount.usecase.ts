import { db } from '../../firebase';
import { v4 as uuid } from 'uuid';

import { useCaseSpecificDataUser } from '../users/specificDataUser.usecase';
import { getCategoryUseCase } from '../categories/getCategory.usecase';
import { Account } from '../../Interfaces';

export const createNewAccountUseCase = async (account: Account) => {
	const newaccount: Account & { id: string } = { ...account, id: uuid() };
	const categoryID = account.id_category;
	const categoryInfo = await getCategoryUseCase('id', categoryID);
	const accountRef = db.collection('accounts').doc(newaccount.id);
	const user = await useCaseSpecificDataUser('id', account.id_user);


	if (user.docs.length > 0) {
		const userData = user.docs[0].data();

		const accounts = userData.accounts || [];
		accounts.push({ ...newaccount, category: categoryInfo?.category_name || null });
		const batch = db.batch();
		batch.set(accountRef, { ...newaccount, created_at: new Date().toISOString() });
		batch.update(db.collection('users').doc(user.docs[0].id), {
			accounts: accounts,
		});
		await batch.commit();
	} else {
		throw new Error('User not found');
	}
	return newaccount;
}
