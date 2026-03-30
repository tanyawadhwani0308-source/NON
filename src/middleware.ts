import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
    const session = request.cookies.get('session')?.value

    // Define protected routes that require a logged in user
    const isProtectedRoute =
        request.nextUrl.pathname.startsWith('/feed') ||
        request.nextUrl.pathname.startsWith('/camera') ||
        request.nextUrl.pathname.startsWith('/profile') ||
        request.nextUrl.pathname.startsWith('/friends')

    // If trying to access a protected route without a session, redirect to login
    if (isProtectedRoute && !session) {
        return NextResponse.redirect(new URL('/login', request.url))
    }

    // If trying to access login/signup while already having a session, redirect to feed
    if (session && (request.nextUrl.pathname.startsWith('/login') || request.nextUrl.pathname.startsWith('/signup'))) {
        return NextResponse.redirect(new URL('/', request.url))
    }

    return NextResponse.next()
}

export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico|api|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
