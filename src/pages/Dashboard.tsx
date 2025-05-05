
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
import { Textarea } from "@/components/ui/textarea";

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
  const [dietNote, setDietNote] = useState("");
  const [showAIInsights, setShowAIInsights] = useState(true);
  const navigate = useNavigate();
  
  const MAX_DIET_NOTE_LENGTH = 1000;
  
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

  useEffect(() => {
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
          // If the field exists, use it, otherwise default to true
          setShowAIInsights(profileData.show_ai_insights !== false);
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
            const weights = formattedChartData.map(entry => entry.weight);
            setMinWeight(Math.min(...weights));
            setMaxWeight(Math.max(...weights));
            
            // Calculate statistics for insights
            if (formattedChartData.length >= 2) {
              const firstWeight = formattedChartData[0].weight;
              const lastWeight = formattedChartData[formattedChartData.length - 1].weight;
              const change = lastWeight - firstWeight;
              const percentChange = (change / firstWeight) * 100;
              
              const daysDiff = Math.max(1, 
                (new Date(formattedChartData[formattedChartData.length - 1].fullDate).getTime() - 
                 new Date(formattedChartData[0].fullDate).getTime()) / (1000 * 60 * 60 * 24));
                 
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
          }
        }
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [navigate]);

  const handleEntryAdded = () => {
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };
  
  const saveDietNote = async () => {
    if (!userId || !dietNote.trim()) return;
    
    try {
      const today = new Date().toISOString().split('T')[0];
      const currentTime = new Date().toISOString().split('T')[1].substring(0, 8);
      
      const { error } = await supabase
        .from("weight_entries")
        .insert({
          user_id: userId,
          date: today,
          time: currentTime,
          weight: 0, // Using 0 as a flag for diet-only entries
          unit: preferredUnit,
          description: dietNote.trim()
        });
        
      if (error) {
        console.error("Error saving diet note:", error);
        return;
      }
      
      setDietNote("");
      handleEntryAdded();
    } catch (err) {
      console.error("Error saving diet note:", err);
    }
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
              <h3 className="text-lg font-medium mb-2">Notes (Diet Related)</h3>
              <div className="space-y-2">
                <Textarea 
                  placeholder="Record your diet notes here..."
                  className="min-h-[100px] resize-none"
                  value={dietNote}
                  onChange={(e) => setDietNote(e.target.value.slice(0, MAX_DIET_NOTE_LENGTH))}
                  maxLength={MAX_DIET_NOTE_LENGTH}
                />
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    {dietNote.length}/{MAX_DIET_NOTE_LENGTH} characters
                  </span>
                  <Button 
                    onClick={saveDietNote} 
                    disabled={!dietNote.trim() || dietNote.length > MAX_DIET_NOTE_LENGTH}
                    size="sm"
                  >
                    Save Note
                  </Button>
                </div>
              </div>
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
