'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Lock } from 'lucide-react'

export function LockedFeed() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6 animate-in fade-in">
            <div className="h-24 w-24 bg-[#E5E5E5] rounded-full flex items-center justify-center border-4 border-white shadow-sm">
                <Lock className="h-10 w-10 text-[#8C847F]" />
            </div>

            <div className="space-y-2 max-w-md">
                <h2 className="text-3xl font-serif text-[#3E3835]">Feed Locked</h2>
                <p className="text-[#8C847F]">
                    To see what your friends are up to, you must first share your own authentic moment today.
                </p>
            </div>

            <Button asChild className="h-14 px-8 rounded-full text-lg bg-[#3E3835] hover:bg-[#2A2522] text-white shadow-lg transition-transform hover:scale-105">
                <Link href="/camera">Post to Unlock</Link>
            </Button>
        </div>
    )
}
