import { adminAuth } from './server';
import { cookies } from 'next/headers';

export async function getAuthUser() {
    try {
        const cookieStore = await cookies();
        const sessionCookie = cookieStore.get('session')?.value;
        if (!sessionCookie) return null;

        const decodedToken = await adminAuth.verifySessionCookie(sessionCookie, true);
        return decodedToken;
    } catch (error) {
        console.error('Error verifying session cookie', error);
        return null;
    }
}
