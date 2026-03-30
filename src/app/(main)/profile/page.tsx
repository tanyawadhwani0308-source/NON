import { getAuthUser } from '@/lib/firebase/auth';
import { adminDb } from '@/lib/firebase/server';
import { redirect } from 'next/navigation';
import { ProgressRing } from '@/components/profile/ProgressRing';
import { Button } from '@/components/ui/button';
import { Settings, Award, Calendar } from 'lucide-react';
import Link from 'next/link';

export default async function ProfilePage() {
    const user = await getAuthUser();

    if (!user) {
        redirect('/login');
    }

    // Fetch Profile Data
    const profileDoc = await adminDb.collection('users').doc(user.uid).get();
    const profile = profileDoc.data();

    const now = new Date().toISOString();

    // Fetch Today's Post
    const postsSnap = await adminDb.collection('posts')
        .where('user_id', '==', user.uid)
        .where('expires_at', '>', now)
        .limit(1)
        .get();

    const todaysPost = postsSnap.empty ? null : postsSnap.docs[0].data();

    // Mock stats
    const stats = {
        monthlyProgress: 65,
        completion: 82,
        activity: 45
    };

    return (
        <div className="space-y-8 animate-in fade-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-[#3E3835]/10">
                <div className="flex items-center gap-6">
                    <div className="h-24 w-24 rounded-full bg-[#E5E5E5] border-4 border-white shadow-sm flex items-center justify-center text-3xl text-[#8C847F]">
                        {profile?.username?.[0]?.toUpperCase() || '?'}
                    </div>
                    <div>
                        <h1 className="text-4xl font-serif text-[#3E3835]">{profile?.username || 'User'}</h1>
                        <p className="text-[#8C847F] mt-1">Joined {new Date().getFullYear()}</p>
                        <div className="flex items-center gap-2 mt-2 text-[#C6A87C] font-medium bg-[#FAF8F6] px-3 py-1 rounded-full w-fit">
                            <span>🔥</span>
                            <span>Streak: {profile?.streak || 0} Days</span>
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

            {/* 2-Column Grid Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                {/* Left Column: Analytics & Badges */}
                <div className="space-y-8">
                    {/* Monthly Analytics */}
                    <div className="bg-white p-8 rounded-[24px] shadow-sm border border-[#E5E5E5]">
                        <h3 className="text-lg font-serif text-[#3E3835] mb-6 flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-[#C6A87C]" /> Monthly Overview
                        </h3>
                        <div className="flex justify-around items-center">
                            <div className="flex flex-col items-center">
                                <ProgressRing progress={stats.monthlyProgress} label="Progress" color="#C6A87C" size={100} strokeWidth={6} />
                                <span className="text-2xl font-serif mt-2">{stats.monthlyProgress}%</span>
                            </div>
                            <div className="flex flex-col items-center">
                                <ProgressRing progress={stats.completion} label="Completion" color="#D4A59A" size={100} strokeWidth={6} />
                                <span className="text-2xl font-serif mt-2">{stats.completion}%</span>
                            </div>
                        </div>
                    </div>

                    {/* Today's Moment Card */}
                    <div className="bg-[#3E3835] p-8 rounded-[24px] text-white shadow-lg relative overflow-hidden">
                        <div className="relative z-10">
                            <h3 className="text-lg font-serif mb-2">Today&apos;s Moment</h3>
                            {todaysPost ? (
                                <div className="mt-4 aspect-[4/3] rounded-xl overflow-hidden border border-white/20">
                                    <img src={todaysPost.image_url} alt="Today" className="w-full h-full object-cover" />
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
                        {/* Blob Background */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-[#C6A87C]/20 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
                    </div>
                </div>

                {/* Right Column: Badges & History stub */}
                <div className="space-y-8">
                    <div className="bg-white p-8 rounded-[24px] shadow-sm border border-[#E5E5E5] h-full">
                        <h3 className="text-lg font-serif text-[#3E3835] mb-6 flex items-center gap-2">
                            <Award className="w-5 h-5 text-[#C6A87C]" /> Achievements
                        </h3>

                        <div className="space-y-4">
                            <div className="flex items-center gap-4 p-4 rounded-xl bg-[#FAF8F6] border border-[#E5E5E5]">
                                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#FBEd96] to-[#ABECD6] flex items-center justify-center shadow-sm">
                                    <Award className="text-white w-5 h-5" />
                                </div>
                                <div>
                                    <h4 className="font-medium text-[#3E3835]">Early Bird</h4>
                                    <p className="text-xs text-[#8C847F]">Post before 8 AM for 5 days</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 p-4 rounded-xl bg-[#FAF8F6] border border-[#E5E5E5] opacity-60">
                                <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                                    <Award className="text-gray-400 w-5 h-5" />
                                </div>
                                <div>
                                    <h4 className="font-medium text-[#3E3835]">Streak Master</h4>
                                    <p className="text-xs text-[#8C847F]">Reach 30 day streak</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    )
}
