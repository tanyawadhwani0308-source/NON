import * as admin from 'firebase-admin';

if (!admin.apps.length) {
    let credential;

    // In production/local development, you can use the service account JSON
    // Or you can authenticate via environment variables explicitly
    if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
        try {
            const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
            credential = admin.credential.cert(serviceAccount);
        } catch (error) {
            console.error('Error parsing FIREBASE_SERVICE_ACCOUNT_KEY', error);
        }
    }

    try {
        admin.initializeApp({
            credential: credential || admin.credential.applicationDefault(),
            storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
            projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        });
    } catch (error) {
        console.error('Firebase admin initialization error', error);
    }
}

const adminDb = admin.firestore();
const adminAuth = admin.auth();
const adminStorage = admin.storage();

export { adminDb, adminAuth, adminStorage };
