'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Camera, User, Users, Settings, LogOut, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

export function Sidebar() {
    const pathname = usePathname()

    const navItems = [
        { name: 'Feed', href: '/feed', icon: Home },
        { name: 'Camera', href: '/camera', icon: Camera },
        { name: 'Profile', href: '/profile', icon: User },
        // { name: 'Friends', href: '/friends', icon: Users },
        { name: 'Settings', href: '/settings', icon: Settings },
    ]

    return (
        <nav className="flex flex-col h-full py-8 px-5">
            {/* Brand */}
            <div className="mb-12 px-3">
                <h1 className="text-3xl font-serif text-[#3E3835] tracking-tight">N.o.N</h1>
                <p className="text-[10px] text-[#8C847F] mt-1 tracking-[0.2em] uppercase font-medium">Now or Never</p>
            </div>

            {/* Navigation */}
            <div className="flex-1 space-y-1">
                {navItems.map((item) => {
                    const isActive = pathname.startsWith(item.href)
                    const Icon = item.icon
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "group flex items-center justify-between px-3 py-3 rounded-xl transition-all duration-300 relative overflow-hidden",
                                isActive
                                    ? "bg-white shadow-[0_2px_8px_rgba(0,0,0,0.04)] text-[#3E3835]"
                                    : "text-[#6B6460] hover:bg-white/50 hover:text-[#3E3835]"
                            )}
                        >
                            <div className="flex items-center gap-3 relative z-10">
                                <Icon
                                    className={cn(
                                        "h-5 w-5 transition-transform duration-300",
                                        isActive ? "text-[#C6A87C] scale-110" : "text-[#9C8B7E] group-hover:scale-110 group-hover:text-[#8C847F]"
                                    )}
                                />
                                <span className={cn("text-sm font-medium", isActive ? "font-semibold" : "")}>{item.name}</span>
                            </div>

                            {isActive && (
                                <div className="h-1.5 w-1.5 rounded-full bg-[#C6A87C] mr-1" />
                            )}
                        </Link>
                    )
                })}
            </div>

            {/* Footer / User Info with "Glass" styling */}
            <div className="mt-auto pt-6 border-t border-[#3E3835]/5">
                <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/60 transition-colors cursor-pointer group">
                    <div className="h-9 w-9 rounded-full bg-[#C6A87C] flex items-center justify-center text-white text-xs font-serif shadow-sm group-hover:scale-105 transition-transform">
                        ME
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[#3E3835] truncate leading-tight">My Account</p>
                        <p className="text-[10px] text-[#8C847F] truncate">Pro Member</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[#8C847F] group-hover:translate-x-1 transition-transform" />
                </div>
            </div>
        </nav>
    )
}
