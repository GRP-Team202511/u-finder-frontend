// Derived from shadcn-vue.
// Source: https://github.com/unovue/shadcn-vue
// License: MIT
import type { ClassValue } from "clsx"
import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
