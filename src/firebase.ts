import './node-compat';
import { applicationDefault, cert, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import {getMessaging}  from 'firebase-admin/messaging'
import { getAuth } from 'firebase-admin/auth';
import 'dotenv/config';

const parseServiceAccount = () => {
	const base64 = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;
	if (base64) return JSON.parse(Buffer.from(base64, 'base64').toString('utf8'));
	const inline = process.env.FIREBASE_CONFIG || process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
	if (!inline) return process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
	try {
		return JSON.parse(inline.trim());
	} catch (_error) {
		throw new Error('Firebase service-account JSON is invalid. On Render, prefer FIREBASE_SERVICE_ACCOUNT_BASE64 to avoid quote and newline errors.');
	}
};

const serviceAccount = parseServiceAccount();

if (!serviceAccount && !process.env.GOOGLE_APPLICATION_CREDENTIALS) {
	throw new Error('Firebase credentials are required. Set FIREBASE_SERVICE_ACCOUNT_BASE64, FIREBASE_CONFIG, FIREBASE_SERVICE_ACCOUNT_JSON, FIREBASE_SERVICE_ACCOUNT_PATH or GOOGLE_APPLICATION_CREDENTIALS.');
}

initializeApp({
	credential: serviceAccount ? cert(serviceAccount) : applicationDefault(),
	databaseURL: process.env.FIREBASE_DATABASE_URL,
});

export const db = getFirestore();
export const auth = getAuth();
export const messaging = getMessaging()
