import { ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Function to merge Tailwind CSS classes and handle conditionals
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
