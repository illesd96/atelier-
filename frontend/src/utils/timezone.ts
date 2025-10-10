/**
 * Timezone utilities to ensure all dates use Hungarian time (Europe/Budapest)
 */

const HUNGARIAN_TIMEZONE = 'Europe/Budapest';

/**
 * Get current date/time in Hungarian timezone
 */
export function getHungarianNow(): Date {
  // Create a date in Hungarian timezone
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: HUNGARIAN_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });
  
  const parts = formatter.formatToParts(new Date());
  const dateParts: { [key: string]: string } = {};
  
  parts.forEach(({ type, value }) => {
    dateParts[type] = value;
  });
  
  // Create date string in format: YYYY-MM-DD HH:mm:ss
  const dateString = `${dateParts.year}-${dateParts.month}-${dateParts.day}T${dateParts.hour}:${dateParts.minute}:${dateParts.second}`;
  return new Date(dateString);
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
 * Check if a date is today in Hungarian timezone
 */
export function isHungarianToday(date: Date): boolean {
  const today = getHungarianToday();
  const checkDate = new Date(date);
  checkDate.setHours(0, 0, 0, 0);
  return checkDate.getTime() === today.getTime();
}

/**
 * Check if a date is in the past (Hungarian time)
 */
export function isDateInPast(date: Date): boolean {
  const today = getHungarianToday();
  const checkDate = new Date(date);
  checkDate.setHours(0, 0, 0, 0);
  return checkDate < today;
}

/**
 * Format date for Hungarian locale
 */
export function formatHungarianDate(date: Date): string {
  return new Intl.DateTimeFormat('hu-HU', {
    timeZone: HUNGARIAN_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(date);
}

/**
 * Format datetime for Hungarian locale
 */
export function formatHungarianDateTime(date: Date): string {
  return new Intl.DateTimeFormat('hu-HU', {
    timeZone: HUNGARIAN_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
}

/**
 * Get the minimum selectable date (today in Hungarian time)
 */
export function getMinSelectableDate(): Date {
  return getHungarianToday();
}

/**
 * Get the maximum selectable date (90 days from today in Hungarian time)
 */
export function getMaxSelectableDate(): Date {
  const maxDate = getHungarianToday();
  maxDate.setDate(maxDate.getDate() + 90);
  return maxDate;
}

