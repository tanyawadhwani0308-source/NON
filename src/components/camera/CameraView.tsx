'use client'

import React, { useRef, useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { RefreshCw, Camera as CameraIcon } from 'lucide-react'
import { CountdownRing } from '@/components/timer/CountdownRing'
import { cn } from '@/lib/utils'

interface CameraViewProps {
    onCapture: (imageSrc: string) => void
    onExpire?: () => void
}

export function CameraView({ onCapture, onExpire }: CameraViewProps) {
    const videoRef = useRef<HTMLVideoElement>(null)
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const streamRef = useRef<MediaStream | null>(null)
    const [stream, setStream] = useState<MediaStream | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment')
    const [isExpired, setIsExpired] = useState(false)

    // Camera initiation logic remains same...
    const startCamera = useCallback(async () => {
        try {
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop())
            }

            const constraints = {
                video: {
                    facingMode: facingMode,
                    width: { ideal: 1920 },
                    height: { ideal: 1080 }
                }
            }

            const mediaStream = await navigator.mediaDevices.getUserMedia(constraints)
            streamRef.current = mediaStream
            setStream(mediaStream)

            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream
            }
            setError(null)
        } catch (err) {
            console.error("Error accessing camera:", err)
            setError("Could not access camera. Please allow permissions.")
        }
    }, [facingMode])

    useEffect(() => {
        let mounted = true
        const init = async () => {
            await startCamera()
            if (!mounted && streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop())
            }
        }
        init()
        return () => {
            mounted = false
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop())
            }
        }
    }, [startCamera])

    const handleExpire = () => {
        setIsExpired(true)
        if (onExpire) onExpire()
    }

    const takePhoto = () => {
        if (isExpired) return

        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current
            const canvas = canvasRef.current

            canvas.width = video.videoWidth
            canvas.height = video.videoHeight

            const ctx = canvas.getContext('2d')
            if (ctx) {
                if (facingMode === 'user') {
                    ctx.translate(canvas.width, 0)
                    ctx.scale(-1, 1)
                }

                ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
                const imageSrc = canvas.toDataURL('image/jpeg', 0.8)
                onCapture(imageSrc)
            }
        }
    }

    const toggleCamera = () => {
        setFacingMode(prev => prev === 'user' ? 'environment' : 'user')
    }

    return (
        <div className="relative h-full w-full bg-[#1A1A1A] flex flex-col items-center justify-center overflow-hidden rounded-[32px]">
            {error ? (
                <div className="text-white p-4 text-center">
                    <p>{error}</p>
                    <Button onClick={startCamera} variant="secondary" className="mt-4">
                        Retry
                    </Button>
                </div>
            ) : (
                <>
                    {/* Video Feed with overlay gradient */}
                    <div className="absolute inset-0 z-0">
                        <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            muted
                            className={`h-full w-full object-cover ${facingMode === 'user' ? '-scale-x-100' : ''}`}
                        />
                        {/* Gradient Overlay for warm look */}
                        <div className="absolute inset-0 bg-[#3E3835]/20 mix-blend-overlay pointer-events-none" />
                        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/60 pointer-events-none" />
                    </div>

                    <canvas ref={canvasRef} className="hidden" />

                    {/* Central Glowing Timer */}
                    <div className="relative z-10 mb-20">
                        <CountdownRing durationSeconds={120} onComplete={handleExpire} size={280} strokeWidth={3} />
                    </div>

                    {/* Bottom Controls */}
                    <div className="absolute bottom-12 inset-x-0 flex flex-col items-center gap-6 z-20 px-8">

                        {/* Capture Button (Pill Shape) */}
                        <button
                            onClick={takePhoto}
                            disabled={isExpired}
                            className={cn(
                                "w-full max-w-xs bg-[#b39b7d] hover:bg-[#C6A87C] text-[#3E3835] font-serif font-medium text-lg h-14 rounded-full shadow-[0_0_20px_rgba(198,168,124,0.3)] transition-all flex items-center justify-center gap-2",
                                isExpired && "opacity-50 cursor-not-allowed bg-gray-500 shadow-none"
                            )}
                        >
                            {!isExpired && <CameraIcon className="w-5 h-5" />}
                            <span>{isExpired ? "Time Expired" : "Capture Moment"}</span>
                        </button>

                        {/* Secondary Controls Row */}
                        <div className="flex items-center gap-4">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={toggleCamera}
                                className="text-white/70 hover:text-white hover:bg-white/10 rounded-full px-4"
                            >
                                <RefreshCw className="h-4 w-4 mr-2" />
                                Flip Camera
                            </Button>
                        </div>
                    </div>
                </>
            )}
        </div>
    )
}
