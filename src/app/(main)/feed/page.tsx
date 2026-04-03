import { getAuthUser } from '@/lib/firebase/auth';
import { adminDb } from '@/lib/firebase/server';
import { LockedFeed } from '@/components/feed/LockedFeed';
import { redirect } from 'next/navigation';

export default async function FeedPage() {
    const user = await getAuthUser();
    if (!user) redirect('/login');

    const now = new Date().toISOString();

    // 1. Check if user posted today
    let hasPosted = false;
    try {
        const userPostsSnap = await adminDb.collection('posts')
            .where('user_id', '==', user!.uid)
            .where('expires_at', '>', now)
            .limit(1)
            .get();
        hasPosted = !userPostsSnap.empty;
    } catch (e) {
        console.error('Failed to check user post status:', e);
    }

    if (!hasPosted) {
        return <LockedFeed />;
    }

    // 2. Fetch Feed (Friends' posts)
    let feedPosts: any[] = [];
    try {
        const feedPostsSnap = await adminDb.collection('posts')
            .where('expires_at', '>', now)
            .orderBy('expires_at', 'asc')
            .orderBy('created_at', 'desc')
            .get();

        const feedPostsDocs = feedPostsSnap.docs.filter(doc => doc.data().user_id !== user!.uid);

        feedPosts = await Promise.all(feedPostsDocs.map(async (doc) => {
            const postData = doc.data();
            try {
                const userDoc = await adminDb.collection('users').doc(postData.user_id).get();
                return { id: doc.id, ...postData, user: userDoc.data() || {} };
            } catch {
                return { id: doc.id, ...postData, user: {} };
            }
        }));
    } catch (e) {
        console.error('Failed to fetch feed posts:', e);
    }

    return (
        <div className="space-y-8 animate-in fade-in">
            <header className="mb-8">
                <h1 className="text-3xl font-serif text-[#3E3835]">Your Feed</h1>
                <p className="text-[#8C847F]">See real moments from your friends.</p>
            </header>

            {feedPosts && feedPosts.length > 0 ? (
                <div className="grid grid-cols-1 gap-12 max-w-[600px] mx-auto">
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    {feedPosts.map((post: any) => (
                        <div key={post.id} className="bg-white rounded-[24px] overflow-hidden shadow-sm border border-[#E5E5E5]">
                            {/* Header */}
                            <div className="p-4 flex items-center gap-3 border-b border-[#F5F1ED]">
                                <div className="h-10 w-10 bg-[#E5E5E5] rounded-full flex items-center justify-center text-lg font-medium text-[#6B6460]">
                                    {post.user?.avatar || post.user?.username?.[0]?.toUpperCase() || '?'}
                                </div>
                                <div>
                                    <p className="font-medium text-[#3E3835]">{post.user?.username}</p>
                                    <p className="text-xs text-[#8C847F] capitalize">{post.context} • {new Date(post.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                </div>
                            </div>

                            {/* Image */}
                            <div className="aspect-[4/3] bg-gray-100">
                                <img src={post.image_url} alt="Post" className="w-full h-full object-cover" />
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 bg-white/50 rounded-[24px]">
                    <p className="text-[#8C847F]">No moments shared yet today.</p>
                    <p className="text-sm text-[#C6A87C] mt-2">Be the first to invite friends!</p>
                </div>
            )}
        </div>
    )
}
