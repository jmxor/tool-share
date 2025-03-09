import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { formatDistanceToNow } from 'date-fns';
import { enGB } from 'date-fns/locale';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export function formatDate(dateIn: Date) {
    const date = new Date(dateIn);
    const day = date.getDate();
    const month = date.toLocaleString('default', { month: 'long' });
    const year = date.getFullYear();

    const ordinal = (n: number) =>
        n + (['st', 'nd', 'rd'][(n % 10) - 1] || 'th');

    return `${ordinal(day)} ${month} ${year}`;
}


export function getTimeAgo(date: Date) {
    const dateObj = new Date(date);
    return formatDistanceToNow(dateObj, {
        addSuffix: true,
        locale: enGB
    })
}
