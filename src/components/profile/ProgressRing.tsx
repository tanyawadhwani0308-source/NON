'use client'

import { cn } from '@/lib/utils'

interface ProgressRingProps {
    progress: number // 0 to 100
    label: string
    color?: string
    size?: number
    strokeWidth?: number
}

export function ProgressRing({
    progress,
    label,
    color = "#C6A87C",
    size = 120,
    strokeWidth = 8
}: ProgressRingProps) {
    const radius = (size - strokeWidth) / 2
    const circumference = radius * 2 * Math.PI
    const offset = circumference - (progress / 100) * circumference

    return (
        <div className="flex flex-col items-center gap-2">
            <div className="relative" style={{ width: size, height: size }}>
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
                        stroke="#E5E5E5"
                        strokeWidth={strokeWidth}
                        fill="none"
                    />

                    {/* Progress */}
                    <circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        stroke={color}
                        strokeWidth={strokeWidth}
                        fill="none"
                        strokeDasharray={circumference}
                        strokeDashoffset={offset}
                        strokeLinecap="round"
                        style={{ transition: 'stroke-dashoffset 1s ease-in-out' }}
                    />
                </svg>
                {/* Center Text is usually empty for these " donut" charts in the ref image, 
                    but could show % */}
            </div>
            <span className="text-sm font-medium text-[#6B6460] font-serif">{label}</span>
        </div>
    )
}
