'use server'

import { getAuthUser } from '@/lib/firebase/auth'
import { adminDb } from '@/lib/firebase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function updateProfile(formData: FormData) {
    const user = await getAuthUser()

    if (!user) {
        return { error: 'Unauthorized' }
    }

    const username = formData.get('username') as string

    if (!username || username.length < 3) {
        return { error: 'Username must be at least 3 characters' }
    }

    try {
        await adminDb.collection('users').doc(user.uid).update({ username })
    } catch (error) {
        return { error: 'Failed to update profile. Username might be taken.' }
    }

    revalidatePath('/profile')
    revalidatePath('/settings')
    return { success: 'Profile updated successfully' }
}

export async function signOut() {
    // Instead of using Supabase signout directly, 
    // we redirect to the specialized NEXT.js API route that deletes the Firebase HTTPOnly session cookie.
    redirect('/auth/signout')
}
