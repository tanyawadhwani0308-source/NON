import { getAuthUser } from '@/lib/firebase/auth'
import { adminDb } from '@/lib/firebase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

export default async function ArchivePage() {
    const user = await getAuthUser()

    if (!user) redirect('/login')

    let posts: any[] = []
    try {
        const snapshot = await adminDb.collection('posts')
            .where('user_id', '==', user!.uid)
            .orderBy('created_at', 'desc')
            .get()
        posts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    } catch (e) {
        console.error('Failed to fetch archive posts:', e)
    }

    return (
        <div className="min-h-screen bg-[#FAF8F6] pb-20">
            <header className="sticky top-0 z-10 bg-[#FAF8F6]/80 backdrop-blur-md px-4 py-4 flex items-center gap-4 border-b border-gray-100">
                <Link href="/profile">
                    <Button variant="ghost" size="icon" className="-ml-2">
                        <ArrowLeft className="h-6 w-6 text-[#1A1A1A]" />
                    </Button>
                </Link>
                <h1 className="text-xl font-serif text-[#1A1A1A]">Archive</h1>
            </header>

            <main className="max-w-md mx-auto p-4">
                {posts && posts.length > 0 ? (
                    <div className="grid grid-cols-2 gap-4">
                        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                        {posts.map((post: any) => (
                            <div key={post.id} className="relative aspect-[4/5] rounded-xl overflow-hidden shadow-sm">
                                <img src={post.image_url} alt="Archived Moment" className="h-full w-full object-cover" />
                                <div className="absolute bottom-0 inset-x-0 p-2 bg-gradient-to-t from-black/50 to-transparent">
                                    <p className="text-xs text-white/90">
                                        {new Date(post.created_at).toLocaleDateString()}
                                    </p>
                                    <span className="text-[10px] text-white/70 uppercase tracking-wide">
                                        {post.context}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 text-[#6B6460]">
                        <p>No moments archived yet.</p>
                    </div>
                )}
            </main>
        </div>
    )
}
