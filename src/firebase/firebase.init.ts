import * as admin from 'firebase-admin';

const base64 = process.env.FIREBASE_CREDENTIALS_BASE64;

if (!base64) {
  throw new Error('Missing FIREBASE_CREDENTIALS_BASE64 in environment');
}

const serviceAccount = JSON.parse(
  Buffer.from(base64, 'base64').toString('utf8')
);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

export const firebaseAdmin = admin;
