import { db } from '../../firebase';
import { capitalize } from '../../utils/capitalizeString';
import { mapAccountWithCatAndUserUseCase } from './mapAccountWithCatAndUser.usecase';



const seacrhDataAccountsUseCase = async (queryParam: string) => {
	let queryResult: unknown[] = []; 

	const dbQueryAccount = await db.collection('accounts').orderBy('email_account').startAt(queryParam).endAt(queryParam + '~').get();
      
	if (!dbQueryAccount.empty) {
		queryResult = await mapAccountWithCatAndUserUseCase(dbQueryAccount.docs.map(doc => doc.data()));
	}

	if (dbQueryAccount.empty) {
		const userData = await db.collection('users').orderBy('name_user').startAt(capitalize(queryParam)).endAt(capitalize(queryParam) + '~').get();
		console.log('query',userData.docs)
		if (!userData.empty) {
			const userId = userData.docs[0].data().id;
			const dbQueryAccountByUserId = await db.collection('accounts').where('id_user', '==', userId).get();

			if (!dbQueryAccountByUserId.empty) {
				queryResult = await mapAccountWithCatAndUserUseCase(dbQueryAccountByUserId.docs.map(doc => doc.data()));
			}
		}

	}
      
	return queryResult;

}

export { seacrhDataAccountsUseCase };