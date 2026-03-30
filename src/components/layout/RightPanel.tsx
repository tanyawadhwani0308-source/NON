'use client'

import React from 'react'
import { Calendar, TrendingUp } from 'lucide-react'

export function RightPanel() {
    return (
        <div className="h-full py-8 px-6 flex flex-col gap-8">
            {/* Section 1: Quote / Motto */}
            <div className="space-y-2">
                <h3 className="text-[10px] uppercase tracking-[0.15em] text-[#8C847F] font-bold">Motto</h3>
                <div className="p-5 bg-white rounded-[20px] shadow-[0_4px_16px_rgba(0,0,0,0.02)] border border-[#3E3835]/5">
                    <p className="font-serif text-[#3E3835] italic leading-relaxed text-sm">
                        &ldquo;Authenticity is a collection of choices that we have to make every day.&rdquo;
                    </p>
                </div>
            </div>

            {/* Section 2: Streak Mini-Widget */}
            <div className="space-y-2">
                <h3 className="text-[10px] uppercase tracking-[0.15em] text-[#8C847F] font-bold">Activity</h3>
                <div className="p-5 bg-[#3E3835] rounded-[20px] shadow-lg text-white relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300">
                    {/* Glow effect */}
                    <div className="absolute top-0 right-0 w-20 h-20 bg-[#C6A87C] blur-[40px] opacity-20 group-hover:opacity-30 transition-opacity" />

                    <div className="flex items-center gap-3 mb-3">
                        <TrendingUp className="w-5 h-5 text-[#C6A87C]" />
                        <span className="text-sm font-medium">Current Streak</span>
                    </div>
                    <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-serif">12</span>
                        <span className="text-sm text-white/60">days</span>
                    </div>
                </div>
            </div>

            {/* Section 3: Placeholder / Calendar */}
            <div className="flex-1 bg-white/40 rounded-[20px] border border-[#3E3835]/5 p-5 flex flex-col items-center justify-center text-center space-y-3">
                <Calendar className="w-8 h-8 text-[#DCCFC2]" />
                <p className="text-xs text-[#8C847F]">Coming soon:<br />Memory Lane</p>
            </div>
        </div>
    )
}
