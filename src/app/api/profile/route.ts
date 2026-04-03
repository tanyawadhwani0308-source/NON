import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/firebase/auth'
import { adminDb } from '@/lib/firebase/server'

export async function POST(req: NextRequest) {
    try {
        const user = await getAuthUser()
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await req.json()
        const { username } = body

        if (!username || typeof username !== 'string') {
            return NextResponse.json({ error: 'Invalid username' }, { status: 400 })
        }

        const trimmed = username.trim()

        if (trimmed.length < 3) {
            return NextResponse.json({ error: 'Username must be at least 3 characters' }, { status: 400 })
        }

        if (!/^[a-zA-Z0-9_]+$/.test(trimmed)) {
            return NextResponse.json(
                { error: 'Username can only contain letters, numbers, and underscores' },
                { status: 400 }
            )
        }

        console.log(`[/api/profile] Saving username "${trimmed}" for uid ${user.uid}`)

        await adminDb.collection('users').doc(user.uid).set(
            { username: trimmed },
            { merge: true }
        )

        console.log(`[/api/profile] Username saved successfully`)
        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('[/api/profile] Error saving username:', error)
        return NextResponse.json(
            { error: `Failed to save: ${error instanceof Error ? error.message : String(error)}` },
            { status: 500 }
        )
    }
}
