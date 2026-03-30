'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        console.error(error)
    }, [error])

    return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4 text-center">
            <h2 className="text-2xl font-serif text-[#3E3835]">Something went wrong!</h2>
            <p className="text-[#8C847F]">We couldn&apos;t load this section.</p>
            <Button
                onClick={() => reset()}
                className="rounded-full bg-[#3E3835] text-white hover:bg-[#2A2522]"
            >
                Try again
            </Button>
        </div>
    )
}
