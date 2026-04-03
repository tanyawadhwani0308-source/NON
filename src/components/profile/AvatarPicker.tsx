'use client'

import { useState } from 'react'

const EMOJI_AVATARS = [
    '👩🏻‍🎓', '🧑🏻‍🎓', '🤷🏻‍♀️', '🤷🏻‍♂️', '👩🏼‍🍳',
    '👨🏼‍🍳', '🕵🏻‍♀️', '🕵🏼‍♂️', '👩🏻‍⚕️', '🧑🏻‍⚕️',
]

interface AvatarPickerProps {
    currentAvatar?: string | null
}

export function AvatarPicker({ currentAvatar }: AvatarPickerProps) {
    const [open, setOpen] = useState(false)
    const [selected, setSelected] = useState<string | null>(currentAvatar || null)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState<string | null>(null)

    async function handleSelect(emoji: string) {
        // Optimistically update UI immediately so user sees the change at once
        setSelected(emoji)
        setOpen(false)
        setSaving(true)
        setError(null)

        try {
            const res = await fetch('/api/avatar', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ avatar: emoji }),
            })
            const data = await res.json()
            if (!res.ok || data.error) {
                // Roll back if save failed
                setSelected(currentAvatar || null)
                setError('Failed to save avatar. Please try again.')
            }
        } catch {
            setSelected(currentAvatar || null)
            setError('Network error. Please try again.')
        } finally {
            setSaving(false)
        }
    }

    return (
        <>
            {/* Avatar Circle — clickable */}
            <button
                onClick={() => setOpen(true)}
                className="h-24 w-24 rounded-full bg-[#E5E5E5] border-4 border-white shadow-sm flex items-center justify-center text-4xl hover:scale-105 transition-transform duration-200 focus:outline-none focus:ring-2 focus:ring-[#C6A87C] focus:ring-offset-2 group relative"
                title="Change avatar"
                aria-label="Change avatar"
            >
                {selected ? (
                    <span>{selected}</span>
                ) : (
                    <span className="text-3xl text-[#8C847F]">👤</span>
                )}
                {/* Edit hint overlay */}
                <span className="absolute inset-0 rounded-full bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="text-white text-xs font-medium">
                        {saving ? '...' : 'Edit'}
                    </span>
                </span>
            </button>

            {error && (
                <p className="text-xs text-red-500 mt-1">{error}</p>
            )}

            {/* Modal */}
            {open && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    onClick={() => setOpen(false)}
                >
                    {/* Backdrop */}
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

                    {/* Modal Card */}
                    <div
                        className="relative bg-white rounded-[24px] p-8 shadow-2xl max-w-sm w-full z-10 animate-in zoom-in-95 fade-in duration-200"
                        onClick={e => e.stopPropagation()}
                    >
                        <h2 className="text-xl font-serif text-[#3E3835] mb-2 text-center">Choose Your Avatar</h2>
                        <p className="text-sm text-[#8C847F] text-center mb-6">Pick an emoji that represents you</p>

                        <div className="grid grid-cols-5 gap-3">
                            {EMOJI_AVATARS.map((emoji) => (
                                <button
                                    key={emoji}
                                    onClick={() => handleSelect(emoji)}
                                    className={`
                                        h-14 w-full rounded-2xl flex items-center justify-center text-3xl
                                        border-2 transition-all duration-150
                                        hover:scale-110 hover:border-[#C6A87C] hover:bg-[#FAF8F6]
                                        focus:outline-none focus:ring-2 focus:ring-[#C6A87C]
                                        ${selected === emoji
                                            ? 'border-[#C6A87C] bg-[#FAF8F6] shadow-sm'
                                            : 'border-[#E5E5E5] bg-white'
                                        }
                                    `}
                                    aria-label={`Select avatar ${emoji}`}
                                >
                                    {emoji}
                                </button>
                            ))}
                        </div>

                        <button
                            onClick={() => setOpen(false)}
                            className="mt-6 w-full py-2.5 rounded-xl border border-[#E5E5E5] text-sm text-[#6B6460] hover:bg-[#FAF8F6] transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}
        </>
    )
}
