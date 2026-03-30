'use server'

import { getAuthUser } from '@/lib/firebase/auth'
import { adminDb } from '@/lib/firebase/server'
import { revalidatePath } from 'next/cache'

export async function searchUsers(query: string) {
    if (!query || query.length < 3) return []

    // Firestore doesn't have a native case-insensitive LIKE query. 
    // For a robust search, usually Algolia is used.
    // For MVP, we'll do a prefix search matched exactly as startsWith on string.
    const snapshot = await adminDb.collection('users')
        .where('username', '>=', query)
        .where('username', '<=', query + '\uf8ff')
        .limit(10)
        .get()

    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
}

export async function sendFriendRequest(friendId: string) {
    const user = await getAuthUser()
    if (!user) return { error: 'Unauthorized' }

    // Check if request already exists
    const existing = await adminDb.collection('friendships')
        .where('user_id', '==', user.uid)
        .where('friend_id', '==', friendId)
        .get()

    if (!existing.empty) {
        return { error: 'Request already sent' }
    }

    try {
        await adminDb.collection('friendships').add({
            user_id: user.uid,
            friend_id: friendId,
            status: 'pending'
        })
        revalidatePath('/friends')
        return { success: true }
    } catch {
        return { error: 'Failed to send request' }
    }
}

export async function acceptFriend(friendshipId: string) {
    try {
        await adminDb.collection('friendships').doc(friendshipId).update({ status: 'accepted' })
        revalidatePath('/friends')
        return { success: true }
    } catch {
        return { error: 'Failed' }
    }
}

export async function rejectFriend(friendshipId: string) {
    try {
        await adminDb.collection('friendships').doc(friendshipId).delete()
        revalidatePath('/friends')
        revalidatePath('/profile')
        return { success: true }
    } catch {
        return { error: 'Failed' }
    }
}
