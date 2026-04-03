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

    if (!username || username.trim().length < 3) {
        return { error: 'Username must be at least 3 characters' }
    }

    const trimmedUsername = username.trim()

    // Validate format: alphanumeric + underscores only
    if (!/^[a-zA-Z0-9_]+$/.test(trimmedUsername)) {
        return { error: 'Username can only contain letters, numbers, and underscores' }
    }

    try {
        // Use set with merge:true so it works whether or not the document/field exists yet
        await adminDb.collection('users').doc(user.uid).set(
            { username: trimmedUsername },
            { merge: true }
        )
    } catch (error) {
        console.error('Failed to update username:', error)
        return { error: 'Failed to save username. Please try again.' }
    }

    revalidatePath('/profile')
    revalidatePath('/settings')
    return { success: 'Username updated successfully!' }
}

export async function signOut() {
    redirect('/auth/signout')
}
