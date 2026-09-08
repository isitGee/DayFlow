import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function uid(prefix = 'id'): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36).slice(-4)}`;
}

export function formatMinutes(mins: number): string {
  const sign = mins < 0 ? '-' : '';
  const abs = Math.abs(Math.round(mins));
  const h = Math.floor(abs / 60);
  const m = abs % 60;
  if (h === 0) return `${sign}${m}m`;
  if (m === 0) return `${sign}${h}h`;
  return `${sign}${h}h ${m}m`;
}

export function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

export function greeting(date: Date = new Date()): string {
  const h = date.getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

export const PRIORITY_LABEL: Record<string, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
};

export const PRIORITY_DOT: Record<string, string> = {
  low: 'bg-ink-faint',
  medium: 'bg-accent-400',
  high: 'bg-overloaded',
};
