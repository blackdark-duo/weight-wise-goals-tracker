
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { TrendingDown, Target, Award, ArrowRight } from "lucide-react";
import { useUserPreferences } from "@/hooks/use-user-preferences";

interface GoalProgressCardProps {
  currentWeight: number;
  startWeight: number;
  goalWeight: number;
  unit: string;
}

const GoalProgressCard = ({ currentWeight, startWeight, goalWeight, unit }: GoalProgressCardProps) => {
  const { preferredUnit } = useUserPreferences();
  
  // Calculate progress percentage
  const totalWeightToLose = startWeight - goalWeight;
  const weightLostSoFar = startWeight - currentWeight;
  const progressPercentage = totalWeightToLose > 0 
    ? Math.min(100, Math.max(0, (weightLostSoFar / totalWeightToLose) * 100))
    : 0;
  
  // Calculate remaining weight to lose
  const remainingWeight = Math.max(0, currentWeight - goalWeight);
  
  // Determine progress status
  let statusMessage = "";
  let statusIcon = null;
  let statusColor = "";
  
  if (progressPercentage >= 100) {
    statusMessage = "Goal achieved! 🎉";
    statusIcon = <Award className="h-5 w-5 text-yellow-500" />;
    statusColor = "text-yellow-500";
  } else if (progressPercentage >= 75) {
    statusMessage = "Almost there!";
    statusIcon = <Target className="h-5 w-5 text-emerald-500" />;
    statusColor = "text-emerald-500";
  } else if (progressPercentage >= 50) {
    statusMessage = "Halfway there!";
    statusIcon = <TrendingDown className="h-5 w-5 text-blue-500" />;
    statusColor = "text-blue-500";
  } else if (progressPercentage >= 25) {
    statusMessage = "Good progress!";
    statusIcon = <TrendingDown className="h-5 w-5 text-indigo-500" />;
    statusColor = "text-indigo-500";
  } else if (progressPercentage > 0) {
    statusMessage = "Getting started!";
    statusIcon = <TrendingDown className="h-5 w-5 text-violet-500" />;
    statusColor = "text-violet-500";
  } else {
    statusMessage = "Start your journey!";
    statusIcon = <ArrowRight className="h-5 w-5 text-brand-primary" />;
    statusColor = "text-brand-primary";
  }
  
  return (
    <Card className="overflow-hidden">
      <div className="h-1 bg-gradient-to-r from-brand-primary to-brand-secondary"></div>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-medium">Goal Progress</CardTitle>
          {statusIcon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between items-center text-sm">
            <div className="flex flex-col">
              <span className="text-muted-foreground">Current</span>
              <span className="font-bold">{currentWeight} {unit}</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-muted-foreground">Progress</span>
              <span className={`font-bold ${statusColor}`}>{progressPercentage.toFixed(0)}%</span>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-muted-foreground">Goal</span>
              <span className="font-bold">{goalWeight} {unit}</span>
            </div>
          </div>
          
          <Progress value={progressPercentage} className="h-2" />
          
          <div className="pt-2 flex justify-between items-center">
            <div className="flex items-center gap-1">
              {statusIcon}
              <span className={`text-sm font-medium ${statusColor}`}>{statusMessage}</span>
            </div>
            
            {remainingWeight > 0 && (
              <div className="text-sm text-muted-foreground">
                {remainingWeight.toFixed(1)} {unit} to go
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default GoalProgressCard;
