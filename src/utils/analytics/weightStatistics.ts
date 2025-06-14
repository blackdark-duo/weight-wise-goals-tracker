/**
 * Weight Statistics Calculator
 * Pure utility functions for calculating weight-related statistics
 * Single responsibility: Weight data analysis and statistics calculation
 */

export interface WeightDataPoint {
  weight: number;
  date: string;
  fullDate?: string;
}

export interface WeightStats {
  firstWeight: number;
  lastWeight: number;
  change: number;
  percentChange: number;
  avgWeeklyChange: number;
  isIncreasing: boolean;
  minWeight: number;
  maxWeight: number;
  dataPointsCount: number;
  weightRange: number;
}

/**
 * Calculates comprehensive weight statistics from data points
 */
export const calculateWeightStats = (dataPoints: WeightDataPoint[]): WeightStats | null => {
  if (dataPoints.length === 0) {
    return null;
  }

  const weights = dataPoints.map(point => point.weight);
  const minWeight = Math.min(...weights);
  const maxWeight = Math.max(...weights);
  const weightRange = maxWeight - minWeight;

  if (dataPoints.length === 1) {
    return {
      firstWeight: dataPoints[0].weight,
      lastWeight: dataPoints[0].weight,
      change: 0,
      percentChange: 0,
      avgWeeklyChange: 0,
      isIncreasing: false,
      minWeight,
      maxWeight,
      dataPointsCount: 1,
      weightRange
    };
  }

  const firstWeight = dataPoints[0].weight;
  const lastWeight = dataPoints[dataPoints.length - 1].weight;
  const change = lastWeight - firstWeight;
  const percentChange = firstWeight !== 0 ? (change / firstWeight) * 100 : 0;

  // Calculate average weekly change
  const firstDate = new Date(dataPoints[0].fullDate || dataPoints[0].date);
  const lastDate = new Date(dataPoints[dataPoints.length - 1].fullDate || dataPoints[dataPoints.length - 1].date);
  const daysDiff = Math.max(1, (lastDate.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24));
  const avgWeeklyChange = (change / daysDiff) * 7;

  return {
    firstWeight,
    lastWeight,
    change,
    percentChange,
    avgWeeklyChange,
    isIncreasing: change > 0,
    minWeight,
    maxWeight,
    dataPointsCount: dataPoints.length,
    weightRange
  };
};

/**
 * Calculates weight trend over time
 */
export const calculateWeightTrend = (dataPoints: WeightDataPoint[]): 'increasing' | 'decreasing' | 'stable' | 'insufficient_data' => {
  if (dataPoints.length < 3) {
    return 'insufficient_data';
  }

  const recentPoints = dataPoints.slice(-5); // Last 5 data points
  let increases = 0;
  let decreases = 0;

  for (let i = 1; i < recentPoints.length; i++) {
    const diff = recentPoints[i].weight - recentPoints[i - 1].weight;
    if (diff > 0.1) increases++; // Threshold to avoid noise
    else if (diff < -0.1) decreases++;
  }

  if (increases > decreases) return 'increasing';
  if (decreases > increases) return 'decreasing';
  return 'stable';
};

/**
 * Groups weight data by date (takes the latest entry per day)
 */
export const groupWeightDataByDate = (entries: WeightDataPoint[]): WeightDataPoint[] => {
  const groupedByDate = entries.reduce((acc, entry) => {
    const dateKey = entry.fullDate || entry.date;
    if (!acc[dateKey] || new Date(entry.date) > new Date(acc[dateKey].date)) {
      acc[dateKey] = entry;
    }
    return acc;
  }, {} as Record<string, WeightDataPoint>);

  return Object.values(groupedByDate).sort((a, b) => 
    new Date(a.fullDate || a.date).getTime() - new Date(b.fullDate || b.date).getTime()
  );
};

/**
 * Calculates moving average for weight data
 */
export const calculateMovingAverage = (
  dataPoints: WeightDataPoint[], 
  windowSize: number = 3
): WeightDataPoint[] => {
  if (dataPoints.length < windowSize) {
    return dataPoints;
  }

  return dataPoints.map((point, index) => {
    if (index < windowSize - 1) {
      return point;
    }

    const windowData = dataPoints.slice(index - windowSize + 1, index + 1);
    const averageWeight = windowData.reduce((sum, p) => sum + p.weight, 0) / windowSize;

    return {
      ...point,
      weight: Math.round(averageWeight * 10) / 10 // Round to 1 decimal place
    };
  });
};