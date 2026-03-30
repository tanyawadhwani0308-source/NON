'use server'

import { getAuthUser } from '@/lib/firebase/auth'
import { adminDb, adminStorage } from '@/lib/firebase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export async function uploadPost(formData: FormData) {
    // Authenticate user
    const user = await getAuthUser()
    if (!user) {
        return { error: 'Unauthorized' }
    }

    const image = formData.get('image') as string // data URL
    const context = formData.get('context') as string
    const location = formData.get('location') as string

    if (!image || !context) {
        return { error: 'Missing field' }
    }

    // Optimize: Convert Data URL to Buffer/Blob
    // data:image/jpeg;base64,...
    const base64Data = image.split(',')[1]
    const buffer = Buffer.from(base64Data, 'base64')

    const fileName = `posts/${user.uid}/${Date.now()}.jpg`

    let publicUrl = '';

    try {
        const bucket = adminStorage.bucket();
        const file = bucket.file(fileName);

        await file.save(buffer, {
            metadata: {
                contentType: 'image/jpeg',
            },
            public: true, // Note: Make sure the Firebase Storage rules allow public read on /posts
        });

        // Get public URL
        publicUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;

    } catch (uploadError) {
        console.error("Upload error:", uploadError)
        return { error: 'Failed to upload image' }
    }

    // Insert into Firestore
    try {
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 24); // Posts expire in 24 hours

        await adminDb.collection('posts').add({
            user_id: user.uid,
            image_url: publicUrl,
            context,
            location: location || null,
            caption: '',
            created_at: new Date().toISOString(),
            expires_at: expiresAt.toISOString()
        })
    } catch (dbError) {
        console.error("DB error:", dbError)
        return { error: 'Failed to save post' }
    }

    revalidatePath('/', 'layout')
    redirect('/feed')
}
