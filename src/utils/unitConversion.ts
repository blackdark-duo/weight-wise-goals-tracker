
/**
 * Converts weight values between kilograms (kg) and pounds (lbs)
 * @param value Weight value to convert
 * @param fromUnit Original unit ('kg' or 'lbs')
 * @param toUnit Target unit ('kg' or 'lbs')
 * @returns Converted weight value
 */
export function convertWeight(value: number, fromUnit: string, toUnit: string): number {
  if (fromUnit === toUnit) {
    return value;
  }
  
  if (fromUnit === 'kg' && toUnit === 'lbs') {
    // Convert kg to lbs
    return parseFloat((value * 2.20462).toFixed(2));
  } else if (fromUnit === 'lbs' && toUnit === 'kg') {
    // Convert lbs to kg
    return parseFloat((value / 2.20462).toFixed(2));
  }
  
  return value;
}

/**
 * Converts a date/time from one timezone to another
 * @param dateTimeString ISO date string or Date object
 * @param fromTimezone Source timezone
 * @param toTimezone Target timezone
 * @returns Date string in the target timezone
 */
export function convertTimezone(
  dateTimeString: string | Date,
  fromTimezone: string = 'UTC',
  toTimezone: string = 'UTC'
): string {
  // Initialize the date object
  const date = typeof dateTimeString === 'string' ? new Date(dateTimeString) : dateTimeString;
  
  // If from and to timezones are the same, just return the formatted date
  if (fromTimezone === toTimezone) {
    return date.toLocaleString('en-US', { timeZone: 'UTC' });
  }
  
  try {
    // Format the date in the target timezone
    return date.toLocaleString('en-US', { timeZone: toTimezone });
  } catch (error) {
    console.error('Error converting timezone:', error);
    // Fallback to UTC
    return date.toLocaleString('en-US', { timeZone: 'UTC' });
  }
}

/**
 * Parses a timezone string like "UTC+5:30" and returns the offset in minutes
 */
export function parseTimezoneOffset(timezone: string): number {
  if (!timezone || timezone === 'UTC') return 0;
  
  // Parse timezone offset format like "UTC+5:30" or "UTC-7:00"
  const match = timezone.match(/^UTC([+-])(\d+):(\d+)$/);
  
  if (match) {
    const sign = match[1] === '+' ? 1 : -1;
    const hours = parseInt(match[2], 10);
    const minutes = parseInt(match[3], 10);
    return sign * (hours * 60 + minutes);
  }
  
  return 0;
}

/**
 * Applies a timezone offset to a date
 */
export function applyTimezoneOffset(date: Date, offsetMinutes: number): Date {
  const newDate = new Date(date);
  newDate.setMinutes(newDate.getMinutes() + offsetMinutes);
  return newDate;
}
