import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cn } from "@/lib/utils"

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "secondary" | "outline" | "ghost" | "link"
    size?: "default" | "sm" | "lg" | "icon"
    asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = "primary", size = "default", asChild = false, ...props }, ref) => {
        const Comp = asChild ? Slot : "button"
        return (
            <Comp
                className={cn(
                    "inline-flex items-center justify-center rounded-xl text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
                    {
                        "bg-[#1A1A1A] text-[#FAF8F6] shadow hover:bg-[#1A1A1A]/90": variant === "primary",
                        "bg-[#F5F1ED] text-[#1A1A1A] hover:bg-[#F5F1ED]/80": variant === "secondary",
                        "border border-[#A39B94] bg-transparent shadow-sm hover:bg-[#F5F1ED] text-[#1A1A1A]": variant === "outline",
                        "hover:bg-[#F5F1ED] hover:text-[#1A1A1A]": variant === "ghost",
                        "text-[#1A1A1A] underline-offset-4 hover:underline": variant === "link",
                        "h-12 px-6 py-3": size === "default",
                        "h-9 rounded-md px-3": size === "sm",
                        "h-14 rounded-xl px-8 text-lg": size === "lg",
                        "h-10 w-10": size === "icon",
                    },
                    className
                )}
                ref={ref}
                {...props}
            />
        )
    }
)
Button.displayName = "Button"

export { Button }
