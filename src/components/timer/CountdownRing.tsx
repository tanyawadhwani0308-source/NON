'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface CountdownRingProps {
    durationSeconds: number
    onComplete?: () => void
    size?: number
    strokeWidth?: number
}

export function CountdownRing({
    durationSeconds,
    onComplete,
    size = 280,
    strokeWidth = 4
}: CountdownRingProps) {
    const [timeLeft, setTimeLeft] = useState(durationSeconds)

    useEffect(() => {
        if (timeLeft <= 0) {
            onComplete?.()
            return
        }

        const interval = setInterval(() => {
            setTimeLeft((prev) => prev - 1)
        }, 1000)

        return () => clearInterval(interval)
    }, [timeLeft, onComplete])

    const progress = (timeLeft / durationSeconds) * 100
    const minutes = Math.floor(timeLeft / 60)
    const seconds = timeLeft % 60
    const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`

    // Circular calculations
    const radius = (size - strokeWidth) / 2
    const circumference = radius * 2 * Math.PI
    const strokeDashoffset = circumference - (progress / 100) * circumference

    return (
        <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
            {/* Glow Effect */}
            <div className="absolute inset-0 rounded-full bg-[#C6A87C]/10 blur-3xl animate-pulse" />

            <svg
                width={size}
                height={size}
                viewBox={`0 0 ${size} ${size}`}
                className="transform -rotate-90"
            >
                {/* Track */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke="rgba(255, 255, 255, 0.1)"
                    strokeWidth={strokeWidth}
                    fill="none"
                />

                {/* Progress */}
                <motion.circle
                    initial={{ strokeDashoffset: 0 }}
                    animate={{ strokeDashoffset }}
                    transition={{ duration: 1, ease: 'linear' }}
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke="#C6A87C" // Gold/Beige Glow
                    strokeWidth={strokeWidth}
                    fill="none"
                    strokeDasharray={circumference}
                    strokeLinecap="round"
                    style={{ filter: "drop-shadow(0 0 8px rgba(198, 168, 124, 0.6))" }}
                />
            </svg>

            {/* Time Text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-6xl font-serif font-light text-[#F5F1ED] drop-shadow-md tracking-wider">
                    {formattedTime}
                </span>
                <span className="text-xs font-medium text-[#C6A87C] tracking-[0.2em] mt-2 text-shadow">
                    MIN.SEC
                </span>
            </div>
        </div>
    )
}
