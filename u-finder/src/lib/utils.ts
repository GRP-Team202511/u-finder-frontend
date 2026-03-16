import type { ClassValue } from "clsx"
import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Helper to detect empty form values when saving.
// Used to automatically remove placeholder entries that contain no user input.
export function isBlankValue(value: unknown) {
  return typeof value !== "string" || !value.trim()
}
