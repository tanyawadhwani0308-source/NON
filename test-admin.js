require('dotenv').config({ path: '.env.local' });
const admin = require('firebase-admin');

try {
  let credential;
  if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    console.log('Key exists, parsing...');
    const sa = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
    credential = admin.credential.cert(sa);
    console.log('Credential created successfully');
  }

  admin.initializeApp({
    credential: credential,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  });

  const db = admin.firestore();
  console.log('Fetching posts...');
  db.collection('posts').limit(1).get()
    .then(snap => {
      console.log('Success, docs:', snap.size);
      process.exit(0);
    })
    .catch(err => {
      console.error('Firestore Error:', err);
      process.exit(1);
    });
} catch (e) {
  console.error('Init Error:', e);
}
