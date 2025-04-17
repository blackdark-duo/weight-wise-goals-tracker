
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingDown, TrendingUp } from "lucide-react";

interface WeightJourneyInsightsProps {
  stats: {
    firstWeight: number;
    lastWeight: number;
    change: number;
    percentChange: number;
    avgWeeklyChange: number;
    isIncreasing: boolean;
  };
  unit: string;
  dataLength: number;
  minWeight?: number;
  maxWeight?: number;
}

const WeightJourneyInsights: React.FC<WeightJourneyInsightsProps> = ({ 
  stats, 
  unit, 
  dataLength,
  minWeight,
  maxWeight
}) => {
  return (
    <Card className="overflow-hidden bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 shadow-sm border border-blue-100">
      <CardHeader>
        <CardTitle className="text-xl text-blue-900 flex items-center gap-2">
          {stats.isIncreasing ? (
            <TrendingUp className="h-5 w-5 text-red-500" />
          ) : (
            <TrendingDown className="h-5 w-5 text-green-500" />
          )}
          Weight Journey Insights
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-muted-foreground">
            {dataLength < 2 ? (
              "Add more weight entries to see insights about your progress."
            ) : stats.isIncreasing ? (
              <>
                Over this period, your weight has <span className="text-red-500 font-medium">increased</span> by {Math.abs(stats.change).toFixed(1)} {unit} ({Math.abs(stats.percentChange).toFixed(1)}%). 
                You're averaging a gain of {Math.abs(stats.avgWeeklyChange).toFixed(1)} {unit} per week.
              </>
            ) : (
              <>
                Over this period, your weight has <span className="text-green-500 font-medium">decreased</span> by {Math.abs(stats.change).toFixed(1)} {unit} ({Math.abs(stats.percentChange).toFixed(1)}%). 
                You're averaging a loss of {Math.abs(stats.avgWeeklyChange).toFixed(1)} {unit} per week.
              </>
            )}
          </p>
          
          {dataLength >= 3 && (
            <div className="p-4 bg-white/70 rounded-md shadow-sm border border-blue-100">
              <h4 className="font-semibold mb-2 text-blue-800">Trend Analysis</h4>
              <ul className="space-y-2 list-disc list-inside text-sm text-muted-foreground">
                {stats.avgWeeklyChange !== 0 && (
                  <li>
                    At your current rate, you'll {stats.isIncreasing ? 'gain' : 'lose'} approximately {
                      (Math.abs(stats.avgWeeklyChange) * 4).toFixed(1)
                    } {unit} over the next month.
                  </li>
                )}
                {minWeight && (
                  <li>
                    Your minimum recorded weight during this period was {minWeight.toFixed(1)} {unit}.
                  </li>
                )}
                {maxWeight && (
                  <li>
                    Your maximum recorded weight during this period was {maxWeight.toFixed(1)} {unit}.
                  </li>
                )}
              </ul>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default WeightJourneyInsights;
