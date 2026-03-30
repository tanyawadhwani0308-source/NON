import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { LikeButton } from './LikeButton'

interface PostProfile {
    username: string | null
    avatar_url: string | null
}

export interface Post {
    id: string
    image_url: string
    context: string
    location: string | null
    created_at: string
    profiles: PostProfile | null // Joined data
}

interface PostCardProps {
    post: Post
}

export function PostCard({ post }: PostCardProps) {
    const timeAgo = formatDistanceToNow(new Date(post.created_at), { addSuffix: true })

    // Context colors map
    const contextColors: Record<string, string> = {
        study: 'bg-[#B8C5B0] text-[#1A1A1A]',
        work: 'bg-[#A39B94] text-white',
        chill: 'bg-[#C5D5E0] text-[#1A1A1A]',
        fitness: 'bg-[#D4A59A] text-white',
    }

    return (
        <Card className="border-none shadow-sm overflow-hidden mb-8 bg-white rounded-3xl">
            <CardHeader className="flex flex-row items-center justify-between p-4 pb-2">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-gray-200 overflow-hidden">
                        {/* Avatar */}
                        {post.profiles?.avatar_url ? (
                            <img src={post.profiles.avatar_url} alt={post.profiles.username || 'User'} className="h-full w-full object-cover" />
                        ) : (
                            <div className="h-full w-full bg-[#9C8B7E] flex items-center justify-center text-white text-xs">
                                {post.profiles?.username?.[0]?.toUpperCase() || '?'}
                            </div>
                        )}
                    </div>
                    <div>
                        <p className="font-medium text-[#1A1A1A]">{post.profiles?.username || 'Anonymous'}</p>
                        {post.location && (
                            <div className="flex items-center text-xs text-[#6B6460]">
                                <MapPin className="h-3 w-3 mr-1" />
                                {post.location}
                            </div>
                        )}
                    </div>
                </div>
                <span className={`text-xs px-3 py-1 rounded-full font-medium ${contextColors[post.context] || 'bg-gray-100'}`}>
                    {post.context}
                </span>
            </CardHeader>

            <div className="relative aspect-[4/5] w-full bg-gray-100">
                <img src={post.image_url} alt="Daily Moment" className="h-full w-full object-cover" />
            </div>

            <CardFooter className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <LikeButton postId={post.id} />
                </div>
                <span className="text-sm text-[#6B6460]">{timeAgo}</span>
            </CardFooter>
        </Card>
    )
}
