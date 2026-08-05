import './node-compat';
import { applicationDefault, cert, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import {getMessaging}  from 'firebase-admin/messaging'
import { getAuth } from 'firebase-admin/auth';
import 'dotenv/config';

const inlineServiceAccount = process.env.FIREBASE_CONFIG || process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
const serviceAccount = inlineServiceAccount
	? JSON.parse(inlineServiceAccount)
	: process.env.FIREBASE_SERVICE_ACCOUNT_PATH;

if (!serviceAccount && !process.env.GOOGLE_APPLICATION_CREDENTIALS) {
	throw new Error('Firebase credentials are required. Set FIREBASE_CONFIG, FIREBASE_SERVICE_ACCOUNT_JSON, FIREBASE_SERVICE_ACCOUNT_PATH or GOOGLE_APPLICATION_CREDENTIALS.');
}

initializeApp({
	credential: serviceAccount ? cert(serviceAccount) : applicationDefault(),
	databaseURL: process.env.FIREBASE_DATABASE_URL,
});

export const db = getFirestore();
export const auth = getAuth();
export const messaging = getMessaging()
