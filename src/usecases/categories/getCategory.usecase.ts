import { db } from '../../firebase';

export const getCategoryUseCase = async (categoryId: string) => {
	const categorySnapshot = await db
		.collection('categories_account')
		.where('id', '==', categoryId)
		.get();

	if (categorySnapshot.empty) {
		return null;
	}
	return categorySnapshot.docs[0].data();
};