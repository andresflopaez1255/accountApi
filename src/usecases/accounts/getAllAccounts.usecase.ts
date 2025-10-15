import { db } from '../../firebase';
import { useCaseSpecificDataUser } from '../users/specificDataUser.usecase';
import { getCategoryUseCase } from '../categories/getCategory.usecase';

export const getAllAccountsUseCase = async () => {
	const snapshot = await db.collection('accounts').get();
	const accounts = snapshot.docs.map(doc => doc.data());

	const enrichedAccounts = await Promise.all(
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		accounts.map(async (account: any) => {
			const userInfo = await useCaseSpecificDataUser('id', account.id_user);
			const categoryData = await getCategoryUseCase(account.id_category);
			

			const userData = userInfo.empty ? null : userInfo.docs[0].data();
			
			return {
				...account,
				name_user: userData?.name_user || null,
				cellphone_user: userData?.cellphone_user || null,
				category:  categoryData?.category_name || null,
			};
		})
	);

	return enrichedAccounts;
};
