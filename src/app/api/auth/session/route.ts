import { NextRequest, NextResponse } from 'next/server'
import { adminAuth } from '@/lib/firebase/server'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
    try {
        const { idToken } = await request.json()

        // Set session expiration to 5 days
        const expiresIn = 60 * 60 * 24 * 5 * 1000

        // Create the session cookie
        const sessionCookie = await adminAuth.createSessionCookie(idToken, { expiresIn })

        // Await the cookies() API in Next.js 15
        const cookieStore = await cookies()
        cookieStore.set('session', sessionCookie, {
            maxAge: expiresIn,
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            path: '/',
            sameSite: 'lax'
        })

        return NextResponse.json({ status: 'success' }, { status: 200 })
    } catch (error) {
        console.error('Session creation error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 401 })
    }
}
