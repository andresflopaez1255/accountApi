import { db } from '../../firebase';
import { capitalize } from '../../utils/capitalizeString';



const searchUserDataUseCase = async (queryParam: string) => {
	let queryResult: unknown[] = [];

	const dbQueryForName = await db.collection('users').orderBy('name_user').startAt(capitalize(queryParam)).endAt(capitalize(queryParam) + '~').get();

	if (!dbQueryForName.empty) {
		queryResult = dbQueryForName.docs.map(doc => doc.data());
	}

	if (dbQueryForName.empty) {
		const userData = await db.collection('users').orderBy('cellphone_user').startAt(queryParam).endAt(queryParam + '~').get();
		if (!userData.empty) {


			if (dbQueryForName.empty) {
				queryResult = userData.docs.map(doc => doc.data());
			}
		}

	}

	return queryResult;

}

export { searchUserDataUseCase };