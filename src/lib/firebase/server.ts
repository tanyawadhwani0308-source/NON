import * as admin from 'firebase-admin';

if (!admin.apps.length) {
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    // .env.local stores \n as a literal backslash-n, so we convert them back
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

    if (!projectId || !clientEmail || !privateKey) {
        console.error('CRITICAL: Missing one or more Firebase Admin env vars:', {
            FIREBASE_PROJECT_ID: !!projectId,
            FIREBASE_CLIENT_EMAIL: !!clientEmail,
            FIREBASE_PRIVATE_KEY: !!privateKey,
        });
    } else {
        console.log('Firebase Admin init SUCCESS. project_id:', projectId);
    }

    try {
        admin.initializeApp({
            credential: admin.credential.cert({
                projectId,
                clientEmail,
                privateKey,
            }),
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
