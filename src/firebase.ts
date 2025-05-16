import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import 'dotenv/config';

const serviceAccount = "./serviceAccountKey.json";

initializeApp({
  credential: cert(serviceAccount),
  databaseURL: "https://accounts-manager-24563.firebaseio.com"
});

export const db = getFirestore();
export const auth = getAuth();