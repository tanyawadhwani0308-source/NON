'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, UserPlus, Check } from 'lucide-react'
import { searchUsers, sendFriendRequest } from './actions'

export interface SearchUser {
    id: string
    username: string
    full_name: string
}

export function ClientFriendSearch() {
    const [query, setQuery] = useState('')
    const [results, setResults] = useState<SearchUser[]>([])
    const [searching, setSearching] = useState(false)
    const [sentRequests, setSentRequests] = useState<Set<string>>(new Set())

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault()
        if (query.length < 3) return

        setSearching(true)
        const users = await searchUsers(query)
        setResults(users as SearchUser[])
        setSearching(false)
    }

    const handleSendRequest = async (userId: string) => {
        const res = await sendFriendRequest(userId)
        if (res && typeof res === 'object' && 'success' in res) {
            setSentRequests(prev => new Set(prev).add(userId))
        } else {
            // Handle error (toast or alert)
            alert('Failed or already sent')
        }
    }

    return (
        <div className="space-y-4">
            <form onSubmit={handleSearch} className="relative">
                <Search className="absolute left-3 top-3 h-5 w-5 text-[#9C8B7E]" />
                <Input
                    placeholder="Search usernames..."
                    className="pl-10 bg-white border-transparent shadow-sm h-12 rounded-xl"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                />
            </form>

            {results.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm overflow-hidden p-2 space-y-2">
                    {results.map(user => (
                        <div key={user.id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded-full bg-gray-200 overflow-hidden">
                                    <div className="h-full w-full bg-[#9C8B7E] flex items-center justify-center text-white text-xs">
                                        {user.username?.[0]?.toUpperCase()}
                                    </div>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-[#1A1A1A]">{user.username}</p>
                                    <p className="text-xs text-[#6B6460]">{user.full_name}</p>
                                </div>
                            </div>
                            <Button
                                size="sm"
                                variant="ghost"
                                className="text-[#9C8B7E] hover:text-[#1A1A1A] hover:bg-gray-100"
                                onClick={() => handleSendRequest(user.id)}
                                disabled={sentRequests.has(user.id)}
                            >
                                {sentRequests.has(user.id) ? (
                                    <Check className="h-4 w-4" />
                                ) : (
                                    <UserPlus className="h-4 w-4" />
                                )}
                            </Button>
                        </div>
                    ))}
                </div>
            )}

            {searching && <p className="text-center text-sm text-[#6B6460]">Searching...</p>}
        </div>
    )
}
