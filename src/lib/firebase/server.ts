import * as admin from 'firebase-admin';

if (!admin.apps.length) {
    let credential;

    // In production/local development, you can use the service account JSON
    // Or you can authenticate via environment variables explicitly
    if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
        try {
            const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
            credential = admin.credential.cert(serviceAccount);
            console.log('Firebase Admin init SUCCESS. project_id:', serviceAccount.project_id);
        } catch (error) {
            console.error('CRITICAL: Error parsing FIREBASE_SERVICE_ACCOUNT_KEY', error);
            throw error;
        }
    } else {
        console.error('CRITICAL: FIREBASE_SERVICE_ACCOUNT_KEY is missing');
    }

    try {
        admin.initializeApp({
            credential: credential,
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
