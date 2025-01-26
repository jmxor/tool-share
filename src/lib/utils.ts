import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(dateString) {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleString('default', { month: 'long' });
    const year = date.getFullYear();

    const ordinal = (n) =>
        n + (['st', 'nd', 'rd'][(n % 10) - 1] || 'th');

    return `${ordinal(day)} ${month} ${year}`;
}
