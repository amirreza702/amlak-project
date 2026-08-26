import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * کلاس‌های Tailwind را به‌صورت امن با هم ترکیب می‌کند.
 *
 * مثال:
 * cn("p-4", isActive && "bg-brand-navy", "p-6")
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
