import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import fs from 'fs';

let app;

if (!getApps().length) {
  const serviceAccount = JSON.parse(fs.readFileSync('./service-account.json', 'utf8'));
  app = initializeApp({
    credential: cert(serviceAccount),
  });
  console.log('Firebase Admin SDK initialized successfully');
} else {
  app = getApps()[0];
  console.log('Firebase Admin SDK already initialized');
}

export const db = getFirestore(app);
export const auth = getAuth(app);