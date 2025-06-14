/**
 * Chart Data Formatter
 * Transforms raw weight data into chart-ready format
 * Single responsibility: Data transformation for visualization
 */

import { format } from "date-fns";

export interface RawWeightEntry {
  id: string;
  weight: number;
  unit: string;
  date: string;
  time: string;
  description?: string;
}

export interface ChartDataPoint {
  date: string;
  weight: number;
  unit: string;
  fullDate: string;
  formattedDate?: string;
  tooltip?: string;
}

/**
 * Formats weight entries for chart display
 */
export const formatWeightEntriesForChart = (
  entries: RawWeightEntry[],
  dateFormat: string = "MMM dd"
): ChartDataPoint[] => {
  return entries.map(entry => ({
    date: format(new Date(entry.date), dateFormat),
    weight: entry.weight,
    unit: entry.unit,
    fullDate: entry.date,
    formattedDate: format(new Date(entry.date), "yyyy-MM-dd"),
    tooltip: `${entry.weight} ${entry.unit} on ${format(new Date(entry.date), "MMM dd, yyyy")}`
  }));
};

/**
 * Groups entries by date and takes the latest entry for each day
 */
export const groupEntriesByDate = (entries: RawWeightEntry[]): RawWeightEntry[] => {
  const groupedByDate = entries.reduce((acc, entry) => {
    const dateKey = entry.date;
    if (!acc[dateKey]) {
      acc[dateKey] = entry;
    } else {
      // Keep the latest entry for the day (by time)
      if (entry.time > acc[dateKey].time) {
        acc[dateKey] = entry;
      }
    }
    return acc;
  }, {} as Record<string, RawWeightEntry>);

  return Object.values(groupedByDate).sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );
};

/**
 * Formats data for different chart types
 */
export const formatForChartType = (
  data: ChartDataPoint[],
  chartType: 'line' | 'bar' | 'area' = 'line'
): ChartDataPoint[] => {
  switch (chartType) {
    case 'bar':
      return data.map(point => ({
        ...point,
        weight: Math.round(point.weight * 10) / 10 // Round for cleaner bars
      }));
    case 'area':
      return data; // Keep original data for area charts
    case 'line':
    default:
      return data;
  }
};

/**
 * Calculates chart domain (min/max values with padding)
 */
export const calculateChartDomain = (
  data: ChartDataPoint[],
  paddingPercent: number = 0.1
): { min: number; max: number } => {
  if (data.length === 0) {
    return { min: 0, max: 100 };
  }

  const weights = data.map(point => point.weight);
  const min = Math.min(...weights);
  const max = Math.max(...weights);
  const range = max - min;
  const padding = range * paddingPercent;

  return {
    min: Math.max(0, min - padding),
    max: max + padding
  };
};
