import { getAuthUser } from '@/lib/firebase/auth';
import { adminDb } from '@/lib/firebase/server';
import { redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Settings, Award, Calendar } from 'lucide-react';
import Link from 'next/link';
import { AvatarPicker } from '@/components/profile/AvatarPicker';

// ─── Streak helper ───────────────────────────────────────────────────────────
function calculateStreak(postDates: Date[]): number {
    if (postDates.length === 0) return 0;

    // Normalize to unique calendar days (YYYY-MM-DD) in user's local
    // (server runs UTC; we use UTC date strings for consistency)
    const days = Array.from(
        new Set(postDates.map(d => d.toISOString().slice(0, 10)))
    ).sort().reverse(); // most recent first

    if (days.length === 0) return 0;

    const todayStr = new Date().toISOString().slice(0, 10);
    const yesterdayD = new Date();
    yesterdayD.setUTCDate(yesterdayD.getUTCDate() - 1);
    const yesterdayStr = yesterdayD.toISOString().slice(0, 10);

    // Streak must include today or yesterday to be active
    if (days[0] !== todayStr && days[0] !== yesterdayStr) return 0;

    let streak = 1;
    for (let i = 1; i < days.length; i++) {
        const prev = new Date(days[i - 1]);
        const curr = new Date(days[i]);
        const diffMs = prev.getTime() - curr.getTime();
        const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
        if (diffDays === 1) {
            streak++;
        } else {
            break;
        }
    }
    return streak;
}

// ─── Achievements definition ─────────────────────────────────────────────────
interface Achievement {
    id: string;
    label: string;
    description: string;
    emoji: string;
    unlocked: boolean;
}

function computeAchievements(
    allPosts: { created_at: string }[],
    streak: number
): Achievement[] {
    const totalPosts = allPosts.length;

    // Check Early Bird: any post before 08:00 UTC
    const hasEarlyBird = allPosts.some(p => {
        const h = new Date(p.created_at).getUTCHours();
        return h < 8;
    });

    // Check Night Owl: any post at or after 22:00 UTC
    const hasNightOwl = allPosts.some(p => {
        const h = new Date(p.created_at).getUTCHours();
        return h >= 22;
    });

    return [
        {
            id: 'first_moment',
            label: 'First Moment',
            description: 'Posted your very first photo',
            emoji: '📸',
            unlocked: totalPosts >= 1,
        },
        {
            id: 'early_bird',
            label: 'Early Bird',
            description: 'Posted before 8 AM',
            emoji: '🌅',
            unlocked: hasEarlyBird,
        },
        {
            id: 'night_owl',
            label: 'Night Owl',
            description: 'Posted after 10 PM',
            emoji: '🦉',
            unlocked: hasNightOwl,
        },
        {
            id: 'streak_3',
            label: '3 Day Streak',
            description: '3 days in a row',
            emoji: '🔥',
            unlocked: streak >= 3,
        },
        {
            id: 'streak_7',
            label: 'Week Strong',
            description: '7 day streak',
            emoji: '⚡',
            unlocked: streak >= 7,
        },
    ];
}

// ─── Page ────────────────────────────────────────────────────────────────────
export default async function ProfilePage() {
    const user = await getAuthUser();
    if (!user) redirect('/login');

    // 1. Fetch profile
    let profileUsername = '';
    let profileAvatar = '';
    let profileCreatedAt = '';
    try {
        const doc = await adminDb.collection('users').doc(user.uid).get();
        const data = doc.data();
        if (data) {
            profileUsername = (data.username as string) || '';
            profileAvatar = (data.avatar as string) || '';
            profileCreatedAt = (data.created_at as string) || '';
        }
    } catch (e) {
        console.error('Failed to fetch profile:', e);
    }

    // 2. Fetch ALL user posts (for streak + achievements)
    let allPosts: { created_at: string }[] = [];
    try {
        const snap = await adminDb.collection('posts')
            .where('user_id', '==', user.uid)
            .orderBy('created_at', 'desc')
            .get();
        allPosts = snap.docs.map(d => ({ created_at: d.data().created_at as string }));
    } catch (e) {
        console.error('Failed to fetch user posts:', e);
    }

    // 3. Fetch today's post (for "Today's Moment" card)
    let todaysImageUrl: string | null = null;
    try {
        const now = new Date().toISOString();
        const snap = await adminDb.collection('posts')
            .where('user_id', '==', user.uid)
            .where('expires_at', '>', now)
            .limit(1)
            .get();
        if (!snap.empty) {
            todaysImageUrl = (snap.docs[0].data().image_url as string) || null;
        }
    } catch (e) {
        console.error("Failed to fetch today's post:", e);
    }

    // 4. Compute real streak
    const postDates = allPosts.map(p => new Date(p.created_at));
    const streak = calculateStreak(postDates);

    // 5. Monthly stats
    const now = new Date();
    const year = now.getUTCFullYear();
    const month = now.getUTCMonth(); // 0-indexed
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const daysPostedThisMonth = new Set(
        allPosts
            .map(p => new Date(p.created_at))
            .filter(d => d.getUTCFullYear() === year && d.getUTCMonth() === month)
            .map(d => d.toISOString().slice(0, 10))
    ).size;

    // 6. Achievements
    const achievements = computeAchievements(allPosts, streak);
    const unlockedCount = achievements.filter(a => a.unlocked).length;

    return (
        <div className="space-y-8 animate-in fade-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-[#3E3835]/10">
                <div className="flex items-center gap-6">
                    {/* Clickable Emoji Avatar */}
                    <AvatarPicker currentAvatar={profileAvatar || null} />

                    <div>
                        <h1 className="text-4xl font-serif text-[#3E3835]">
                            {profileUsername || 'No username set'}
                        </h1>
                        <p className="text-[#8C847F] mt-1">
                            {profileCreatedAt
                                ? `Joined ${new Date(profileCreatedAt).getFullYear()}`
                                : 'Welcome to N.o.N'}
                        </p>
                        <div className="flex items-center gap-2 mt-2 text-[#C6A87C] font-medium bg-[#FAF8F6] px-3 py-1 rounded-full w-fit">
                            <span>🔥</span>
                            <span>Streak: {streak} {streak === 1 ? 'Day' : 'Days'}</span>
                        </div>
                    </div>
                </div>

                <div className="flex gap-3">
                    <Button variant="outline" size="sm" asChild>
                        <Link href="/settings">
                            <Settings className="w-4 h-4 mr-2" /> Settings
                        </Link>
                    </Button>
                </div>
            </div>

            {/* 2-Column Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                {/* Left Column */}
                <div className="space-y-8">

                    {/* This Month's Moments */}
                    <div className="bg-white p-8 rounded-[24px] shadow-sm border border-[#E5E5E5]">
                        <h3 className="text-lg font-serif text-[#3E3835] mb-6 flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-[#C6A87C]" /> This Month's Moments
                        </h3>

                        <div className="flex flex-col items-center gap-4">
                            {/* Big stat */}
                            <div className="text-center">
                                <p className="text-6xl font-serif text-[#3E3835]">{daysPostedThisMonth}</p>
                                <p className="text-[#8C847F] mt-1 text-sm">
                                    out of <span className="font-semibold text-[#3E3835]">{daysInMonth}</span> days this month
                                </p>
                            </div>

                            {/* Progress bar */}
                            <div className="w-full bg-[#F0EDE8] rounded-full h-3 overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-[#C6A87C] to-[#D4A59A] rounded-full transition-all duration-700"
                                    style={{ width: `${Math.round((daysPostedThisMonth / daysInMonth) * 100)}%` }}
                                />
                            </div>
                            <p className="text-xs text-[#8C847F]">
                                {Math.round((daysPostedThisMonth / daysInMonth) * 100)}% of this month captured
                            </p>
                        </div>
                    </div>

                    {/* Today's Moment Card */}
                    <div className="bg-[#3E3835] p-8 rounded-[24px] text-white shadow-lg relative overflow-hidden">
                        <div className="relative z-10">
                            <h3 className="text-lg font-serif mb-2">Today&apos;s Moment</h3>
                            {todaysImageUrl ? (
                                <div className="mt-4 aspect-[4/3] rounded-xl overflow-hidden border border-white/20">
                                    <img src={todaysImageUrl} alt="Today" className="w-full h-full object-cover" />
                                </div>
                            ) : (
                                <div className="mt-4 p-6 bg-white/5 rounded-xl border border-white/10 text-center">
                                    <p className="text-white/60 text-sm mb-4">You haven&apos;t posted yet.</p>
                                    <Button asChild className="bg-white text-[#3E3835] hover:bg-gray-100 rounded-full">
                                        <Link href="/camera">Capture Now</Link>
                                    </Button>
                                </div>
                            )}
                        </div>
                        <div className="absolute top-0 right-0 w-64 h-64 bg-[#C6A87C]/20 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
                    </div>
                </div>

                {/* Right Column: Achievements */}
                <div className="bg-white p-8 rounded-[24px] shadow-sm border border-[#E5E5E5]">
                    <h3 className="text-lg font-serif text-[#3E3835] mb-1 flex items-center gap-2">
                        <Award className="w-5 h-5 text-[#C6A87C]" /> Achievements
                    </h3>
                    <p className="text-xs text-[#8C847F] mb-6">
                        {unlockedCount} of {achievements.length} unlocked
                    </p>

                    <div className="space-y-3">
                        {achievements.map((a) => (
                            <div
                                key={a.id}
                                className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${
                                    a.unlocked
                                        ? 'bg-[#FAF8F6] border-[#E5E5E5]'
                                        : 'bg-white border-[#F0EDE8] opacity-45'
                                }`}
                            >
                                <div className={`h-10 w-10 rounded-full flex items-center justify-center text-xl shadow-sm flex-shrink-0 ${
                                    a.unlocked
                                        ? 'bg-gradient-to-br from-[#FBEd96] to-[#ABECD6]'
                                        : 'bg-[#F0EDE8]'
                                }`}>
                                    {a.unlocked ? a.emoji : '🔒'}
                                </div>
                                <div className="min-w-0">
                                    <h4 className="font-medium text-[#3E3835] text-sm">{a.label}</h4>
                                    <p className="text-xs text-[#8C847F] truncate">{a.description}</p>
                                </div>
                                {a.unlocked && (
                                    <span className="ml-auto text-[10px] font-semibold text-[#C6A87C] bg-[#C6A87C]/10 px-2 py-0.5 rounded-full flex-shrink-0">
                                        Earned
                                    </span>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
}
