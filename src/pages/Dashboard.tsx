
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Calendar, Home, Target as TargetIcon, BarChart2, UserCircle, Settings } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useUserPreferences } from "@/hooks/use-user-preferences";
import { HamburgerMenu } from "@/components/ui/hamburger-menu";
import WeightJourneyInsights from "@/components/WeightJourneyInsights";
import MobileNavigation from "@/components/MobileNavigation";
import AIInsights from "@/components/dashboard/AIInsights";
import WeightEntryForm from "@/components/dashboard/WeightEntryForm";
import WeightChart from "@/components/dashboard/WeightChart";
import RecentEntries from "@/components/dashboard/RecentEntries";
import QuickActions from "@/components/dashboard/QuickActions";
import { Badge } from "@/components/ui/badge";
import NotesInput from "@/components/notes/NotesInput";

interface WeightEntry {
  id: string;
  weight: number;
  unit: string;
  date: string;
  time: string;
  description?: string;
}

const dashboardNavItems = [
  { title: "Dashboard", href: "/dashboard", icon: Home },
  { title: "Goals", href: "/goals", icon: TargetIcon },
  { title: "Reports", href: "/reports", icon: BarChart2 },
  { title: "Account", href: "/account", icon: UserCircle },
  { title: "Settings", href: "/settings", icon: Settings },
];

const Dashboard = () => {
  const { preferredUnit } = useUserPreferences();
  const [recentEntries, setRecentEntries] = useState<WeightEntry[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    firstWeight: 0,
    lastWeight: 0,
    change: 0,
    percentChange: 0,
    avgWeeklyChange: 0,
    isIncreasing: false
  });
  const [minWeight, setMinWeight] = useState<number | undefined>(undefined);
  const [maxWeight, setMaxWeight] = useState<number | undefined>(undefined);
  const [userId, setUserId] = useState<string | null>(null);
  const [showAIInsights, setShowAIInsights] = useState(true);
  const navigate = useNavigate();
  
  // Check if user is logged in
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/signin");
      }
    };
    
    checkAuth();
  }, [navigate]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate("/signin");
        return;
      }
      
      setUserId(user.id);

      // Fetch user preferences for AI insights visibility
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("show_ai_insights")
        .eq("id", user.id)
        .single();
        
      if (!profileError && profileData) {
        // Make explicit the default behavior
        setShowAIInsights(profileData?.show_ai_insights ?? true);
      } else {
        // Default to showing AI insights if there's an error or no data
        setShowAIInsights(true);
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
        return;
      }
      
      if (entries) {
        setRecentEntries(entries);
        
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
          
          const formattedChartData = Object.values(groupedByDate).map(entry => ({
            date: format(new Date(entry.date), "MMM dd"),
            weight: entry.weight,
            unit: entry.unit,
            fullDate: entry.date
          }));
          
          setChartData(formattedChartData);
          
          // Calculate min and max weights
          updateMinMaxWeights(formattedChartData);
          
          // Calculate statistics for insights
          updateStats(formattedChartData);
        }
      }
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Extract functions to update stats and min/max weights for reusability
  const updateMinMaxWeights = (chartData: any[]) => {
    if (chartData.length > 0) {
      const weights = chartData.map(entry => entry.weight);
      setMinWeight(Math.min(...weights));
      setMaxWeight(Math.max(...weights));
    }
  };
  
  const updateStats = (chartData: any[]) => {
    if (chartData.length >= 2) {
      const firstWeight = chartData[0].weight;
      const lastWeight = chartData[chartData.length - 1].weight;
      const change = lastWeight - firstWeight;
      const percentChange = (change / firstWeight) * 100;
      
      const daysDiff = Math.max(1, 
        (new Date(chartData[chartData.length - 1].fullDate).getTime() - 
         new Date(chartData[0].fullDate).getTime()) / (1000 * 60 * 60 * 24));
         
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
  
  // Initial fetch on component mount
  useEffect(() => {
    fetchData();
  }, [navigate]);

  // Handle new weight entry without page reload
  const handleEntryAdded = async (newEntry: WeightEntry) => {
    // Add the new entry to the recent entries at the top
    setRecentEntries(prevEntries => [newEntry, ...prevEntries.slice(0, 9)]);
    
    // Format the new entry for chart data
    const formattedNewEntry = {
      date: format(new Date(newEntry.date), "MMM dd"),
      weight: newEntry.weight,
      unit: newEntry.unit,
      fullDate: newEntry.date
    };
    
    // Update chart data
    const updatedChartData = [...chartData, formattedNewEntry]
      .sort((a, b) => new Date(a.fullDate).getTime() - new Date(b.fullDate).getTime());
    
    setChartData(updatedChartData);
    
    // Update min/max weights and stats
    updateMinMaxWeights(updatedChartData);
    updateStats(updatedChartData);
  };

  return (
    <div className="container py-8">
      <div className="flex flex-col space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Dashboard</h1>
            <HamburgerMenu items={dashboardNavItems} />
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link to="/reports">
                <Calendar className="mr-2 h-4 w-4" />
                Reports
              </Link>
            </Button>
          </div>
        </div>

        <WeightEntryForm onEntryAdded={handleEntryAdded} preferredUnit={preferredUnit} />
        
        {showAIInsights && (
          <div className="relative">
            <div className="flex items-center gap-2 mb-2">
              <h2 className="text-lg font-semibold">AI Insights</h2>
              <Badge variant="outline" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200 border-yellow-300">
                Coming Soon
              </Badge>
            </div>
            <AIInsights userId={userId} />
          </div>
        )}

        {chartData.length > 1 && (
          <WeightJourneyInsights 
            stats={stats}
            unit={chartData[0]?.unit || preferredUnit}
            dataLength={chartData.length}
            minWeight={minWeight}
            maxWeight={maxWeight}
          />
        )}

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="md:col-span-2 lg:col-span-4">
            <WeightChart chartData={chartData} />
          </div>

          <div className="md:col-span-2 lg:col-span-4">
            <RecentEntries entries={recentEntries} />
          </div>
          
          <div className="md:col-span-2 lg:col-span-4">
            <div className="bg-white p-4 rounded-lg shadow-sm border">
              <NotesInput userId={userId || undefined} maxLength={1000} />
            </div>
          </div>

          <div className="md:col-span-2 lg:col-span-4">
            <QuickActions />
          </div>
        </div>
      </div>
      <MobileNavigation />
    </div>
  );
};

export default Dashboard;
