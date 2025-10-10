/**
 * Timezone utilities to ensure all dates use Hungarian time (Europe/Budapest)
 */

const HUNGARIAN_TIMEZONE = 'Europe/Budapest';

/**
 * Get current date/time in Hungarian timezone
 */
export function getHungarianNow(): Date {
  const now = new Date();
  const hungarianTimeString = now.toLocaleString('en-US', { 
    timeZone: HUNGARIAN_TIMEZONE 
  });
  return new Date(hungarianTimeString);
}

/**
 * Get today's date at midnight in Hungarian timezone
 */
export function getHungarianToday(): Date {
  const today = getHungarianNow();
  today.setHours(0, 0, 0, 0);
  return today;
}

/**
 * Get current hour in Hungarian timezone
 */
export function getHungarianHour(): number {
  return getHungarianNow().getHours();
}

/**
 * Convert a date string to Hungarian timezone Date object
 */
export function parseInHungarianTimezone(dateStr: string): Date {
  const date = new Date(dateStr);
  const hungarianTimeString = date.toLocaleString('en-US', { 
    timeZone: HUNGARIAN_TIMEZONE 
  });
  return new Date(hungarianTimeString);
}

/**
 * Check if a date is in the past (Hungarian time)
 */
export function isDateInPast(dateStr: string): boolean {
  const selectedDate = new Date(dateStr);
  const today = getHungarianToday();
  return selectedDate < today;
}

/**
 * Check if a specific time slot is in the past (Hungarian time)
 */
export function isTimeSlotInPast(dateStr: string, hour: number): boolean {
  const selectedDate = new Date(dateStr);
  const today = getHungarianToday();
  const currentHour = getHungarianHour();
  
  // If the date is today, check if the hour has passed
  if (selectedDate.toDateString() === today.toDateString()) {
    return hour <= currentHour;
  }
  
  return false;
}

/**
 * Format date for Hungarian locale
 */
export function formatHungarianDate(date: Date): string {
  return date.toLocaleDateString('hu-HU', {
    timeZone: HUNGARIAN_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
}

/**
 * Format datetime for Hungarian locale
 */
export function formatHungarianDateTime(date: Date): string {
  return date.toLocaleString('hu-HU', {
    timeZone: HUNGARIAN_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
}

