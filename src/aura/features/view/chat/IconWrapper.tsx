"use client"

import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

interface IconWrapperProps {
  children: ReactNode
  size?: "sm" | "md" | "lg"
  variant?: "default" | "ghost" | "outline"
  className?: string
  onClick?: () => void
}

export default function IconWrapper({
  children,
  size = "md",
  variant = "default",
  className,
  onClick,
}: IconWrapperProps) {
  const baseClasses = "inline-flex items-center justify-center rounded-lg transition-all duration-200"

  const sizeClasses = {
    sm: "w-8 h-8 p-1.5",
    md: "w-10 h-10 p-2",
    lg: "w-12 h-12 p-3",
  }

  const variantClasses = {
    default: "bg-primary text-primary-foreground hover:bg-primary/90",
    ghost: "hover:bg-accent hover:text-accent-foreground",
    outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
  }

  return (
    <div
      className={cn(baseClasses, sizeClasses[size], variantClasses[variant], onClick && "cursor-pointer", className)}
      onClick={onClick}
    >
      {children}
    </div>
  )
}
