'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Heart } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LikeButtonProps {
    postId: string
    initialLiked?: boolean
    likeCount?: number // Optional for MVP
}

export function LikeButton({ postId, initialLiked = false }: LikeButtonProps) {
    const [liked, setLiked] = useState(initialLiked)

    const toggleLike = async () => {
        // Optimistic update
        setLiked(!liked)

        // TODO: Call server action to toggle like in DB
        // await toggleLikeAction(postId)
    }

    return (
        <Button
            variant="ghost"
            size="icon"
            className="text-[#1A1A1A] hover:bg-transparent"
            onClick={toggleLike}
        >
            <Heart className={cn("h-6 w-6 transition-colors", liked ? "fill-red-500 text-red-500" : "")} />
        </Button>
    )
}
