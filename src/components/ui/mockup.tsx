
import * as React from "react"
import { cn } from "@/lib/utils"

interface MockupProps {
  children: React.ReactNode
  className?: string
  type?: "browser" | "responsive"
}

export function Mockup({
  children,
  className,
  type = "browser",
  ...props
}: MockupProps & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "w-full overflow-hidden rounded-xl border border-border bg-background/80 shadow-lg backdrop-blur-sm",
        type === "browser" && "rounded-t-xl",
        className
      )}
      {...props}
    >
      {type === "browser" && (
        <div className="flex items-center gap-1.5 border-b border-border bg-muted/30 px-3 py-2">
          <div className="h-2 w-2 rounded-full bg-border" />
          <div className="h-2 w-2 rounded-full bg-border" />
          <div className="h-2 w-2 rounded-full bg-border" />
        </div>
      )}
      <div className="overflow-hidden">{children}</div>
    </div>
  )
}

interface MockupFrameProps {
  children: React.ReactNode
  className?: string
  size?: "small" | "medium" | "large" | "full"
}

export function MockupFrame({
  children,
  className,
  size = "medium",
  ...props
}: MockupFrameProps & React.HTMLAttributes<HTMLDivElement>) {
  const sizeClasses = {
    small: "max-w-xl",
    medium: "max-w-2xl",
    large: "max-w-4xl",
    full: "max-w-full",
  }

  return (
    <div
      className={cn("mx-auto w-full", sizeClasses[size], className)}
      {...props}
    >
      {children}
    </div>
  )
}
