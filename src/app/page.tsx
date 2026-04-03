import { getAuthUser } from '@/lib/firebase/auth'
import { adminDb } from '@/lib/firebase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default async function Home() {
  const user = await getAuthUser()

  if (!user) {
    // Landing Page
    return (
      <div className="min-h-screen bg-[#FAF8F6] flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-4xl font-serif text-[#1A1A1A] mb-4">N.o.N</h1>
        <p className="text-[#6B6460] mb-8 max-w-md">
          Share exactly one authentic photo per day.
          <br />
          No filters. No endless scrolling. Just now.
        </p>
        <div className="flex gap-4">
          <Button asChild className="rounded-full w-32">
            <Link href="/login">Login</Link>
          </Button>
          <Button asChild variant="outline" className="rounded-full w-32">
            <Link href="/signup">Sign Up</Link>
          </Button>
        </div>
      </div>
    )
  }

  // --- Authenticated User Logic ---

  // Check if user has an active post
  let postsSnap = null
  try {
    const now = new Date().toISOString()
    postsSnap = await adminDb.collection('posts')
      .where('user_id', '==', user.uid)
      .where('expires_at', '>', now)
      .limit(1)
      .get()
  } catch (e) {
    console.error('Posts query failed:', e)
  }
  const hasActivePost = postsSnap ? !postsSnap.empty : false

  if (hasActivePost) {
    redirect('/feed')
  }

  // Show "Today's Moment" screen (Camera Entry)
  const date = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })

  return (
    <div className="min-h-screen bg-[#FAF8F6] flex flex-col items-center justify-center p-6 text-center">
      <div className="space-y-6 max-w-md w-full">
        <div className="space-y-2">
          <h1 className="text-4xl font-serif text-[#1A1A1A]">{date}</h1>
          <p className="text-[#6B6460]">You haven&apos;t posted your moment yet.</p>
        </div>

        <div className="py-8">
          <div className="w-64 h-64 mx-auto bg-[#F5F1ED] rounded-full flex items-center justify-center border-2 border-dashed border-[#9C8B7E]">
            <span className="text-4xl">📸</span>
          </div>
        </div>

        <Button asChild className="w-full h-14 text-lg rounded-full bg-[#1A1A1A] text-white hover:bg-[#1A1A1A]/90">
          <Link href="/camera">Capture Moment</Link>
        </Button>

        <p className="text-sm text-[#9C8B7E] pt-4">
          You&apos;ll have 2 minutes to capture your authentic self.
        </p>
      </div>
    </div>
  )
}
