import { getAuthUser } from '@/lib/firebase/auth';
import { adminDb } from '@/lib/firebase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Check, X } from 'lucide-react';
import { acceptFriend, rejectFriend } from './actions';
import { ClientFriendSearch } from './ClientFriendSearch';

export default async function FriendsPage() {
    const user = await getAuthUser();
    if (!user) redirect('/login');

    // 1. Get Pending Requests (Received)
    let receivedRequests: any[] = [];
    try {
        const requestsSnapshot = await adminDb.collection('friendships')
            .where('friend_id', '==', user!.uid)
            .where('status', '==', 'pending')
            .get();

        receivedRequests = await Promise.all(requestsSnapshot.docs.map(async (doc) => {
            const data = doc.data();
            try {
                const userDoc = await adminDb.collection('users').doc(data.user_id).get();
                return { id: doc.id, ...data, profiles: userDoc.data() || {} };
            } catch {
                return { id: doc.id, ...data, profiles: {} };
            }
        }));
    } catch (e) {
        console.error('Failed to fetch friend requests:', e);
    }

    // 2. Get Friends (Accepted) — query both directions
    let friends: any[] = [];
    try {
        const resolveFriends = async (docs: any[], friendField: string) => {
            return Promise.all(docs.map(async (doc) => {
                const data = doc.data();
                const friendId = data[friendField];
                try {
                    const userDoc = await adminDb.collection('users').doc(friendId).get();
                    return { id: doc.id, ...data, profile: userDoc.data() || {} };
                } catch {
                    return { id: doc.id, ...data, profile: {} };
                }
            }));
        };

        const [friends1Snap, friends2Snap] = await Promise.all([
            adminDb.collection('friendships').where('user_id', '==', user!.uid).where('status', '==', 'accepted').get(),
            adminDb.collection('friendships').where('friend_id', '==', user!.uid).where('status', '==', 'accepted').get(),
        ]);

        const [friends1, friends2] = await Promise.all([
            resolveFriends(friends1Snap.docs, 'friend_id'),
            resolveFriends(friends2Snap.docs, 'user_id'),
        ]);

        friends = [...friends1, ...friends2];
    } catch (e) {
        console.error('Failed to fetch friends:', e);
    }

    return (
        <div className="min-h-screen bg-[#FAF8F6] pb-20">
            <header className="sticky top-0 z-10 bg-[#FAF8F6]/80 backdrop-blur-md px-4 py-4 flex items-center gap-4 border-b border-gray-100">
                <Link href="/profile">
                    <Button variant="ghost" size="icon" className="-ml-2">
                        <ArrowLeft className="h-6 w-6 text-[#1A1A1A]" />
                    </Button>
                </Link>
                <h1 className="text-xl font-serif text-[#1A1A1A]">Friends</h1>
            </header>

            <main className="max-w-md mx-auto p-4 space-y-8">
                {/* Search Section */}
                <section className="space-y-4">
                    <ClientFriendSearch />
                </section>

                {/* Requests Section */}
                {receivedRequests && receivedRequests.length > 0 && (
                    <section className="space-y-3">
                        <h2 className="text-sm font-medium text-[#6B6460] uppercase tracking-wider">Requests</h2>
                        <div className="space-y-2">
                            {receivedRequests.map((req: any) => (
                                <div key={req.id} className="flex items-center justify-between p-3 bg-white rounded-xl shadow-sm">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-full bg-gray-200 overflow-hidden">
                                            <div className="h-full w-full bg-[#9C8B7E] flex items-center justify-center text-white text-xs">
                                                {req.profiles.username?.[0]?.toUpperCase()}
                                            </div>
                                        </div>
                                        <span className="font-medium text-[#1A1A1A]">{req.profiles.username}</span>
                                    </div>
                                    <div className="flex gap-2">
                                        <form action={async () => {
                                            'use server'
                                            await acceptFriend(req.id)
                                        }}>
                                            <Button size="icon" variant="outline" className="h-8 w-8 text-green-600 border-green-200 bg-green-50 hover:bg-green-100">
                                                <Check className="h-4 w-4" />
                                            </Button>
                                        </form>
                                        <form action={async () => {
                                            'use server'
                                            await rejectFriend(req.id)
                                        }}>
                                            <Button size="icon" variant="outline" className="h-8 w-8 text-red-600 border-red-200 bg-red-50 hover:bg-red-100">
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </form>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Friends List */}
                <section className="space-y-3">
                    <h2 className="text-sm font-medium text-[#6B6460] uppercase tracking-wider">Your Friends ({friends.length})</h2>
                    {friends.length === 0 ? (
                        <p className="text-sm text-[#6B6460]">No friends yet. Search for users to add them!</p>
                    ) : (
                        <div className="space-y-2">
                            {friends.map((f: any) => (
                                <div key={f.id} className="flex items-center justify-between p-3 bg-white rounded-xl shadow-sm">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-full bg-gray-200 overflow-hidden">
                                            <div className="h-full w-full bg-[#9C8B7E] flex items-center justify-center text-white text-xs">
                                                {f.profile.username?.[0]?.toUpperCase()}
                                            </div>
                                        </div>
                                        <span className="font-medium text-[#1A1A1A]">{f.profile.username}</span>
                                    </div>
                                    <Button variant="ghost" size="sm" className="text-[#6B6460]">
                                        View
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            </main>
        </div>
    )
}
