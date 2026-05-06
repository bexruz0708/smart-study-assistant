import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Tailwind classlarni birlashtirish (shadcn/ui uchun)
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * Sanani chiroyli formatda
 */
export function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('uz-UZ', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Fayl hajmini chiroyli ko'rinishda
 */
export function formatFileSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}

/**
 * Matnni qisqartirish
 */
export function truncate(text, length = 100) {
  if (!text) return '';
  return text.length > length ? text.substring(0, length) + '...' : text;
}

/**
 * Kechiktirib ishlatish (debounce)
 */
export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}