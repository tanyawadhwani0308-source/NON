import * as admin from 'firebase-admin';

function getApp(): admin.app.App {
    if (admin.apps.length) {
        return admin.apps[0]!;
    }

    const projectId   = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;

    // Normalise private key: strip surrounding quotes (in case Vercel stored them),
    // then convert any literal \n escape sequences to real newlines.
    const rawKey = process.env.FIREBASE_PRIVATE_KEY ?? '';
    const privateKey = rawKey
        .replace(/^"+|"+$/g, '')  // strip surrounding double-quotes
        .replace(/\\n/g, '\n');   // convert \n sequences to real newlines

    if (!projectId || !clientEmail || !privateKey) {
        throw new Error(
            `Firebase Admin: missing env vars — ` +
            `FIREBASE_PROJECT_ID=${!!projectId}, ` +
            `FIREBASE_CLIENT_EMAIL=${!!clientEmail}, ` +
            `FIREBASE_PRIVATE_KEY=${!!privateKey}`
        );
    }

    return admin.initializeApp({
        credential: admin.credential.cert({ projectId, clientEmail, privateKey }),
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
        projectId,
    });
}

// Lazy exports — the Admin SDK is only contacted when actually used
export const adminDb      = new Proxy({} as admin.firestore.Firestore,   { get: (_, p) => (getApp(), admin.firestore())[p as keyof admin.firestore.Firestore] });
export const adminAuth    = new Proxy({} as admin.auth.Auth,             { get: (_, p) => (getApp(), admin.auth())[p as keyof admin.auth.Auth] });
export const adminStorage = new Proxy({} as admin.storage.Storage,       { get: (_, p) => (getApp(), admin.storage())[p as keyof admin.storage.Storage] });
