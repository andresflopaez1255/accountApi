import { db } from '../../firebase';

const getAllCategoriesUseCase = async () => {
	
	const categories = await db.collection('categories_account').get()
	const categoriesData = categories.docs.map(doc => doc.data());
	console.log('categoriesData', categoriesData)
	return categoriesData ;
	
}

export { getAllCategoriesUseCase };