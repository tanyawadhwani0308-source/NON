import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export type ContextType = 'study' | 'work' | 'chill' | 'fitness'

interface ContextSelectorProps {
    selected?: ContextType
    onSelect: (context: ContextType) => void
}

const contexts: { id: ContextType; label: string; colorVar: string }[] = [
    { id: 'study', label: 'Study', colorVar: 'var(--context-study)' },
    { id: 'work', label: 'Work', colorVar: 'var(--context-work)' },
    { id: 'chill', label: 'Chill', colorVar: 'var(--context-chill)' },
    { id: 'fitness', label: 'Fitness', colorVar: 'var(--context-fitness)' },
]

export function ContextSelector({ selected, onSelect }: ContextSelectorProps) {
    return (
        <div className="flex flex-wrap gap-2 justify-center">
            {contexts.map((ctx) => (
                <button
                    key={ctx.id}
                    onClick={() => onSelect(ctx.id)}
                    className={cn(
                        "px-4 py-2 rounded-full text-sm font-medium transition-all duration-300",
                        selected === ctx.id
                            ? "scale-105 shadow-md text-white"
                            : "bg-white/10 text-white/70 hover:bg-white/20"
                    )}
                    style={{
                        backgroundColor: selected === ctx.id ? ctx.colorVar : undefined
                    }}
                >
                    {ctx.label}
                </button>
            ))}
        </div>
    )
}
