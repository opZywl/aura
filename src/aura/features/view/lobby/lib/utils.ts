import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

// lib
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
