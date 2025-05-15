import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import 'dotenv/config';

const CERT = process.env.FIREBASE_CONFIG?.replace(
  /\\n/g,
 '\n',
);
initializeApp({
  credential: cert(CERT!),
  databaseURL: "https://accounts-manager-24563.firebaseio.com"
});

export const db = getFirestore();
export const auth = getAuth();