
import * as React from "react"
import { cn } from "@/lib/utils"

interface GlowProps {
  className?: string
  variant?: "top" | "bottom" | "both"
}

export function Glow({ className, variant = "both" }: GlowProps) {
  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-0 z-0",
        {
          "top-[-200px]": variant === "top",
          "bottom-[-200px]": variant === "bottom",
          "inset-[-200px]": variant === "both",
        },
        className
      )}
      style={{
        transform: "translate3d(0, 0, 0)",
      }}
    >
      <div
        className={cn(
          "mx-auto aspect-square w-full max-w-3xl rounded-full",
          {
            "bg-gradient-radial from-brand-primary/40 via-brand-primary/10 to-transparent blur-3xl":
              variant === "top" || variant === "both",
            "bg-gradient-radial from-brand-secondary/30 via-brand-secondary/10 to-transparent blur-3xl":
              variant === "bottom" || variant === "both",
          }
        )}
      />
    </div>
  )
}
