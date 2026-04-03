const fs = require('fs');
const admin = require('firebase-admin');

// 1. Read .env.local
const envContent = fs.readFileSync('.env.local', 'utf8');

// A simplistic parser
const lines = envContent.split('\n');
const env = {};
for (const line of lines) {
    if (line.includes('=')) {
        const idx = line.indexOf('=');
        const key = line.slice(0, idx);
        let val = line.slice(idx + 1);
        if (val.startsWith("'") && val.endsWith("'")) {
            val = val.slice(1, -1);
        }
        env[key] = val;
    }
}

console.log('Got FIREBASE_SERVICE_ACCOUNT_KEY:', !!env.FIREBASE_SERVICE_ACCOUNT_KEY);

try {
    let credential;
    if (env.FIREBASE_SERVICE_ACCOUNT_KEY) {
        // Notice we are replacing literal backslash-n with actual newlines 
        // because that's how dotenv parses them sometimes when escaped.
        // Actually, if it's literal \n inside string, JSON.parse handles it? 
        // No, JSON.parse needs valid JSON. A literal \n inside a JSON string must be \\n.
        // Next.js `dotenv` usually unescapes \n in double quotes, but single quotes?
        const jsonStr = env.FIREBASE_SERVICE_ACCOUNT_KEY.replace(/\\n/g, '\\n');
        console.log('Attempting to parse JSON...');
        const sa = JSON.parse(jsonStr);
        credential = admin.credential.cert(sa);
        console.log('Credential created successfully');
    } else {
        console.log('No credential found');
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
