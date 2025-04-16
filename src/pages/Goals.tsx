
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { CalendarIcon, Plus, Target, Trophy, Trash2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Goal {
  id: string;
  user_id: string;
  start_weight: number;
  target_weight: number;
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
  const [startWeight, setStartWeight] = useState<number | "">("");
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
    if (!startWeight || !targetWeight || !targetDate || !unit) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;

      const newGoal = {
        user_id: userData.user.id,
        start_weight: Number(startWeight),
        target_weight: Number(targetWeight),
        target_date: format(targetDate, "yyyy-MM-dd"),
        achieved: false,
        unit: unit,
      };

      const { data, error } = await supabase
        .from("goals")
        .insert([newGoal])
        .select();

      if (error) throw error;
      
      toast.success("Goal created successfully!");
      setIsAddingGoal(false);
      setStartWeight("");
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

  const calculateProgress = (goal: Goal) => {
    const totalLoss = goal.start_weight - goal.target_weight;
    const relevantEntries = weightEntries.filter(entry => 
      entry.unit === goal.unit && 
      new Date(entry.date) >= new Date(goal.created_at || "") &&
      (goal.target_date ? new Date(entry.date) <= new Date(goal.target_date) : true)
    );
    
    const latestEntry = relevantEntries.length > 0 
      ? relevantEntries[relevantEntries.length - 1] 
      : null;
    
    if (!latestEntry) return { percentage: 0, current: goal.start_weight };
    
    const currentLoss = goal.start_weight - latestEntry.weight;
    const percentage = Math.min(100, Math.max(0, (currentLoss / totalLoss) * 100));
    
    return {
      percentage: Math.round(percentage),
      current: latestEntry.weight
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
        predicted: null
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
        predicted: currentWeight
      });
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return data;
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
    
    if (dailyChange <= 0) {
      return "No weight loss detected";
    }
    
    const remainingLoss = lastEntry.weight - goal.target_weight;
    const daysRemaining = Math.ceil(remainingLoss / dailyChange);
    
    if (daysRemaining <= 0) {
      return "Goal already achieved!";
    }
    
    const completionDate = new Date(lastEntry.date);
    completionDate.setDate(completionDate.getDate() + daysRemaining);
    
    return `Expected by ${format(completionDate, "MMMM d, yyyy")}`;
  };

  const getSelectedGoal = () => {
    return goals.find(goal => goal.id === selectedGoal);
  };

  return (
    <div className="min-h-screen pb-16 md:pb-0 bg-ui-background">
      <Navbar />
      <div className="container py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Weight Goals</h1>
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
                    <Label htmlFor="start-weight">Starting Weight</Label>
                    <div className="flex">
                      <Input
                        id="start-weight"
                        type="number"
                        step="0.1"
                        value={startWeight}
                        onChange={(e) => setStartWeight(e.target.value ? Number(e.target.value) : "")}
                        placeholder="75.0"
                      />
                      <Select value={unit} onValueChange={setUnit}>
                        <SelectTrigger className="w-20 ml-2">
                          <SelectValue placeholder="Unit" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="kg">kg</SelectItem>
                          <SelectItem value="lb">lb</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="target-weight">Target Weight</Label>
                    <Input
                      id="target-weight"
                      type="number"
                      step="0.1"
                      value={targetWeight}
                      onChange={(e) => setTargetWeight(e.target.value ? Number(e.target.value) : "")}
                      placeholder="65.0"
                    />
                  </div>
                  
                  <div className="space-y-2 sm:col-span-2">
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
                          disabled={(date) => date < new Date()}
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
                  <CardTitle>Your Goals</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {goals.map(goal => {
                      const progress = calculateProgress(goal);
                      return (
                        <div 
                          key={goal.id}
                          className={cn(
                            "p-4 rounded-lg border cursor-pointer transition-colors",
                            selectedGoal === goal.id ? "border-primary bg-primary/5" : "hover:bg-muted/50"
                          )}
                          onClick={() => setSelectedGoal(goal.id)}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-medium flex items-center">
                                <Target className="h-4 w-4 mr-2" />
                                {goal.start_weight} → {goal.target_weight} {goal.unit}
                              </h3>
                              <p className="text-sm text-muted-foreground mt-1">
                                {goal.target_date ? `By ${format(new Date(goal.target_date), "MMM d, yyyy")}` : "No deadline"}
                              </p>
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
                                className="h-full bg-primary" 
                                initial={{ width: "0%" }}
                                animate={{ width: `${progress.percentage}%` }}
                                transition={{ duration: 1, ease: "easeOut" }}
                              />
                            </div>
                          </div>
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
                    <CardTitle>Goal Details</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {(() => {
                      const goal = getSelectedGoal()!;
                      const progress = calculateProgress(goal);
                      const predictionData = generatePredictionData(goal);
                      
                      return (
                        <div className="space-y-6">
                          <div className="grid gap-4 sm:grid-cols-3">
                            <div className="bg-blue-50 p-4 rounded-lg">
                              <div className="text-sm text-blue-600 mb-1">Starting Weight</div>
                              <div className="text-2xl font-semibold">{goal.start_weight} {goal.unit}</div>
                            </div>
                            
                            <div className="bg-green-50 p-4 rounded-lg">
                              <div className="text-sm text-green-600 mb-1">Current Weight</div>
                              <div className="text-2xl font-semibold">{progress.current} {goal.unit}</div>
                            </div>
                            
                            <div className="bg-purple-50 p-4 rounded-lg">
                              <div className="text-sm text-purple-600 mb-1">Target Weight</div>
                              <div className="text-2xl font-semibold">{goal.target_weight} {goal.unit}</div>
                            </div>
                          </div>
                          
                          <div>
                            <h3 className="text-lg font-medium mb-3">Progress Tracker</h3>
                            <div className="h-4 bg-muted rounded-full overflow-hidden">
                              <motion.div 
                                className="h-full bg-gradient-to-r from-blue-500 to-purple-500" 
                                initial={{ width: "0%" }}
                                animate={{ width: `${progress.percentage}%` }}
                                transition={{ duration: 1.5, ease: "easeOut" }}
                              />
                            </div>
                            <div className="flex justify-between mt-2 text-sm">
                              <span>{goal.start_weight} {goal.unit}</span>
                              <span className="font-medium">{progress.percentage}% Complete</span>
                              <span>{goal.target_weight} {goal.unit}</span>
                            </div>
                          </div>
                          
                          {goal.target_date && (
                            <div>
                              <h3 className="text-lg font-medium mb-2">Time Remaining</h3>
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
                                    <YAxis domain={[
                                      Math.min(goal.target_weight, Math.min(...predictionData.map(d => 
                                        Math.min(
                                          d.actual !== null ? d.actual : Infinity, 
                                          d.predicted !== null ? d.predicted : Infinity
                                        )
                                      ))) - 1,
                                      Math.max(goal.start_weight, Math.max(...predictionData.map(d => 
                                        Math.max(
                                          d.actual !== null ? d.actual : -Infinity, 
                                          d.predicted !== null ? d.predicted : -Infinity
                                        )
                                      ))) + 1
                                    ]} />
                                    <Tooltip
                                      formatter={(value, name) => [Number(value).toFixed(1) + ` ${goal.unit}`, name === "actual" ? "Actual" : "Projected"]}
                                      labelFormatter={(date) => format(new Date(date), "MMMM d, yyyy")}
                                    />
                                    <Legend formatter={(value) => value === "actual" ? "Actual" : "Projected"} />
                                    <Line 
                                      type="monotone" 
                                      dataKey="actual" 
                                      stroke="#3b82f6"
                                      strokeWidth={2}
                                      dot={{ r: 4 }}
                                      isAnimationActive={true}
                                    />
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
