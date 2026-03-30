import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST() {
    try {
        const cookieStore = await cookies()
        cookieStore.delete('session')

        return NextResponse.redirect(new URL('/login', process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'))
    } catch (error) {
        console.error('Signout error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
