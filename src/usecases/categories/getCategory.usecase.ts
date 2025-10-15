import { db } from '../../firebase';

export const getCategoryUseCase = async (categoryId: string) => {
	const categorySnapshot = await db
		.collection('categories_account')
		.where('id', '==', categoryId)
		.limit(1)
		.get();



	return categorySnapshot.docs[0].data();
};