import { db } from '../../firebase';

export const useCaseSpecificDataUser = async (searchParameter: string | FirebaseFirestore.FieldPath, searchValue: string) => {
	const userInfo = await db
		.collection('users')
		.where(searchParameter, '==', searchValue)
		.get();

	return userInfo;
}