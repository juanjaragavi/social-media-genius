import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return secs > 0 ? `${minutes}m ${secs}s` : `${minutes}m`;
}

export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
}

export function getPlatformColor(platform: string): string {
  const colors: Record<string, string> = {
    instagram: 'bg-linear-to-r from-purple-600 to-pink-600',
    twitter: 'bg-sky-500',
    facebook: 'bg-blue-600',
    tiktok: 'bg-black',
    linkedin: 'bg-blue-700',
  };
  return colors[platform.toLowerCase()] || 'bg-gray-600';
}

export function getPlatformIcon(platform: string): string {
  const icons: Record<string, string> = {
    instagram: '📷',
    twitter: '🐦',
    facebook: '👥',
    tiktok: '🎵',
    linkedin: '💼',
  };
  return icons[platform.toLowerCase()] || '📱';
}
