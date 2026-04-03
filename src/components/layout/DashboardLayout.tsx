import React from 'react'
import { Sidebar } from './Sidebar'
import { RightPanel } from './RightPanel'
import { getAuthUser } from '@/lib/firebase/auth'
import { adminDb } from '@/lib/firebase/server'

/**
 * DashboardLayout (Server Component)
 *
 * Fetches the user's real streak from Firestore and passes it to RightPanel.
 * Grid: 240px | 1fr | 300px
 */

function calculateStreak(postDates: Date[]): number {
    if (postDates.length === 0) return 0;

    const days = Array.from(
        new Set(postDates.map(d => d.toISOString().slice(0, 10)))
    ).sort().reverse();

    if (days.length === 0) return 0;

    const todayStr = new Date().toISOString().slice(0, 10);
    const yesterdayD = new Date();
    yesterdayD.setUTCDate(yesterdayD.getUTCDate() - 1);
    const yesterdayStr = yesterdayD.toISOString().slice(0, 10);

    if (days[0] !== todayStr && days[0] !== yesterdayStr) return 0;

    let streak = 1;
    for (let i = 1; i < days.length; i++) {
        const prev = new Date(days[i - 1]);
        const curr = new Date(days[i]);
        const diffDays = Math.round((prev.getTime() - curr.getTime()) / 86400000);
        if (diffDays === 1) {
            streak++;
        } else {
            break;
        }
    }
    return streak;
}

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
    // Fetch streak for the right panel
    let streak = 0;
    let username = '';
    let avatar = '';
    try {
        const user = await getAuthUser();
        if (user) {
            const [profileDoc, postsSnap] = await Promise.all([
                adminDb.collection('users').doc(user.uid).get(),
                adminDb.collection('posts')
                    .where('user_id', '==', user.uid)
                    .orderBy('created_at', 'desc')
                    .get(),
            ]);
            const profileData = profileDoc.data();
            username = profileData?.username || '';
            avatar = profileData?.avatar || '';
            const dates = postsSnap.docs.map(d => new Date(d.data().created_at as string));
            streak = calculateStreak(dates);
        }
    } catch (e) {
        console.error('DashboardLayout: failed to fetch streak', e);
    }

    return (
        <div className="h-screen w-full flex items-center justify-center p-4 md:p-6 overflow-hidden">
            <div className="
        w-full max-w-[1350px]
        h-full max-h-[900px]
        bg-[#F5F1ED]
        rounded-[20px]
        shadow-[0_20px_40px_-10px_rgba(0,0,0,0.1)]
        border border-white/50
        relative
        overflow-hidden
        grid
        grid-cols-[240px_1fr_300px]
      ">
                {/* Sidebar */}
                <aside className="h-full bg-[#EBE6E0] border-r border-[#3E3835]/5 overflow-hidden">
                    <Sidebar username={username} avatar={avatar} />
                </aside>

                {/* Main Content */}
                <main className="h-full relative flex flex-col min-w-0 bg-[#F5F1ED]">
                    <div className="flex-1 overflow-y-auto scroll-container p-8 md:p-10">
                        <div className="max-w-[800px] mx-auto w-full animate-enter pb-20">
                            {children}
                        </div>
                    </div>
                </main>

                {/* Right Panel */}
                <aside className="h-full bg-[#F9F7F5] border-l border-[#3E3835]/5 overflow-hidden hidden xl:block">
                    <RightPanel streak={streak} />
                </aside>
            </div>
        </div>
    )
}
