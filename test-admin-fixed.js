const fs = require('fs');
const admin = require('firebase-admin');

const envLocal = fs.readFileSync('.env.local', 'utf8');
const lines = envLocal.split('\n');
const env = {};
for (const line of lines) {
  if (line.trim() && !line.startsWith('#')) {
    const [key, ...rest] = line.split('=');
    let val = rest.join('=');
    if (val.startsWith("'") && val.endsWith("'")) {
      val = val.slice(1, -1);
    }
    env[key] = val;
  }
}

try {
  let credential;
  if (env.FIREBASE_SERVICE_ACCOUNT_KEY) {
      console.log('Key exists, parsing...');
      const sa = JSON.parse(env.FIREBASE_SERVICE_ACCOUNT_KEY.replace(/\\n/g, '\n'));
      credential = admin.credential.cert(sa);
      console.log('Credential created successfully');
  } else {
      console.log('Key not found in parsed env');
  }

  admin.initializeApp({
      credential: credential,
      projectId: env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
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
