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
        const { avatar } = body

        if (!avatar || typeof avatar !== 'string') {
            return NextResponse.json({ error: 'Invalid avatar' }, { status: 400 })
        }

        await adminDb.collection('users').doc(user.uid).set(
            { avatar },
            { merge: true }
        )

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('[/api/avatar] Error:', error)
        return NextResponse.json({ error: 'Failed to save avatar' }, { status: 500 })
    }
}
