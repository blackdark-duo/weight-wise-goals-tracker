
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format, addDays } from "date-fns";
import { cn } from "@/lib/utils";
import { CalendarIcon, Plus, Target, Trophy, Trash2, InfoIcon, BarChart3, TrendingDown, TrendingUp } from "lucide-react";
import Navbar from "@/components/Navbar";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend,
  ReferenceLine
} from "recharts";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Goal {
  id: string;
  user_id: string;
  target_weight: number;
  start_weight: number;
  target_date: string | null;
  achieved: boolean | null;
  unit: string;
  created_at: string | null;
  updated_at: string | null;
}

interface WeightEntry {
  id: string;
  user_id: string;
  weight: number;
  date: string;
  unit: string;
}

const Goals = () => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [weightEntries, setWeightEntries] = useState<WeightEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddingGoal, setIsAddingGoal] = useState(false);
  const [targetWeight, setTargetWeight] = useState<number | "">("");
  const [targetDate, setTargetDate] = useState<Date | undefined>(undefined);
  const [unit, setUnit] = useState("kg");
  const [selectedGoal, setSelectedGoal] = useState<string | null>(null);

  useEffect(() => {
    fetchGoals();
    fetchWeightEntries();
  }, []);

  const fetchGoals = async () => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;

      const { data, error } = await supabase
        .from("goals")
        .select("*")
        .eq("user_id", userData.user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setGoals(data || []);
      if (data && data.length > 0 && !selectedGoal) {
        setSelectedGoal(data[0].id);
      }
    } catch (error) {
      console.error("Error fetching goals:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchWeightEntries = async () => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;

      const { data, error } = await supabase
        .from("weight_entries")
        .select("*")
        .eq("user_id", userData.user.id)
        .order("date", { ascending: true });

      if (error) throw error;
      setWeightEntries(data || []);
    } catch (error) {
      console.error("Error fetching weight entries:", error);
    }
  };

  const handleCreateGoal = async () => {
    if (!targetWeight || !targetDate || !unit) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;

      // Get the most recent weight entry to use as the starting point
      const latestEntry = weightEntries.length > 0 
        ? weightEntries[weightEntries.length - 1]
        : null;
      
      // If no weight entries exist, use the target weight as starting weight with a small offset
      const startWeight = latestEntry ? latestEntry.weight : Number(targetWeight) + 5;

      const newGoal = {
        user_id: userData.user.id,
        target_weight: Number(targetWeight),
        start_weight: startWeight, // Add the required start_weight field
        target_date: format(targetDate, "yyyy-MM-dd"),
        achieved: false,
        unit: unit,
      };

      const { data, error } = await supabase
        .from("goals")
        .insert(newGoal)
        .select();

      if (error) throw error;
      
      toast.success("Goal created successfully!");
      setIsAddingGoal(false);
      setTargetWeight("");
      setTargetDate(undefined);
      
      if (data && data.length > 0) {
        setGoals([...goals, data[0]]);
        setSelectedGoal(data[0].id);
      }
    } catch (error) {
      console.error("Error creating goal:", error);
      toast.error("Failed to create goal");
    }
  };

  const handleDeleteGoal = async (goalId: string) => {
    try {
      const { error } = await supabase
        .from("goals")
        .delete()
        .eq("id", goalId);

      if (error) throw error;
      
      toast.success("Goal deleted successfully");
      setGoals(goals.filter(goal => goal.id !== goalId));
      
      if (selectedGoal === goalId && goals.length > 1) {
        setSelectedGoal(goals.find(g => g.id !== goalId)?.id || null);
      } else if (goals.length <= 1) {
        setSelectedGoal(null);
      }
    } catch (error) {
      console.error("Error deleting goal:", error);
      toast.error("Failed to delete goal");
    }
  };

  const handleMarkAchieved = async (goalId: string, achieved: boolean) => {
    try {
      const { error } = await supabase
        .from("goals")
        .update({ achieved, updated_at: new Date().toISOString() })
        .eq("id", goalId);

      if (error) throw error;
      
      toast.success(achieved ? "Goal marked as achieved!" : "Goal marked as in progress");
      
      // Update local state
      setGoals(goals.map(goal => 
        goal.id === goalId ? { ...goal, achieved } : goal
      ));
    } catch (error) {
      console.error("Error updating goal:", error);
      toast.error("Failed to update goal");
    }
  };

  const calculateProgress = (goal: Goal) => {
    // Get current weight from latest entry
    const relevantEntries = weightEntries.filter(entry => 
      entry.unit === goal.unit && 
      new Date(entry.date) >= new Date(goal.created_at || "")
    );
    
    const latestEntry = relevantEntries.length > 0 
      ? relevantEntries[relevantEntries.length - 1] 
      : null;
    
    if (!latestEntry) return { percentage: 0, current: 0 };
    
    // Calculate current weight and goal difference
    const currentWeight = latestEntry.weight;
    const startingWeight = goal.start_weight;
    const goalDifference = startingWeight - goal.target_weight;
    
    if (goalDifference === 0) return { percentage: 100, current: currentWeight };
    
    const currentDifference = startingWeight - currentWeight;
    const percentage = Math.min(100, Math.max(0, (currentDifference / goalDifference) * 100));
    
    return {
      percentage: Math.round(percentage),
      current: currentWeight
    };
  };

  const generatePredictionData = (goal: Goal) => {
    // Get entries relevant to this goal
    const relevantEntries = weightEntries.filter(entry => 
      entry.unit === goal.unit && 
      new Date(entry.date) >= new Date(goal.created_at || "")
    ).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    if (relevantEntries.length < 2 || !goal.target_date) {
      // Not enough data for prediction or no target date
      return [];
    }
    
    // Calculate average daily weight change
    const firstEntry = relevantEntries[0];
    const lastEntry = relevantEntries[relevantEntries.length - 1];
    const daysPassed = Math.max(1, 
      (new Date(lastEntry.date).getTime() - new Date(firstEntry.date).getTime()) / (1000 * 60 * 60 * 24)
    );
    const totalChange = firstEntry.weight - lastEntry.weight;
    const dailyChange = totalChange / daysPassed;
    
    // Generate prediction data
    const data = [];
    
    // Add historical data
    for (const entry of relevantEntries) {
      data.push({
        date: entry.date,
        actual: entry.weight,
        predicted: null,
        ideal: calculateIdealProgress(goal, new Date(entry.date))
      });
    }
    
    // Add prediction data
    const lastDate = new Date(lastEntry.date);
    const targetDate = new Date(goal.target_date);
    let currentDate = new Date(lastDate);
    currentDate.setDate(currentDate.getDate() + 1); // Start from the next day
    
    let currentWeight = lastEntry.weight;
    
    while (currentDate <= targetDate) {
      currentWeight -= dailyChange;
      data.push({
        date: format(currentDate, "yyyy-MM-dd"),
        actual: null,
        predicted: currentWeight,
        ideal: calculateIdealProgress(goal, currentDate)
      });
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return data;
  };

  // Function to calculate the ideal progress line
  const calculateIdealProgress = (goal: Goal, date: Date) => {
    if (!goal.target_date) return null;
    
    const startDate = goal.created_at ? new Date(goal.created_at) : new Date();
    const targetDate = new Date(goal.target_date);
    const totalDays = (targetDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
    
    if (totalDays <= 0) return goal.target_weight;
    
    const daysPassed = (date.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
    const ratio = Math.min(1, Math.max(0, daysPassed / totalDays));
    
    return goal.start_weight - (ratio * (goal.start_weight - goal.target_weight));
  };

  const calculateExpectedCompletion = (goal: Goal) => {
    const relevantEntries = weightEntries.filter(entry => 
      entry.unit === goal.unit && 
      new Date(entry.date) >= new Date(goal.created_at || "")
    ).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    if (relevantEntries.length < 2) {
      return "Not enough data to predict";
    }
    
    const firstEntry = relevantEntries[0];
    const lastEntry = relevantEntries[relevantEntries.length - 1];
    const daysPassed = Math.max(1, 
      (new Date(lastEntry.date).getTime() - new Date(firstEntry.date).getTime()) / (1000 * 60 * 60 * 24)
    );
    const totalChange = firstEntry.weight - lastEntry.weight;
    const dailyChange = totalChange / daysPassed;
    
    // Check if direction matches goal direction
    const isLossGoal = goal.start_weight > goal.target_weight;
    const isCurrentlyLosing = dailyChange > 0;
    
    if ((isLossGoal && !isCurrentlyLosing) || (!isLossGoal && isCurrentlyLosing)) {
      return `Not on track - current trend doesn't match goal direction`;
    }
    
    if (Math.abs(dailyChange) < 0.01) {
      return "Progress is too slow to predict";
    }
    
    const remainingChange = isLossGoal ? 
      lastEntry.weight - goal.target_weight : 
      goal.target_weight - lastEntry.weight;
    
    if (remainingChange <= 0) {
      return "Goal already achieved!";
    }
    
    const daysRemaining = Math.ceil(remainingChange / Math.abs(dailyChange));
    
    const completionDate = new Date(lastEntry.date);
    completionDate.setDate(completionDate.getDate() + daysRemaining);
    
    // Check if completion date is after target date
    if (goal.target_date) {
      const targetDate = new Date(goal.target_date);
      if (completionDate > targetDate) {
        const daysLate = Math.ceil((completionDate.getTime() - targetDate.getTime()) / (1000 * 60 * 60 * 24));
        return `Expected by ${format(completionDate, "MMMM d, yyyy")} (${daysLate} days late)`;
      } else {
        const daysEarly = Math.ceil((targetDate.getTime() - completionDate.getTime()) / (1000 * 60 * 60 * 24));
        return `Expected by ${format(completionDate, "MMMM d, yyyy")} (${daysEarly} days early)`;
      }
    }
    
    return `Expected by ${format(completionDate, "MMMM d, yyyy")}`;
  };

  const calculateDailyGoal = (goal: Goal) => {
    if (!goal.target_date) return null;
    
    const now = new Date();
    const targetDate = new Date(goal.target_date);
    const daysRemaining = Math.max(1, Math.ceil((targetDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
    
    // Get current weight
    const relevantEntries = weightEntries.filter(entry => 
      entry.unit === goal.unit
    ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    if (relevantEntries.length === 0) return null;
    
    const currentWeight = relevantEntries[0].weight;
    const remainingChange = Math.abs(currentWeight - goal.target_weight);
    
    return {
      daily: (remainingChange / daysRemaining).toFixed(2),
      weekly: ((remainingChange / daysRemaining) * 7).toFixed(2),
      daysRemaining,
      direction: currentWeight > goal.target_weight ? "lose" : "gain"
    };
  };

  const getSelectedGoal = () => {
    return goals.find(goal => goal.id === selectedGoal);
  };

  const getCurrentWeight = () => {
    if (weightEntries.length === 0) return null;
    return weightEntries[weightEntries.length - 1].weight;
  };

  return (
    <div className="min-h-screen pb-24 md:pb-6 bg-ui-background">
      <Navbar />
      <div className="container py-6">
        <div className="flex flex-wrap items-center justify-between mb-6 gap-4">
          <h1 className="text-2xl font-bold">Weight Goals</h1>
          <div className="flex gap-2">
            <Button 
              variant="outline"
              asChild
            >
              <Link to="/reports">
                <BarChart3 className="mr-2 h-4 w-4" />
                View Reports
              </Link>
            </Button>
            <Button 
              onClick={() => setIsAddingGoal(!isAddingGoal)}
              variant={isAddingGoal ? "outline" : "default"}
            >
              {isAddingGoal ? "Cancel" : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  New Goal
                </>
              )}
            </Button>
          </div>
        </div>
        
        {isAddingGoal && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-8"
          >
            <Card>
              <CardHeader>
                <CardTitle>Create New Goal</CardTitle>
                <CardDescription>Set a new weight goal to track your progress</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-2">                  
                  <div className="space-y-2">
                    <Label htmlFor="target-weight">Target Weight</Label>
                    <div className="flex">
                      <Input
                        id="target-weight"
                        type="number"
                        step="any"
                        value={targetWeight}
                        onChange={(e) => setTargetWeight(e.target.value ? Number(e.target.value) : "")}
                        placeholder="65.0"
                      />
                      <Select value={unit} onValueChange={setUnit}>
                        <SelectTrigger className="w-20 ml-2">
                          <SelectValue placeholder="Unit" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="kg">kg</SelectItem>
                          <SelectItem value="lbs">lbs</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="target-date">Target Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !targetDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {targetDate ? format(targetDate, "PPP") : "Select a date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={targetDate}
                          onSelect={setTargetDate}
                          initialFocus
                          disabled={(date) => date < addDays(new Date(), 1)}
                          defaultMonth={addDays(new Date(), 30)}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={handleCreateGoal} className="ml-auto">
                  Create Goal
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        )}
        
        {isLoading ? (
          <div className="text-center py-8">Loading goals...</div>
        ) : goals.length === 0 ? (
          <div className="text-center py-12">
            <Target className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-medium">No goals yet</h3>
            <p className="mt-2 text-muted-foreground">
              Create your first weight goal to start tracking your progress.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Target className="mr-2 h-5 w-5" />
                    Your Goals
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {goals.map(goal => {
                      const progress = calculateProgress(goal);
                      const isLossGoal = goal.start_weight > goal.target_weight;
                      const statusIcon = goal.achieved ? 
                        <Trophy className="h-5 w-5 text-amber-500" /> : 
                        isLossGoal ? 
                          <TrendingDown className="h-5 w-5 text-indigo-500" /> :
                          <TrendingUp className="h-5 w-5 text-emerald-500" />;
                      
                      return (
                        <div 
                          key={goal.id}
                          className={cn(
                            "p-4 rounded-lg border cursor-pointer transition-colors",
                            selectedGoal === goal.id ? "border-primary bg-primary/5" : "hover:bg-muted/50",
                            goal.achieved ? "border-amber-200 bg-amber-50" : ""
                          )}
                          onClick={() => setSelectedGoal(goal.id)}
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex items-start">
                              {statusIcon}
                              <div className="ml-2">
                                <h3 className="font-medium">
                                  {isLossGoal ? "Lose" : "Gain"} to {goal.target_weight} {goal.unit}
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                  {goal.target_date ? `By ${format(new Date(goal.target_date), "MMM d, yyyy")}` : "No deadline"}
                                </p>
                              </div>
                            </div>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              className="h-8 w-8"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteGoal(goal.id);
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                          
                          <div className="mt-3">
                            <div className="flex justify-between text-sm mb-1">
                              <span>Progress</span>
                              <span>{progress.percentage}%</span>
                            </div>
                            <div className="h-2 bg-muted rounded-full overflow-hidden">
                              <motion.div 
                                className={`h-full ${goal.achieved ? 'bg-amber-500' : 'bg-primary'}`}
                                initial={{ width: "0%" }}
                                animate={{ width: `${progress.percentage}%` }}
                                transition={{ duration: 1, ease: "easeOut" }}
                              />
                            </div>
                          </div>
                          
                          {!goal.achieved && progress.current > 0 && (
                            <div className="mt-3">
                              <p className="text-sm text-muted-foreground">
                                {isLossGoal ? 
                                  `${Math.abs(progress.current - goal.target_weight).toFixed(1)} ${goal.unit} to lose` :
                                  `${Math.abs(goal.target_weight - progress.current).toFixed(1)} ${goal.unit} to gain`
                                }
                              </p>
                            </div>
                          )}
                          
                          {goal.achieved && (
                            <div className="mt-3 flex items-center">
                              <Trophy className="h-4 w-4 text-amber-500 mr-1" />
                              <p className="text-sm font-medium text-amber-600">Goal achieved!</p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="lg:col-span-2">
              {selectedGoal && getSelectedGoal() && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      {getSelectedGoal()!.achieved ? 
                        <Trophy className="mr-2 h-5 w-5 text-amber-500" /> : 
                        <Target className="mr-2 h-5 w-5" />
                      }
                      Goal Details
                    </CardTitle>
                    <CardDescription>
                      {getSelectedGoal()!.achieved ? 
                        "You've achieved this goal! 🎉" : 
                        "Track your progress toward this weight goal"
                      }
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {(() => {
                      const goal = getSelectedGoal()!;
                      const progress = calculateProgress(goal);
                      const predictionData = generatePredictionData(goal);
                      const currentWeight = getCurrentWeight();
                      const dailyGoal = calculateDailyGoal(goal);
                      const isLossGoal = goal.start_weight > goal.target_weight;
                      
                      return (
                        <div className="space-y-6">
                          <div className="grid gap-4 sm:grid-cols-3">
                            <div className={`p-4 rounded-lg ${isLossGoal ? 'bg-blue-50' : 'bg-emerald-50'}`}>
                              <div className="text-sm text-muted-foreground mb-1">Start Weight</div>
                              <div className="text-2xl font-semibold">
                                {goal.start_weight} {goal.unit}
                              </div>
                            </div>
                            
                            <div className="bg-indigo-50 p-4 rounded-lg">
                              <div className="text-sm text-muted-foreground mb-1">Current Weight</div>
                              <div className="text-2xl font-semibold">
                                {progress.current ? `${progress.current} ${goal.unit}` : "No data"}
                              </div>
                            </div>
                            
                            <div className="bg-purple-50 p-4 rounded-lg">
                              <div className="text-sm text-muted-foreground mb-1">Target Weight</div>
                              <div className="text-2xl font-semibold">{goal.target_weight} {goal.unit}</div>
                            </div>
                          </div>
                          
                          {!goal.achieved && dailyGoal && (
                            <div className="bg-muted rounded-lg p-4">
                              <h3 className="text-lg font-medium mb-3 flex items-center">
                                <InfoIcon className="h-5 w-5 mr-2 text-muted-foreground" />
                                Recommended Rate
                              </h3>
                              <div className="grid gap-4 sm:grid-cols-2">
                                <div>
                                  <p className="text-sm text-muted-foreground">To reach your goal by the target date:</p>
                                  <ul className="mt-2 space-y-1">
                                    <li className="text-sm font-medium">
                                      {dailyGoal.direction === "lose" ? "Lose" : "Gain"} {dailyGoal.daily} {goal.unit} per day
                                    </li>
                                    <li className="text-sm font-medium">
                                      {dailyGoal.direction === "lose" ? "Lose" : "Gain"} {dailyGoal.weekly} {goal.unit} per week
                                    </li>
                                  </ul>
                                </div>
                                <div>
                                  <p className="text-sm text-muted-foreground">Time remaining:</p>
                                  <p className="mt-2 text-sm font-medium">
                                    {dailyGoal.daysRemaining} days 
                                    {goal.target_date && ` (until ${format(new Date(goal.target_date), "MMM d, yyyy")})`}
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}
                          
                          <div>
                            <h3 className="text-lg font-medium mb-3">Progress Tracker</h3>
                            <div className="h-12 bg-muted rounded-full overflow-hidden relative">
                              <motion.div 
                                className={`h-full ${goal.achieved ? 'bg-amber-500' : 'bg-gradient-to-r from-blue-500 to-purple-500'}`}
                                initial={{ width: "0%" }}
                                animate={{ width: `${progress.percentage}%` }}
                                transition={{ duration: 1.5, ease: "easeOut" }}
                              />
                              <div className="absolute top-0 left-0 right-0 bottom-0 flex items-center justify-between px-4">
                                <span className="text-sm font-medium text-white z-10 drop-shadow-md">
                                  {goal.start_weight} {goal.unit}
                                </span>
                                <span className="text-sm font-medium z-10 drop-shadow-md">
                                  {goal.target_weight} {goal.unit}
                                </span>
                              </div>
                              
                              {/* Current position indicator */}
                              {progress.current > 0 && (
                                <div 
                                  className="absolute top-0 h-12 w-1 bg-white"
                                  style={{ 
                                    left: `${progress.percentage}%`, 
                                    transform: 'translateX(-50%)'
                                  }}
                                />
                              )}
                            </div>
                            <div className="flex justify-between mt-2">
                              <span className="text-sm">
                                {progress.current && `Current: ${progress.current} ${goal.unit}`}
                              </span>
                              <span className="text-sm font-medium">{progress.percentage}% Complete</span>
                            </div>
                          </div>
                          
                          {!goal.achieved && goal.target_date && (
                            <div className="bg-white rounded-lg border p-4">
                              <h3 className="text-lg font-medium mb-2">Completion Forecast</h3>
                              <div className="flex items-center space-x-2">
                                <CalendarIcon className="h-5 w-5 text-muted-foreground" />
                                <span>
                                  {new Date() > new Date(goal.target_date) 
                                    ? "Goal deadline has passed" 
                                    : `${Math.ceil((new Date(goal.target_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days remaining`}
                                </span>
                              </div>
                              <div className="flex items-center space-x-2 mt-2">
                                <Trophy className="h-5 w-5 text-amber-500" />
                                <span>{calculateExpectedCompletion(goal)}</span>
                              </div>
                              
                              {!goal.achieved && (
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => handleMarkAchieved(goal.id, true)} 
                                  className="mt-4"
                                >
                                  <Trophy className="mr-2 h-4 w-4" />
                                  Mark as Achieved
                                </Button>
                              )}
                              
                              {goal.achieved && (
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => handleMarkAchieved(goal.id, false)} 
                                  className="mt-4"
                                >
                                  <Target className="mr-2 h-4 w-4" />
                                  Mark as In Progress
                                </Button>
                              )}
                            </div>
                          )}
                          
                          {predictionData.length > 0 && (
                            <div>
                              <h3 className="text-lg font-medium mb-3">Progress & Projection</h3>
                              <div className="h-72 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                  <LineChart
                                    data={predictionData}
                                    margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
                                  >
                                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                                    <XAxis 
                                      dataKey="date" 
                                      tickFormatter={(date) => format(new Date(date), "MMM d")} 
                                      interval="preserveStartEnd"
                                    />
                                    <YAxis domain={['auto', 'auto']} />
                                    <Tooltip
                                      formatter={(value, name) => [
                                        Number(value).toFixed(1) + ` ${goal.unit}`, 
                                        name === "actual" ? "Actual" : 
                                        name === "predicted" ? "Predicted" : "Ideal Path"
                                      ]}
                                      labelFormatter={(date) => format(new Date(date), "MMMM d, yyyy")}
                                    />
                                    <Legend 
                                      formatter={(value) => 
                                        value === "actual" ? "Actual" : 
                                        value === "predicted" ? "Predicted" : "Ideal Path"
                                      } 
                                    />
                                    
                                    {/* Target weight reference line */}
                                    <ReferenceLine 
                                      y={goal.target_weight} 
                                      label={{
                                        value: `Target: ${goal.target_weight} ${goal.unit}`,
                                        position: 'right'
                                      }}
                                      stroke="#9333ea" 
                                      strokeDasharray="3 3" 
                                    />
                                    
                                    {/* Add ideal progress line */}
                                    <Line 
                                      type="monotone" 
                                      dataKey="ideal" 
                                      stroke="#9333ea" 
                                      strokeDasharray="5 5"
                                      strokeWidth={1.5}
                                      dot={false}
                                      isAnimationActive={true}
                                    />
                                    
                                    {/* Actual data */}
                                    <Line 
                                      type="monotone" 
                                      dataKey="actual" 
                                      stroke="#3b82f6"
                                      strokeWidth={2}
                                      dot={{ r: 4 }}
                                      isAnimationActive={true}
                                    />
                                    
                                    {/* Predicted data */}
                                    <Line 
                                      type="monotone" 
                                      dataKey="predicted" 
                                      stroke="#8b5cf6" 
                                      strokeDasharray="5 5"
                                      strokeWidth={2}
                                      dot={{ r: 3 }}
                                      isAnimationActive={true}
                                    />
                                  </LineChart>
                                </ResponsiveContainer>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Goals;
