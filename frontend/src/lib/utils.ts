import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Converte o texto para maiúsculas (UPPERCASE)
 */
export function toUpperCase(value: string | undefined | null): string {
  if (!value) return '';
  return value.toUpperCase();
}
