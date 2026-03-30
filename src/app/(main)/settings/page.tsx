'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useRouter } from 'next/navigation'
import { LogOut, Save, User, ShieldAlert } from 'lucide-react'

export default function SettingsPage() {
    const router = useRouter()
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
    const [loading, setLoading] = useState(false)

    async function handleUpdate(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setLoading(true)
        setMessage(null)

        const formData = new FormData(e.currentTarget)
        const username = formData.get('username') as string

        try {
            // Need to hit a custom API route for client-side Firebase profile updates 
            // OR we can just use the Server Action we wrote, but standard in Nextjs 15
            // is passing the form to the server action. Let's try to stick to the server action we have:
            const { updateProfile } = await import('./actions')
            const res = await updateProfile(formData)

            if (res?.error) {
                setMessage({ type: 'error', text: res.error })
            } else if (res?.success) {
                setMessage({ type: 'success', text: res.success })
                // Reset form
                e.currentTarget.reset()
            }
        } catch (err) {
            setMessage({ type: 'error', text: 'Failed to update' })
        } finally {
            setLoading(false)
        }
    }

    async function handleLogout() {
        // Hit our custom API route to clear the httpOnly session cookie
        await fetch('/auth/signout', { method: 'POST' })
        router.push('/login')
    }

    return (
        <div className="max-w-2xl mx-auto space-y-10 animate-in fade-in">
            <header className="pb-6 border-b border-[#3E3835]/10">
                <h1 className="text-3xl font-serif text-[#3E3835]">Settings</h1>
                <p className="text-[#8C847F] mt-1">Manage your account preferences.</p>
            </header>

            {/* Profile Settings */}
            <section className="bg-white p-8 rounded-[24px] shadow-sm border border-[#E5E5E5] space-y-6">
                <div className="flex items-center gap-3 mb-2">
                    <User className="w-5 h-5 text-[#C6A87C]" />
                    <h2 className="text-lg font-medium text-[#3E3835]">Profile Information</h2>
                </div>

                <form onSubmit={handleUpdate} className="space-y-4">
                    <div className="space-y-2">
                        <label htmlFor="username" className="text-sm font-medium text-[#6B6460]">Username</label>
                        <Input
                            name="username"
                            id="username"
                            placeholder="Enter new username"
                            className="bg-[#FAF8F6] border-0 h-12 rounded-xl"
                        />
                    </div>

                    {message && (
                        <p className={`text-sm ${message.type === 'error' ? 'text-red-500' : 'text-green-500'}`}>
                            {message.text}
                        </p>
                    )}

                    <div className="pt-2">
                        <Button disabled={loading} type="submit" className="w-full bg-[#3E3835] hover:bg-[#2A2522] text-white">
                            {loading ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </div>
                </form>
            </section>

            {/* Account Actions */}
            <section className="bg-white p-8 rounded-[24px] shadow-sm border border-[#E5E5E5] space-y-6">
                <div className="flex items-center gap-3 mb-2">
                    <ShieldAlert className="w-5 h-5 text-[#C6A87C]" />
                    <h2 className="text-lg font-medium text-[#3E3835]">Account Actions</h2>
                </div>

                <div className="space-y-4">
                    <Button onClick={handleLogout} variant="outline" className="w-full h-12 justify-start text-[#6B6460]">
                        <LogOut className="w-4 h-4 mr-2" /> Log Out
                    </Button>

                    <Button variant="ghost" className="w-full h-12 justify-start text-red-500 hover:text-red-600 hover:bg-red-50">
                        Delete Account
                    </Button>
                </div>
            </section>
        </div>
    )
}
