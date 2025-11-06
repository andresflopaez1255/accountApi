import { getCategoryUseCase } from '../categories/getCategory.usecase';
import { useCaseSpecificDataUser } from '../users/specificDataUser.usecase';

const mapAccountWithCatAndUserUseCase = async (accounts: FirebaseFirestore.DocumentData[]) => {
	const enrichedAccounts = await Promise.all(
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		accounts.map(async (account: any) => {
			
			const categoryData = await getCategoryUseCase('id', account.id_category);
		
			const userInfo = await useCaseSpecificDataUser('id', account.id_user);
			
			
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
}

export { mapAccountWithCatAndUserUseCase };