
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileBarChart, LineChart } from "lucide-react";
import { Link } from "react-router-dom";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

interface WeightChartProps {
  chartData: Array<{
    date: string;
    weight: number;
    unit: string;
  }>;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background border border-border p-2 rounded-md shadow-md">
        <p className="font-medium">{label}</p>
        <p className="text-brand-primary">{`${payload[0].value} ${payload[0].payload.unit}`}</p>
      </div>
    );
  }
  return null;
};

const WeightChart: React.FC<WeightChartProps> = ({ chartData }) => {
  return (
    <Card className="overflow-hidden">
      <div className="h-1 bg-gradient-to-r from-indigo-400 to-purple-600"></div>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Last 7 Days</CardTitle>
          <CardDescription>Your recent weight trend</CardDescription>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link to="/reports">
            <FileBarChart className="mr-2 h-4 w-4" />
            View Reports
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        {chartData.length > 1 ? (
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#9b87f5" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#D6BCFA" stopOpacity={0.2}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="date" />
                <YAxis 
                  domain={[
                    (dataMin: number) => Math.floor(dataMin * 0.99), 
                    (dataMax: number) => Math.ceil(dataMax * 1.01)
                  ]} 
                />
                <Tooltip content={<CustomTooltip />} />
                <Area 
                  type="monotone" 
                  dataKey="weight" 
                  stroke="#9b87f5" 
                  fillOpacity={1}
                  fill="url(#colorWeight)" 
                  strokeWidth={2}
                  activeDot={{ r: 8 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-[300px] text-center">
            <LineChart className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Not enough data</h3>
            <p className="text-muted-foreground max-w-md">
              Add at least two weight entries to see your trend chart.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default WeightChart;

