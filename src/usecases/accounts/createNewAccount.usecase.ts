import { db } from '../../firebase';
import { v4 as uuid } from 'uuid';

import { useCaseSpecificDataUser } from '../users/specificDataUser.usecase';
import { getCategoryUseCase } from '../categories/getCategory.usecase';
import { Account } from '../../Interfaces';

export const createNewAccountUseCase = async (account: Account) => {
	const newaccount:Account = { id: uuid(), ...account }
	const categoryID = account.id_category;
	const categoryInfo = await getCategoryUseCase(categoryID);
	await db.collection('accounts').add(newaccount);
	const user = await useCaseSpecificDataUser('id', account.id_user);


	if (user.docs.length > 0) {
		const userData = user.docs[0].data();

		const accounts = userData.accounts || [];
		accounts.push({ ...newaccount, category: categoryInfo?.category_name || null });
		await db.collection('users').doc(user.docs[0].id).update({
			accounts: accounts,
		});
	}
	return newaccount;
}
