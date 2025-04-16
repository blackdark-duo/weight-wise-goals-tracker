import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  BarChart3, 
  Calendar, 
  ChevronRight, 
  LineChart, 
  Plus, 
  Target, 
  TrendingDown, 
  TrendingUp,
  Trophy,
  FileBarChart,
  Scale,
} from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { useUserPreferences } from "@/hooks/use-user-preferences";

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.4
    }
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const popIn = {
  hidden: { scale: 0.8, opacity: 0 },
  visible: { 
    scale: 1, 
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 25
    }
  }
};

type WeightEntry = {
  id: string;
  weight: number;
  unit: string;
  date: string;
  time: string;
  description?: string;
};

type UserProfile = {
  id: string;
  display_name: string;
  preferred_unit: string;
  timezone?: string;
};

const Dashboard = () => {
  const { preferredUnit } = useUserPreferences();
  
  const [userData, setUserData] = useState({
    name: "",
    initialWeight: 0,
    currentWeight: 0,
    goalWeight: 0,
    progress: 0,
    unit: preferredUnit
  });
  
  const [newWeight, setNewWeight] = useState("");
  const [weightUnit, setWeightUnit] = useState(preferredUnit);
  const [entryDate, setEntryDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [entryTime, setEntryTime] = useState(format(new Date(), "HH:mm"));
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [recentEntries, setRecentEntries] = useState<WeightEntry[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  
  const navigate = useNavigate();

  useEffect(() => {
    setWeightUnit(preferredUnit);
  }, [preferredUnit]);

  useEffect(() => {
    const fetchUserData = async () => {
      setIsLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          navigate("/signin");
          return;
        }
        
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();
          
        if (profileError && profileError.code !== "PGRST116") {
          console.error("Error fetching profile:", profileError);
        }
        
        if (profileData) {
          setUserProfile(profileData);
          setWeightUnit(profileData.preferred_unit || "kg");
        }
        
        const { data: entries, error: entriesError } = await supabase
          .from("weight_entries")
          .select("*")
          .eq("user_id", user.id)
          .order("date", { ascending: false })
          .order("time", { ascending: false })
          .limit(10);
          
        if (entriesError) {
          console.error("Error fetching entries:", entriesError);
        }
        
        if (entries && entries.length > 0) {
          setRecentEntries(entries);
          
          const { data: firstEntry } = await supabase
            .from("weight_entries")
            .select("*")
            .eq("user_id", user.id)
            .order("date", { ascending: true })
            .order("time", { ascending: true })
            .limit(1)
            .single();
            
          const { data: goalData } = await supabase
            .from("goals")
            .select("*")
            .eq("user_id", user.id)
            .eq("achieved", false)
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle();
            
          const sevenDaysAgo = new Date();
          sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
          
          const { data: chartEntries } = await supabase
            .from("weight_entries")
            .select("*")
            .eq("user_id", user.id)
            .gte("date", format(sevenDaysAgo, "yyyy-MM-dd"))
            .order("date", { ascending: true });
            
          if (chartEntries && chartEntries.length > 0) {
            const groupedByDate = chartEntries.reduce((acc, entry) => {
              if (!acc[entry.date]) {
                acc[entry.date] = entry;
              }
              return acc;
            }, {} as Record<string, WeightEntry>);
            
            const chartData = Object.values(groupedByDate).map(entry => ({
              date: format(new Date(entry.date), "MMM dd"),
              weight: entry.weight,
              unit: entry.unit
            }));
            
            setChartData(chartData);
          }
          
          let progress = 0;
          if (goalData && firstEntry) {
            const initialWeight = firstEntry.weight;
            const currentWeight = entries[0].weight;
            const goalWeight = goalData.target_weight;
            
            if (initialWeight > goalWeight) {
              progress = Math.min(1, Math.max(0, 
                (initialWeight - currentWeight) / (initialWeight - goalWeight)
              ));
            } else if (initialWeight < goalWeight) {
              progress = Math.min(1, Math.max(0, 
                (currentWeight - initialWeight) / (goalWeight - initialWeight)
              ));
            }
            
            setUserData({
              name: profileData?.display_name || user.email?.split("@")[0] || "User",
              initialWeight: firstEntry.weight,
              currentWeight: entries[0].weight,
              goalWeight: goalData.target_weight,
              progress,
              unit: entries[0].unit
            });
          } else {
            setUserData({
              name: profileData?.display_name || user.email?.split("@")[0] || "User",
              initialWeight: firstEntry ? firstEntry.weight : entries[0].weight,
              currentWeight: entries[0].weight,
              goalWeight: 0,
              progress: 0,
              unit: entries[0].unit
            });
          }
        }
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUserData();
  }, [navigate]);

  const handleAddWeight = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newWeight) {
      toast.error("Please enter a weight value");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const weight = parseFloat(newWeight);
      
      if (isNaN(weight) || weight <= 0) {
        toast.error("Please enter a valid weight value");
        return;
      }
      
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("You must be logged in to add weight entries");
        return;
      }
      
      const { data, error } = await supabase
        .from("weight_entries")
        .insert({
          user_id: user.id,
          weight,
          unit: weightUnit,
          date: entryDate,
          time: entryTime,
          description: description.trim() || null
        })
        .select()
        .single();
        
      if (error) throw error;
      
      setRecentEntries(prev => [data, ...prev].slice(0, 10));
      
      setUserData(prev => ({
        ...prev,
        currentWeight: weight
      }));
      
      setNewWeight("");
      setDescription("");
      
      toast.success("Weight entry added successfully!");
      
      setTimeout(() => {
        window.location.reload();
      }, 1000);
      
    } catch (err: any) {
      console.error("Error adding weight entry:", err);
      toast.error(err.message || "Failed to add weight entry");
    } finally {
      setIsSubmitting(false);
    }
  };
  
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

  return (
    <motion.div 
      className="container py-8"
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
    >
      <motion.div className="flex flex-col space-y-6" variants={staggerContainer}>
        <motion.div className="flex items-center justify-between" variants={fadeInUp}>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome back, {userData.name}. Here's your progress so far.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link to="/reports">
                <Calendar className="mr-2 h-4 w-4" />
                Reports
              </Link>
            </Button>
          </div>
        </motion.div>

        <motion.div variants={popIn}>
          <Card className="overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-brand-primary to-purple-500"></div>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Scale className="h-5 w-5 text-brand-primary" />
                Add Weight Entry
              </CardTitle>
              <CardDescription>
                Record your current weight to track your progress
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddWeight} className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="space-y-2">
                    <Label htmlFor="weight">Weight*</Label>
                    <div className="flex">
                      <Input
                        id="weight"
                        type="number"
                        step="any"
                        min="0"
                        placeholder="Enter weight"
                        value={newWeight}
                        onChange={(e) => setNewWeight(e.target.value)}
                        required
                        className="rounded-r-none"
                      />
                      <Button
                        variant="outline"
                        type="button"
                        onClick={() => setWeightUnit(weightUnit === "kg" ? "lbs" : "kg")}
                        className="rounded-l-none border-l-0"
                      >
                        {weightUnit}
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="date">Date</Label>
                    <Input
                      id="date"
                      type="date"
                      value={entryDate}
                      onChange={(e) => setEntryDate(e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="time">Time</Label>
                    <Input
                      id="time"
                      type="time"
                      value={entryTime}
                      onChange={(e) => setEntryTime(e.target.value)}
                    />
                  </div>
                  
                  <div className="flex items-end">
                    <motion.div 
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="w-full"
                    >
                      <Button 
                        type="submit" 
                        disabled={isSubmitting}
                        className="w-full bg-gradient-to-r from-brand-primary to-purple-500 hover:from-brand-primary/90 hover:to-purple-500/90"
                      >
                        {isSubmitting ? "Adding..." : "Add Entry"}
                        <Plus className="ml-2 h-4 w-4" />
                      </Button>
                    </motion.div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Notes (optional)</Label>
                  <Textarea
                    id="description"
                    placeholder="Add any notes about this weight entry..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={2}
                  />
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div 
          className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
          variants={staggerContainer}
        >
          <motion.div variants={popIn}>
            <Card className="overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-green-400 to-green-600"></div>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  Current Weight
                </CardTitle>
                <TrendingDown className="h-4 w-4 text-weight-loss" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{userData.currentWeight} {userData.unit}</div>
                <p className="text-xs text-weight-loss">
                  {userData.initialWeight > userData.currentWeight 
                    ? `↓ ${(userData.initialWeight - userData.currentWeight).toFixed(1)} ${userData.unit} since start`
                    : userData.initialWeight < userData.currentWeight
                    ? `↑ ${(userData.currentWeight - userData.initialWeight).toFixed(1)} ${userData.unit} since start`
                    : "No change since start"}
                </p>
              </CardContent>
            </Card>
          </motion.div>
          
          <motion.div variants={popIn}>
            <Card className="overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-purple-400 to-purple-600"></div>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  Goal Weight
                </CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {userData.goalWeight ? `${userData.goalWeight} ${userData.unit}` : "Not set"}
                </div>
                {userData.goalWeight ? (
                  <p className="text-xs text-muted-foreground">
                    {userData.currentWeight > userData.goalWeight
                      ? `${(userData.currentWeight - userData.goalWeight).toFixed(1)} ${userData.unit} to go`
                      : userData.currentWeight < userData.goalWeight
                      ? `${(userData.goalWeight - userData.currentWeight).toFixed(1)} ${userData.unit} to go`
                      : "Goal achieved!"}
                  </p>
                ) : (
                  <p className="text-xs text-brand-primary cursor-pointer hover:underline">
                    <Link to="/goals">Set a goal weight to track progress</Link>
                  </p>
                )}
              </CardContent>
            </Card>
          </motion.div>
          
          <motion.div variants={popIn} className="md:col-span-2">
            <Card className="overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-yellow-400 to-amber-600"></div>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  Goal Progress
                </CardTitle>
                <Trophy className="h-4 w-4 text-brand-primary" />
              </CardHeader>
              <CardContent>
                {userData.goalWeight ? (
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">{userData.currentWeight} {userData.unit}</span>
                      <span className="text-sm font-medium">{Math.round(userData.progress * 100)}%</span>
                      <span className="text-sm">{userData.goalWeight} {userData.unit}</span>
                    </div>
                    
                    <div className="relative h-8 w-full bg-muted rounded-full overflow-hidden">
                      <motion.div
                        className="absolute top-0 left-0 h-full rounded-full bg-gradient-to-r from-brand-primary to-brand-primary/70"
                        style={{ width: `${userData.progress * 100}%` }}
                        initial={{ width: 0 }}
                        animate={{ width: `${userData.progress * 100}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                      />
                      
                      <div 
                        className="absolute top-0 h-full"
                        style={{ 
                          left: `${userData.progress * 100}%`,
                          transform: 'translateX(-50%)'
                        }}
                      >
                        <div className="h-8 w-2 bg-white border border-gray-300 rounded-full" />
                      </div>
                      
                      {userData.initialWeight !== userData.goalWeight && (
                        <>
                          {[0.25, 0.5, 0.75].map((milestone) => {
                            const milestonePosition = `${milestone * 100}%`;
                            
                            const milestoneWeight = userData.initialWeight > userData.goalWeight
                              ? userData.initialWeight - (milestone * (userData.initialWeight - userData.goalWeight))
                              : userData.initialWeight + (milestone * (userData.goalWeight - userData.initialWeight));
                              
                            const isReached = userData.initialWeight > userData.goalWeight
                              ? userData.currentWeight <= milestoneWeight
                              : userData.currentWeight >= milestoneWeight;
                              
                            return (
                              <div 
                                key={milestone}
                                className="absolute top-0 h-full flex flex-col items-center"
                                style={{ 
                                  left: milestonePosition,
                                }}
                              >
                                <div 
                                  className={`h-8 w-0.5 ${isReached ? 'bg-white' : 'bg-gray-400'}`}
                                />
                                <span className="text-xs mt-1">{milestoneWeight.toFixed(1)}</span>
                              </div>
                            );
                          })}
                        </>
                      )}
                    </div>
                    
                    <p className="text-center text-sm text-muted-foreground mt-2">
                      {userData.currentWeight > userData.goalWeight
                        ? `${(userData.currentWeight - userData.goalWeight).toFixed(1)} ${userData.unit} left to lose`
                        : `${(userData.goalWeight - userData.currentWeight).toFixed(1)} ${userData.unit} left to gain`}
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center p-4">
                    <p className="text-muted-foreground">No goal set yet</p>
                    <Button variant="outline" size="sm" className="mt-2" asChild>
                      <Link to="/goals">
                        <Target className="mr-2 h-4 w-4" />
                        Set Weight Goal
                      </Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        <motion.div variants={fadeInUp}>
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
                      <YAxis domain={['auto', 'auto']} />
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
        </motion.div>

        <motion.div variants={fadeInUp}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Recent Entries</CardTitle>
                <CardDescription>Your latest weight measurements</CardDescription>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link to="/reports">
                  <Calendar className="mr-2 h-4 w-4" />
                  View All
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {recentEntries.length > 0 ? (
                <div className="space-y-1">
                  {recentEntries.slice(0, 5).map((entry, i) => (
                    <motion.div 
                      key={entry.id}
                      className="flex items-center justify-between border-b py-3 last:border-0 last:pb-0"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                    >
                      <div className="flex items-center">
                        <div>
                          <p className="text-sm font-medium">
                            {format(new Date(entry.date), "MMM dd, yyyy")}
                            <span className="text-xs text-muted-foreground ml-2">
                              {entry.time.slice(0, 5)}
                            </span>
                          </p>
                          {entry.description && (
                            <p className="text-xs text-muted-foreground mt-1 italic">
                              "{entry.description}"
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center">
                        <p className="mr-2 text-sm font-semibold">{entry.weight} {entry.unit}</p>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-32 text-center">
                  <p className="text-muted-foreground">
                    No weight entries yet. Add your first entry above.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={fadeInUp} className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Goals</CardTitle>
              <CardDescription>Set and track your weight goals</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col">
                <p className="text-muted-foreground mb-4">
                  Set weight goals to stay motivated and track your progress over time.
                </p>
                <Button asChild>
                  <Link to="/goals">
                    <Target className="mr-2 h-4 w-4" />
                    Manage Goals
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Reports</CardTitle>
              <CardDescription>View detailed weight analytics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col">
                <p className="text-muted-foreground mb-4">
                  Access comprehensive reports and insights about your weight journey.
                </p>
                <Button asChild>
                  <Link to="/reports">
                    <BarChart3 className="mr-2 h-4 w-4" />
                    View Reports
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default Dashboard;
