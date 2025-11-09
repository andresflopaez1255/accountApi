import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import {getMessaging}  from 'firebase-admin/messaging'
import { getAuth } from 'firebase-admin/auth';
import 'dotenv/config';

const serviceAccount = './serviceAccountKey.json';

initializeApp({
	credential: cert(serviceAccount),
	databaseURL: 'https://accountapi-8smd.firebaseio.com',
});

export const db = getFirestore();
export const auth = getAuth();
export const messaging = getMessaging()