import { format, parse, addMonths, subMonths, startOfMonth, endOfMonth } from 'date-fns';

/**
 * Formats a date to YYYY-MM format
 * @param date - Date to format
 * @returns Month string in YYYY-MM format
 */
export function formatToMonthString(date: Date): string {
  return format(date, 'yyyy-MM');
}

/**
 * Parses a month string to Date
 * @param monthStr - Month string in YYYY-MM format
 * @returns Date object for the first day of the month
 */
export function parseMonthString(monthStr: string): Date {
  return parse(monthStr, 'yyyy-MM', new Date());
}

/**
 * Gets the current month string
 * @returns Current month in YYYY-MM format
 */
export function getCurrentMonthString(): string {
  return formatToMonthString(new Date());
}

/**
 * Gets the previous month string
 * @param monthStr - Month string in YYYY-MM format
 * @returns Previous month in YYYY-MM format
 */
export function getPreviousMonthString(monthStr: string): string {
  const date = parseMonthString(monthStr);
  const prevMonth = subMonths(date, 1);
  return formatToMonthString(prevMonth);
}

/**
 * Gets the next month string
 * @param monthStr - Month string in YYYY-MM format
 * @returns Next month in YYYY-MM format
 */
export function getNextMonthString(monthStr: string): string {
  const date = parseMonthString(monthStr);
  const nextMonth = addMonths(date, 1);
  return formatToMonthString(nextMonth);
}

/**
 * Formats a month string to display format
 * @param monthStr - Month string in YYYY-MM format
 * @returns Formatted month display (e.g., "January 2024")
 */
export function formatMonthDisplay(monthStr: string): string {
  const date = parseMonthString(monthStr);
  return format(date, 'MMMM yyyy');
}

/**
 * Formats a month string to short display format
 * @param monthStr - Month string in YYYY-MM format
 * @returns Formatted month display (e.g., "Jan 2024")
 */
export function formatMonthDisplayShort(monthStr: string): string {
  const date = parseMonthString(monthStr);
  return format(date, 'MMM yyyy');
}

/**
 * Gets month name from month string
 * @param monthStr - Month string in YYYY-MM format
 * @returns Month name (e.g., "January")
 */
export function getMonthName(monthStr: string): string {
  const date = parseMonthString(monthStr);
  return format(date, 'MMMM');
}

/**
 * Gets short month name from month string
 * @param monthStr - Month string in YYYY-MM format
 * @returns Short month name (e.g., "Jan")
 */
export function getMonthNameShort(monthStr: string): string {
  const date = parseMonthString(monthStr);
  return format(date, 'MMM');
}

/**
 * Gets year from month string
 * @param monthStr - Month string in YYYY-MM format
 * @returns Year as number
 */
export function getYearFromMonthString(monthStr: string): number {
  const date = parseMonthString(monthStr);
  return date.getFullYear();
}

/**
 * Gets month number from month string (1-12)
 * @param monthStr - Month string in YYYY-MM format
 * @returns Month number (1 = January, 12 = December)
 */
export function getMonthNumber(monthStr: string): number {
  const date = parseMonthString(monthStr);
  return date.getMonth() + 1;
}

/**
 * Checks if a month string is before another
 * @param monthStr1 - First month string
 * @param monthStr2 - Second month string
 * @returns True if monthStr1 is before monthStr2
 */
export function isMonthBefore(monthStr1: string, monthStr2: string): boolean {
  const date1 = parseMonthString(monthStr1);
  const date2 = parseMonthString(monthStr2);
  return date1 < date2;
}

/**
 * Checks if a month string is after another
 * @param monthStr1 - First month string
 * @param monthStr2 - Second month string
 * @returns True if monthStr1 is after monthStr2
 */
export function isMonthAfter(monthStr1: string, monthStr2: string): boolean {
  const date1 = parseMonthString(monthStr1);
  const date2 = parseMonthString(monthStr2);
  return date1 > date2;
}

/**
 * Gets the start date of a month
 * @param monthStr - Month string in YYYY-MM format
 * @returns Date object for the start of the month
 */
export function getMonthStart(monthStr: string): Date {
  const date = parseMonthString(monthStr);
  return startOfMonth(date);
}

/**
 * Gets the end date of a month
 * @param monthStr - Month string in YYYY-MM format
 * @returns Date object for the end of the month
 */
export function getMonthEnd(monthStr: string): Date {
  const date = parseMonthString(monthStr);
  return endOfMonth(date);
}

/**
 * Generates an array of month strings for a given year
 * @param year - Year to generate months for
 * @returns Array of 12 month strings (YYYY-MM format)
 */
export function getMonthsForYear(year: number): string[] {
  return Array.from({ length: 12 }, (_, i) => {
    const month = (i + 1).toString().padStart(2, '0');
    return `${year}-${month}`;
  });
}

/**
 * Formats a Date to display string
 * @param date - Date to format
 * @returns Formatted date string (e.g., "Jan 15, 2024")
 */
export function formatDateDisplay(date: Date): string {
  return format(date, 'MMM d, yyyy');
}

/**
 * Formats a Date to short display string
 * @param date - Date to format
 * @returns Formatted date string (e.g., "15/01/2024")
 */
export function formatDateDisplayShort(date: Date): string {
  return format(date, 'dd/MM/yyyy');
}

