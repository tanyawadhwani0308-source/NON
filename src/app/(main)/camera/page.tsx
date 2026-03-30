'use client'

import React, { useRef, useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { useDailyTimer } from '@/hooks/useDailyTimer'
import { uploadPost } from './actions'
import { cn } from '@/lib/utils'
import { Check, RotateCcw, Camera as CameraIcon } from 'lucide-react'

// Elegant Circular Progress
function TimerRing({ timeLeft, totalTime = 120 }: { timeLeft: number, totalTime?: number }) {
    const radius = 60
    const circumference = 2 * Math.PI * radius
    const progress = timeLeft / totalTime
    const dashoffset = circumference - (progress * circumference)

    const minutes = Math.floor(timeLeft / 60)
    const seconds = timeLeft % 60
    const formatted = `${minutes}:${seconds.toString().padStart(2, '0')}`

    return (
        <div className="relative flex items-center justify-center w-40 h-40">
            {/* Glow */}
            <div className="absolute inset-0 bg-[#C6A87C]/20 blur-3xl rounded-full animate-pulse" />

            <svg className="w-full h-full -rotate-90 relative z-10">
                <circle cx="80" cy="80" r={radius} stroke="rgba(255,255,255,0.1)" strokeWidth="6" fill="none" />
                <circle
                    cx="80" cy="80" r={radius}
                    stroke="#C6A87C" strokeWidth="6" fill="none"
                    strokeDasharray={circumference}
                    strokeDashoffset={dashoffset}
                    strokeLinecap="round"
                    className="transition-all duration-1000 ease-linear shadow-[0_0_10px_#C6A87C]"
                />
            </svg>
            <div className="absolute z-20 text-center">
                <span className="block text-4xl font-serif font-medium text-white shadow-black drop-shadow-md">{formatted}</span>
                <span className="block text-[10px] uppercase tracking-[0.2em] text-white/50 mt-1">Remaining</span>
            </div>
        </div>
    )
}

export default function CameraPage() {
    const router = useRouter()
    const { timeLeft, isExpired, isActive, startTimer } = useDailyTimer()

    // Camera State
    const videoRef = useRef<HTMLVideoElement>(null)
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const [stream, setStream] = useState<MediaStream | null>(null)
    const [photo, setPhoto] = useState<string | null>(null)
    const [uploading, setUploading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [context, setContext] = useState('chill')

    // Start Camera when timer activates
    useEffect(() => {
        if (isActive && !isExpired && !photo && !stream) {
            initCamera()
        }
        return () => {
            if (stream) stream.getTracks().forEach(t => t.stop())
        }
    }, [isActive, isExpired, photo])

    const initCamera = async () => {
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: { width: { ideal: 1920 }, height: { ideal: 1080 }, facingMode: 'user' }
            })
            setStream(mediaStream)
            if (videoRef.current) videoRef.current.srcObject = mediaStream
        } catch (e) {
            setError('Camera permission available.')
        }
    }

    const capture = () => {
        if (!videoRef.current || !canvasRef.current) return
        const vid = videoRef.current
        const cvs = canvasRef.current

        cvs.width = vid.videoWidth
        cvs.height = vid.videoHeight

        const ctx = cvs.getContext('2d')
        if (ctx) {
            ctx.translate(cvs.width, 0)
            ctx.scale(-1, 1)
            ctx.drawImage(vid, 0, 0)
            setPhoto(cvs.toDataURL('image/jpeg', 0.85))
        }
    }

    const retake = () => {
        setPhoto(null)
    }

    const submitPost = async () => {
        if (!photo) return
        setUploading(true)
        const formData = new FormData()
        formData.append('image', photo)
        formData.append('context', context)

        try {
            const res = await uploadPost(formData)
            if (res?.error) throw new Error(res.error)
            router.push('/feed')
        } catch (e) {
            setError('Failed to upload.')
            setUploading(false)
        }
    }

    // --- RENDER STATES ---

    // 1. Initial State (Focus Mode)
    if (!isActive && !isExpired) {
        return (
            <div className="h-full flex flex-col items-center justify-center animate-enter text-center">
                <div className="mb-12 relative">
                    <div className="absolute inset-0 bg-[#C6A87C] blur-[60px] opacity-20 rounded-full" />
                    <CameraIcon className="w-24 h-24 text-[#3E3835] relative z-10" strokeWidth={1} />
                </div>

                <h1 className="text-5xl font-serif text-[#3E3835] mb-6">Today&apos;s Moment</h1>
                <p className="text-[#8C847F] max-w-md mx-auto text-lg leading-relaxed mb-12">
                    Ready to be authentic? You have exactly <span className="text-[#3E3835] font-medium">2 minutes</span> to capture your reality. No filters. No second chances.
                </p>

                <button
                    onClick={startTimer}
                    className="group relative px-10 py-5 bg-[#3E3835] rounded-full text-white text-lg font-medium shadow-[0_10px_30px_rgba(62,56,53,0.3)] hover:shadow-[0_15px_40px_rgba(62,56,53,0.4)] hover:translate-y-[-2px] transition-all duration-300 overflow-hidden"
                >
                    <span className="relative z-10 font-serif tracking-wide">Begin Capture</span>
                    <div className="absolute inset-0 bg-[#4E4642] transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500 ease-out" />
                </button>
            </div>
        )
    }

    // 2. Expired State
    if (isExpired) {
        return (
            <div className="h-full flex flex-col items-center justify-center animate-enter text-center">
                <div className="h-32 w-32 bg-[#E5E5E5] rounded-full flex items-center justify-center mb-8 border border-white shadow-inner">
                    <span className="text-5xl opacity-50">⏳</span>
                </div>
                <h1 className="text-4xl font-serif text-[#3E3835] mb-4">Moment Missed</h1>
                <p className="text-[#8C847F] text-lg">The window has closed. Come back tomorrow.</p>
                <Button variant="ghost" onClick={() => router.push('/feed')} className="mt-8 hover:bg-[#F5F1ED]">Go to Feed</Button>
            </div>
        )
    }

    // 3. Active Camera State
    return (
        <div className="h-full flex flex-col items-center justify-center gap-6 animate-enter relative py-6">

            {/* Viewport (Camera/Photo) */}
            <div className="relative w-full max-w-[800px] flex-1 min-h-0 bg-black rounded-[32px] overflow-hidden shadow-[0_20px_50px_-10px_rgba(0,0,0,0.3)] border-[6px] border-white ring-1 ring-[#000]/5 group">
                {/* Timer Overlay */}
                <div className="absolute top-6 right-6 z-20 pointer-events-none scale-75 origin-top-right opacity-80 group-hover:opacity-100 transition-opacity">
                    {timeLeft !== null && <TimerRing timeLeft={timeLeft} />}
                </div>

                {error ? (
                    <div className="absolute inset-0 flex items-center justify-center text-white/50 bg-[#1A1A1A]">
                        {error}
                    </div>
                ) : photo ? (
                    <img src={photo} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                    <video
                        ref={videoRef}
                        autoPlay playsInline muted
                        className="w-full h-full object-cover transform -scale-x-100"
                    />
                )}
                <canvas ref={canvasRef} className="hidden" />
            </div>

            {/* Controls */}
            <div className="w-full max-w-[600px] flex-shrink-0 min-h-[100px] flex items-center justify-center">
                {!photo ? (
                    <button
                        onClick={capture}
                        className="h-24 w-24 rounded-full border border-[#C6A87C]/30 p-2 hover:scale-105 transition-all duration-300 group"
                    >
                        <div className="h-full w-full bg-[#C6A87C] rounded-full shadow-[0_0_20px_rgba(198,168,124,0.4)] group-hover:shadow-[0_0_30px_rgba(198,168,124,0.6)] flex items-center justify-center">
                            <CameraIcon className="w-8 h-8 text-white opacity-90" />
                        </div>
                    </button>
                ) : (
                    <div className="flex flex-col items-center gap-6 w-full animate-enter">
                        {/* Context Pills */}
                        <div className="flex gap-2 p-1 bg-white/60 backdrop-blur-md rounded-full shadow-sm border border-white/40">
                            {['study', 'work', 'chill', 'fitness'].map(c => (
                                <button
                                    key={c}
                                    onClick={() => setContext(c)}
                                    className={cn(
                                        "px-5 py-2 rounded-full text-sm font-medium transition-all capitalize",
                                        context === c ? "bg-[#3E3835] text-white shadow-md" : "text-[#8C847F] hover:bg-white/50"
                                    )}
                                >
                                    {c}
                                </button>
                            ))}
                        </div>

                        <div className="flex gap-4 w-full px-4">
                            <Button variant="outline" onClick={retake} className="flex-1 h-14 rounded-2xl border-[#8C847F]/20 text-[#8C847F] hover:bg-white text-lg">
                                <RotateCcw className="mr-2 h-5 w-5" /> Retake
                            </Button>
                            <Button
                                onClick={submitPost}
                                disabled={uploading}
                                className="flex-1 h-14 rounded-2xl bg-[#C6A87C] hover:bg-[#B5966A] text-white text-lg font-medium shadow-lg hover:shadow-xl hover:translate-y-[-2px] transition-all"
                            >
                                {uploading ? 'Posting...' : 'Share Moment'} <Check className="ml-2 h-5 w-5" />
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
