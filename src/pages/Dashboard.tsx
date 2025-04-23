
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";
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
  const navigate = useNavigate();

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
        
        <AIInsights userId={userId} />

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
            <QuickActions />
          </div>
        </div>
      </div>
      <MobileNavigation />
    </div>
  );
};

export default Dashboard;

