
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart3, 
  Calendar, 
  ChevronRight, 
  LineChart, 
  Plus, 
  Settings, 
  Target, 
  TrendingDown, 
  TrendingUp,
  Trophy,
  User
} from "lucide-react";

const Dashboard = () => {
  // Placeholder for user data - will be fetched from Supabase later
  const [userData] = useState({
    name: "John Doe",
    initialWeight: 180,
    currentWeight: 172.5,
    goalWeight: 165,
    progress: 0.42, // 42% progress towards goal
  });

  return (
    <div className="container py-8">
      <div className="flex flex-col space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome back, {userData.name}. Here's your progress so far.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Calendar className="mr-2 h-4 w-4" />
              History
            </Button>
            <Button size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Add Entry
            </Button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Initial Weight
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userData.initialWeight} lbs</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Current Weight
              </CardTitle>
              <TrendingDown className="h-4 w-4 text-weight-loss" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userData.currentWeight} lbs</div>
              <p className="text-xs text-weight-loss">
                -{(userData.initialWeight - userData.currentWeight).toFixed(1)} lbs since start
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Goal Weight
              </CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userData.goalWeight} lbs</div>
              <p className="text-xs text-muted-foreground">
                {(userData.currentWeight - userData.goalWeight).toFixed(1)} lbs to go
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Goal Progress
              </CardTitle>
              <Trophy className="h-4 w-4 text-brand-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{Math.round(userData.progress * 100)}%</div>
              <div className="mt-2 h-2 w-full rounded-full bg-muted">
                <div
                  className="h-2 rounded-full bg-brand-primary"
                  style={{ width: `${userData.progress * 100}%` }}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="progress" className="space-y-4">
          <TabsList>
            <TabsTrigger value="progress">
              <LineChart className="mr-2 h-4 w-4" />
              Progress
            </TabsTrigger>
            <TabsTrigger value="goals">
              <Target className="mr-2 h-4 w-4" />
              Goals
            </TabsTrigger>
            <TabsTrigger value="analytics">
              <BarChart3 className="mr-2 h-4 w-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="account">
              <User className="mr-2 h-4 w-4" />
              Account
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="progress" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Weight History</CardTitle>
              </CardHeader>
              <CardContent className="h-[300px] flex items-center justify-center bg-muted/30 rounded-md">
                <p className="text-muted-foreground text-center">
                  Weight tracking chart will be displayed here
                </p>
              </CardContent>
            </Card>
            
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Entries</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { date: "Today", weight: 172.5 },
                      { date: "Yesterday", weight: 172.8 },
                      { date: "Apr 13, 2025", weight: 173.2 },
                      { date: "Apr 12, 2025", weight: 173.5 },
                    ].map((entry, i) => (
                      <div key={i} className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0">
                        <div className="flex items-center">
                          <div className="ml-2">
                            <p className="text-sm font-medium">{entry.date}</p>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <p className="mr-2 text-sm font-semibold">{entry.weight} lbs</p>
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Milestones</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { name: "10% of goal reached", date: "Apr 5, 2025", completed: true },
                      { name: "25% of goal reached", date: "Apr 10, 2025", completed: true },
                      { name: "Halfway there!", date: "Est. May 2, 2025", completed: false },
                      { name: "Goal weight reached", date: "Est. Jun 15, 2025", completed: false },
                    ].map((milestone, i) => (
                      <div key={i} className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0">
                        <div className="flex items-center">
                          <div className={`h-3 w-3 rounded-full ${milestone.completed ? "bg-goal-progress" : "bg-muted"}`} />
                          <div className="ml-3">
                            <p className="text-sm font-medium">{milestone.name}</p>
                            <p className="text-xs text-muted-foreground">{milestone.date}</p>
                          </div>
                        </div>
                        {milestone.completed && (
                          <Trophy className="h-5 w-5 text-yellow-500" />
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="goals" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Your Goals</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Goals section content will be implemented here
                </p>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add New Goal
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="analytics" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Analytics section content will be implemented here
                </p>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="account" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Account Management</CardTitle>
                <Settings className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {/* Account settings will be a component we'll create next */}
                <p className="text-muted-foreground">
                  Account settings component will be loaded here
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;
