'use client'

import { useState, useEffect } from 'react'

const TIMER_DURATION = 120 // 2 minutes in seconds
const STORAGE_KEY = 'non_timer_start'

export function useDailyTimer() {
    const [timeLeft, setTimeLeft] = useState<number | null>(null)
    const [isExpired, setIsExpired] = useState(false)
    const [isActive, setIsActive] = useState(false)

    const checkTimer = (startTime: number) => {
        const now = Date.now()
        const elapsed = Math.floor((now - startTime) / 1000)
        const remaining = TIMER_DURATION - elapsed

        if (remaining <= 0) {
            setTimeLeft(0)
            setIsExpired(true)
            setIsActive(false)
            // Optionally clear storage if you want it to reset next day, 
            // but for "come back tomorrow" we might want to keep it or use a different flag.
            // For now, let's keep it "expired" state.
        } else {
            setTimeLeft(remaining)
            setIsExpired(false)
        }
    }

    useEffect(() => {
        // partial hydration check or similar could go here
        const storedStart = localStorage.getItem(STORAGE_KEY)
        if (storedStart) {
            setTimeout(() => {
                checkTimer(parseInt(storedStart, 10))
                setIsActive(true)
            }, 0)
        }
    }, [])

    useEffect(() => {
        if (!isActive) return

        const interval = setInterval(() => {
            const storedStart = localStorage.getItem(STORAGE_KEY)
            if (storedStart) {
                checkTimer(parseInt(storedStart, 10))
            }
        }, 1000)

        // Initial check immediately
        const storedStart = localStorage.getItem(STORAGE_KEY)
        if (storedStart) {
            setTimeout(() => checkTimer(parseInt(storedStart, 10)), 0)
        }

        return () => clearInterval(interval)
    }, [isActive])



    const startTimer = () => {
        const now = Date.now()
        localStorage.setItem(STORAGE_KEY, now.toString())
        setIsActive(true)
        setTimeLeft(TIMER_DURATION)
    }

    const resetTimer = () => {
        localStorage.removeItem(STORAGE_KEY)
        setIsActive(false)
        setIsExpired(false)
        setTimeLeft(null)
    }

    return {
        timeLeft,
        isExpired,
        isActive,
        startTimer,
        resetTimer
    }
}
