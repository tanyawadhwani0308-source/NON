'use client'

import React from 'react'
import { Sidebar } from './Sidebar'
import { RightPanel } from './RightPanel'

/**
 * DashboardLayout (Strict CSS Grid System)
 * 
 * 1. Background: Handled by globals.css (Canvas)
 * 2. Container: Centered, Max 1350px, Rounded 20px
 * 3. Grid: 240px | 1fr | 300px
 */
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="h-screen w-full flex items-center justify-center p-4 md:p-6 overflow-hidden">

            {/* 2. Main App Container - Product Window */}
            <div className="
        w-full max-w-[1350px] 
        h-full max-h-[900px] 
        bg-[#F5F1ED] 
        rounded-[20px] 
        shadow-[0_20px_40px_-10px_rgba(0,0,0,0.1)] 
        border border-white/50
        relative
        overflow-hidden
        grid
        grid-cols-[240px_1fr_300px]
      ">

                {/* 3a. Sidebar Column */}
                <aside className="h-full bg-[#EBE6E0] border-r border-[#3E3835]/5 overflow-hidden">
                    <Sidebar />
                </aside>

                {/* 3b. Main Content Column */}
                <main className="h-full relative flex flex-col min-w-0 bg-[#F5F1ED]">
                    {/* Scrollable Area */}
                    <div className="flex-1 overflow-y-auto scroll-container p-8 md:p-10">
                        {/* Content Constraint inside Grid Cell */}
                        <div className="max-w-[800px] mx-auto w-full animate-enter pb-20">
                            {children}
                        </div>
                    </div>
                </main>

                {/* 3c. Right Panel Column */}
                <aside className="h-full bg-[#F9F7F5] border-l border-[#3E3835]/5 overflow-hidden hidden xl:block">
                    <RightPanel />
                </aside>

            </div>
        </div>
    )
}
