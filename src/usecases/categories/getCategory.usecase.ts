import { db } from '../../firebase';

export const getCategoryUseCase = async (categoryQuery:string, categoryParam: string) => {
	console.log(categoryParam)
	const categorySnapshot = await db
		.collection('categories_account')
		.where(categoryQuery, '==', categoryParam)
		.get();

	if (categorySnapshot.empty) {
		return null;
	}
	return categorySnapshot.docs[0].data();
};