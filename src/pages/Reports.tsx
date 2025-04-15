
import { useState, useEffect } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Area,
  AreaChart,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { format, subDays, parseISO } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { FileBarChart, Calendar, ArrowLeftRight, RefreshCw, TrendingDown, TrendingUp } from "lucide-react";

// Type for weight entry data
type WeightEntry = {
  id: string;
  weight: number;
  unit: string;
  date: string;
  time: string;
  description?: string;
};

// Custom gradient colors for charts
const GRADIENT_COLORS = {
  primary: {
    start: "#9b87f5",
    end: "#D6BCFA"
  },
  secondary: {
    start: "#0FA0CE",
    end: "#33C3F0"
  },
  tertiary: {
    start: "#F97316",
    end: "#FDBA74"
  },
  success: {
    start: "#10B981",
    end: "#6EE7B7"
  }
};

// Animation variants
const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6 }
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
};

const Reports = () => {
  const [weightData, setWeightData] = useState<WeightEntry[]>([]);
  const [processedData, setProcessedData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState("7"); // "7", "30", "90", or "custom"
  const [startDate, setStartDate] = useState(format(subDays(new Date(), 7), "yyyy-MM-dd"));
  const [endDate, setEndDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [stats, setStats] = useState({
    firstWeight: 0,
    lastWeight: 0,
    change: 0,
    percentChange: 0,
    avgWeeklyChange: 0,
    isIncreasing: false
  });

  // Fetch weight data from Supabase
  useEffect(() => {
    const fetchWeightData = async () => {
      setIsLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) return;
        
        // Determine date range for the query
        let rangeStart;
        if (dateRange === "custom") {
          rangeStart = startDate;
        } else {
          rangeStart = format(subDays(new Date(), parseInt(dateRange)), "yyyy-MM-dd");
        }
        
        // Query weight entries
        const { data, error } = await supabase
          .from("weight_entries")
          .select("*")
          .eq("user_id", user.id)
          .gte("date", rangeStart)
          .lte("date", endDate)
          .order("date", { ascending: true });
          
        if (error) throw error;
        
        if (data) {
          setWeightData(data);
          processWeightData(data);
        }
      } catch (err) {
        console.error("Error fetching weight data:", err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchWeightData();
  }, [dateRange, startDate, endDate]);
  
  // Process weight data for charts and statistics
  const processWeightData = (data: WeightEntry[]) => {
    if (!data.length) {
      setProcessedData([]);
      setStats({
        firstWeight: 0,
        lastWeight: 0,
        change: 0,
        percentChange: 0,
        avgWeeklyChange: 0,
        isIncreasing: false
      });
      return;
    }
    
    // Group entries by date (taking the last entry for each date)
    const groupedByDate = data.reduce((acc, entry) => {
      const date = entry.date;
      acc[date] = entry;
      return acc;
    }, {} as Record<string, WeightEntry>);
    
    // Convert to array and sort by date
    const processed = Object.values(groupedByDate).map(entry => ({
      date: format(new Date(entry.date), "MMM dd"),
      weight: entry.weight,
      unit: entry.unit,
      fullDate: entry.date
    })).sort((a, b) => new Date(a.fullDate).getTime() - new Date(b.fullDate).getTime());
    
    setProcessedData(processed);
    
    // Calculate statistics
    if (processed.length >= 2) {
      const firstWeight = processed[0].weight;
      const lastWeight = processed[processed.length - 1].weight;
      const change = lastWeight - firstWeight;
      const percentChange = (change / firstWeight) * 100;
      const daysDiff = Math.max(1, (new Date(processed[processed.length - 1].fullDate).getTime() - 
                       new Date(processed[0].fullDate).getTime()) / (1000 * 60 * 60 * 24));
      const avgWeeklyChange = (change / daysDiff) * 7;
      
      setStats({
        firstWeight,
        lastWeight,
        change,
        percentChange,
        avgWeeklyChange,
        isIncreasing: change > 0
      });
    }
  };
  
  // Function to handle date range selection
  const handleDateRangeChange = (value: string) => {
    setDateRange(value);
    if (value !== "custom") {
      setStartDate(format(subDays(new Date(), parseInt(value)), "yyyy-MM-dd"));
      setEndDate(format(new Date(), "yyyy-MM-dd"));
    }
  };
  
  // Format Y-axis tick values
  const formatYAxis = (value: number) => {
    return `${value}`;
  };
  
  // Custom tooltip formatting
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background/95 border border-border p-2 rounded-md shadow-md">
          <p className="font-medium">{payload[0].payload.date}</p>
          <p className="text-brand-primary">{`${payload[0].value} ${payload[0].payload.unit}`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="container py-8">
      <motion.div 
        className="space-y-6"
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
      >
        <motion.div 
          className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
          variants={fadeIn}
        >
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <FileBarChart className="h-8 w-8 text-brand-primary" />
              Weight Reports
            </h1>
            <p className="text-muted-foreground">
              Visualize your weight journey and progress over time
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <div className="w-full sm:w-auto">
              <Select value={dateRange} onValueChange={handleDateRangeChange}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <div className="flex items-center">
                    <Calendar className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Select range" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">Last 7 days</SelectItem>
                  <SelectItem value="30">Last 30 days</SelectItem>
                  <SelectItem value="90">Last 90 days</SelectItem>
                  <SelectItem value="custom">Custom range</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {dateRange === "custom" && (
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="space-y-1 w-full sm:w-auto">
                  <Label htmlFor="startDate" className="sr-only">Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full sm:w-auto"
                  />
                </div>
                <div className="space-y-1 w-full sm:w-auto">
                  <Label htmlFor="endDate" className="sr-only">End Date</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full sm:w-auto"
                  />
                </div>
              </div>
            )}
            
            <Button 
              variant="outline" 
              onClick={() => {
                if (dateRange !== "custom") {
                  setStartDate(format(subDays(new Date(), parseInt(dateRange)), "yyyy-MM-dd"));
                  setEndDate(format(new Date(), "yyyy-MM-dd"));
                }
              }}
              className="w-full sm:w-auto"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
          </div>
        </motion.div>
      
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-primary"></div>
          </div>
        ) : processedData.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center h-64">
              <FileBarChart className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-xl font-medium mb-2">No weight data available</h3>
              <p className="text-muted-foreground text-center max-w-md">
                Add weight entries in the dashboard to see your progress visualized here.
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Stats Cards */}
            <motion.div 
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
              variants={staggerContainer}
            >
              <motion.div variants={fadeIn}>
                <Card className="overflow-hidden">
                  <div className="h-1 bg-gradient-to-r from-blue-400 to-blue-600"></div>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Starting Weight</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.firstWeight} {processedData[0]?.unit}</div>
                    <p className="text-xs text-muted-foreground">
                      First entry in selected period
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
              
              <motion.div variants={fadeIn}>
                <Card className="overflow-hidden">
                  <div className="h-1 bg-gradient-to-r from-purple-400 to-purple-600"></div>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Current Weight</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.lastWeight} {processedData[0]?.unit}</div>
                    <p className="text-xs text-muted-foreground">
                      Latest entry in selected period
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
              
              <motion.div variants={fadeIn}>
                <Card className="overflow-hidden">
                  <div className="h-1 bg-gradient-to-r from-green-400 to-green-600"></div>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Total Change</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold flex items-center">
                      {stats.isIncreasing ? (
                        <TrendingUp className="mr-1 h-5 w-5 text-red-500" />
                      ) : (
                        <TrendingDown className="mr-1 h-5 w-5 text-green-500" />
                      )}
                      {stats.change.toFixed(1)} {processedData[0]?.unit}
                    </div>
                    <p className={`text-xs ${stats.isIncreasing ? 'text-red-500' : 'text-green-500'}`}>
                      {stats.percentChange.toFixed(1)}% {stats.isIncreasing ? 'increase' : 'decrease'}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
              
              <motion.div variants={fadeIn}>
                <Card className="overflow-hidden">
                  <div className="h-1 bg-gradient-to-r from-orange-400 to-orange-600"></div>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Weekly Average</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold flex items-center">
                      {stats.avgWeeklyChange > 0 ? (
                        <TrendingUp className="mr-1 h-5 w-5 text-red-500" />
                      ) : (
                        <TrendingDown className="mr-1 h-5 w-5 text-green-500" />
                      )}
                      {Math.abs(stats.avgWeeklyChange).toFixed(1)} {processedData[0]?.unit}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Average weekly {stats.avgWeeklyChange > 0 ? 'gain' : 'loss'}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
          
            {/* Main Line Chart */}
            <motion.div variants={fadeIn}>
              <Card className="overflow-hidden">
                <div className="h-1 bg-gradient-to-r from-indigo-400 to-purple-600"></div>
                <CardHeader>
                  <CardTitle>Weight Trend</CardTitle>
                  <CardDescription>
                    Your weight progression over the selected time period
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[350px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={processedData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={GRADIENT_COLORS.primary.start} stopOpacity={0.8}/>
                            <stop offset="95%" stopColor={GRADIENT_COLORS.primary.end} stopOpacity={0.2}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis dataKey="date" tick={{ fontSize: 12 }} className="text-xs" />
                        <YAxis 
                          domain={['auto', 'auto']} 
                          tickFormatter={formatYAxis} 
                          tick={{ fontSize: 12 }}
                          className="text-xs"
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Area 
                          type="monotone" 
                          dataKey="weight" 
                          stroke={GRADIENT_COLORS.primary.start} 
                          strokeWidth={3}
                          fill="url(#colorWeight)"
                          activeDot={{ r: 8, className: "animate-pulse" }}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
            
            {/* Additional Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <motion.div variants={fadeIn}>
                <Card className="overflow-hidden">
                  <div className="h-1 bg-gradient-to-r from-cyan-400 to-blue-600"></div>
                  <CardHeader>
                    <CardTitle>Weekly Progress</CardTitle>
                    <CardDescription>
                      Weight changes by day of week
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={processedData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                          <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                          <YAxis tick={{ fontSize: 12 }} />
                          <Tooltip content={<CustomTooltip />} />
                          <defs>
                            <linearGradient id="barColor" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor={GRADIENT_COLORS.secondary.start} stopOpacity={0.8}/>
                              <stop offset="95%" stopColor={GRADIENT_COLORS.secondary.end} stopOpacity={0.3}/>
                            </linearGradient>
                          </defs>
                          <Bar 
                            dataKey="weight" 
                            fill="url(#barColor)" 
                            radius={[4, 4, 0, 0]}
                            className="motion-safe:animate-bounce-once"
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
              
              <motion.div variants={fadeIn}>
                <Card className="overflow-hidden">
                  <div className="h-1 bg-gradient-to-r from-orange-400 to-red-500"></div>
                  <CardHeader>
                    <CardTitle>Weight Range Distribution</CardTitle>
                    <CardDescription>
                      Distribution of your recorded weights
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex items-center justify-center">
                    <div className="h-[300px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={processedData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                          <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                          <YAxis domain={['auto', 'auto']} tickFormatter={formatYAxis} tick={{ fontSize: 12 }} />
                          <Tooltip content={<CustomTooltip />} />
                          <defs>
                            <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                              <stop offset="5%" stopColor={GRADIENT_COLORS.tertiary.start} stopOpacity={1}/>
                              <stop offset="95%" stopColor={GRADIENT_COLORS.tertiary.end} stopOpacity={1}/>
                            </linearGradient>
                          </defs>
                          <Line 
                            type="natural" 
                            dataKey="weight" 
                            stroke="url(#lineGradient)" 
                            strokeWidth={3}
                            dot={{ stroke: GRADIENT_COLORS.tertiary.start, strokeWidth: 2, r: 4 }}
                            activeDot={{ r: 8, className: "animate-ping" }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
            
            {/* Analytics Insights */}
            <motion.div variants={fadeIn}>
              <Card className="overflow-hidden bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ArrowLeftRight className="h-5 w-5 text-brand-primary" />
                    Weight Journey Insights
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-muted-foreground">
                      {processedData.length < 2 ? (
                        "Add more weight entries to see insights about your progress."
                      ) : stats.isIncreasing ? (
                        `Over the past ${processedData.length} entries, your weight has increased by ${Math.abs(stats.change).toFixed(1)} ${processedData[0]?.unit} (${Math.abs(stats.percentChange).toFixed(1)}%). You're averaging a gain of ${Math.abs(stats.avgWeeklyChange).toFixed(1)} ${processedData[0]?.unit} per week.`
                      ) : (
                        `Over the past ${processedData.length} entries, your weight has decreased by ${Math.abs(stats.change).toFixed(1)} ${processedData[0]?.unit} (${Math.abs(stats.percentChange).toFixed(1)}%). You're averaging a loss of ${Math.abs(stats.avgWeeklyChange).toFixed(1)} ${processedData[0]?.unit} per week.`
                      )}
                    </p>
                    
                    {processedData.length >= 7 && (
                      <div className="p-4 bg-background rounded-md shadow-sm">
                        <h4 className="font-semibold mb-2">Trend Analysis</h4>
                        <ul className="space-y-2 list-disc list-inside text-sm text-muted-foreground">
                          {stats.avgWeeklyChange !== 0 && (
                            <li>
                              At your current rate, you'll {stats.isIncreasing ? 'gain' : 'lose'} approximately {
                                (Math.abs(stats.avgWeeklyChange) * 4).toFixed(1)
                              } {processedData[0]?.unit} over the next month.
                            </li>
                          )}
                          <li>
                            Your minimum recorded weight during this period was {
                              Math.min(...processedData.map(d => d.weight)).toFixed(1)
                            } {processedData[0]?.unit}.
                          </li>
                          <li>
                            Your maximum recorded weight during this period was {
                              Math.max(...processedData.map(d => d.weight)).toFixed(1)
                            } {processedData[0]?.unit}.
                          </li>
                          <li>
                            The difference between your highest and lowest weights is {
                              (Math.max(...processedData.map(d => d.weight)) - 
                              Math.min(...processedData.map(d => d.weight))).toFixed(1)
                            } {processedData[0]?.unit}.
                          </li>
                        </ul>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </>
        )}
      </motion.div>
    </div>
  );
};

export default Reports;
