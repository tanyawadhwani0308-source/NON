'use server'

import { getAuthUser } from '@/lib/firebase/auth'
import { adminDb } from '@/lib/firebase/server'
import { revalidatePath } from 'next/cache'

export async function saveAvatar(emoji: string) {
    const user = await getAuthUser()
    if (!user) return { error: 'Unauthorized' }

    try {
        await adminDb.collection('users').doc(user.uid).set(
            { avatar: emoji },
            { merge: true }
        )
    } catch (error) {
        console.error('Failed to save avatar:', error)
        return { error: 'Failed to save avatar' }
    }

    revalidatePath('/profile')
    revalidatePath('/feed')
    return { success: true }
}
