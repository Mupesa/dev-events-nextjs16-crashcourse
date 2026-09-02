import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Return the calendar portion of an event date for display. */
export function formatEventDate(date: string): string {
  return date.includes("T") ? date.split("T")[0] : date;
}
