'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from '@/lib/firebase/client'

export default function LoginPage() {
    const router = useRouter()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password)
            const idToken = await userCredential.user.getIdToken()

            // Call API to set session cookie for middleware
            const res = await fetch('/api/auth/session', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ idToken })
            })

            if (res.ok) {
                router.push('/')
                router.refresh()
            } else {
                setError('Failed to securely log in.')
            }
        } catch (err: any) {
            setError(err.message || 'Login failed')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-[#DCCFC2] flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-[400px] bg-[#F5F1ED] p-10 rounded-[32px] shadow-2xl border border-white/50">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-serif text-[#3E3835] mb-2">N.o.N</h1>
                    <p className="text-[#8C847F] text-sm uppercase tracking-widest">Login to your account</p>
                </div>

                <form className="space-y-4" onSubmit={handleLogin}>
                    {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                    <div className="space-y-2">
                        <label htmlFor="email" className="text-sm font-medium text-[#6B6460] ml-1">Email</label>
                        <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="bg-white border-0 h-12 rounded-xl shadow-sm" placeholder="you@example.com" />
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="password" className="text-sm font-medium text-[#6B6460] ml-1">Password</label>
                        <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="bg-white border-0 h-12 rounded-xl shadow-sm" placeholder="••••••••" />
                    </div>

                    <div className="pt-4 space-y-3">
                        <Button type="submit" disabled={loading} className="w-full h-12 rounded-xl bg-[#3E3835] hover:bg-[#2A2522] text-white shadow-lg text-lg font-serif">
                            {loading ? 'Signing In...' : 'Sign In'}
                        </Button>
                        <Button type="button" onClick={() => router.push('/signup')} variant="outline" className="w-full h-12 rounded-xl border-[#8C847F]/20 text-[#6B6460] hover:bg-white/50">
                            Create Account
                        </Button>
                    </div>
                </form>

                <div className="mt-8 text-center">
                    <Link href="#" className="text-xs text-[#8C847F] hover:text-[#3E3835] underline">Forgot your password?</Link>
                </div>
            </div>
        </div>
    )
}
