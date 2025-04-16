
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import AccountManagement from "@/components/AccountManagement";
import { supabase } from "@/integrations/supabase/client";
import { Download, Upload, FileJson, ExternalLink, HelpCircle, RotateCcw } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const Account = () => {
  const [userName, setUserName] = useState<string | null>(null);
  const [preferredUnit, setPreferredUnit] = useState<string>("kg");
  const [timezone, setTimezone] = useState<string>("UTC");
  const [isExporting, setIsExporting] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  
  // For file input reference
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          const { data } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", user.id)
            .single();
            
          if (data) {
            setUserName(data.display_name || null);
            setPreferredUnit(data.preferred_unit || "kg");
            setTimezone(data.timezone || "UTC");
          }
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      }
    };
    
    fetchUserProfile();
  }, []);

  // Function to update user preferences
  const updatePreferences = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("You must be logged in to update preferences");
        return;
      }
      
      const { error } = await supabase
        .from("profiles")
        .update({
          preferred_unit: preferredUnit,
          timezone: timezone,
          updated_at: new Date()
        })
        .eq("id", user.id);
        
      if (error) throw error;
      
      toast.success("Preferences updated successfully");
    } catch (error: any) {
      console.error("Error updating preferences:", error);
      toast.error(error.message || "Failed to update preferences");
    }
  };

  // Function to handle export of user data
  const handleExportData = async () => {
    try {
      setIsExporting(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("You must be logged in to export data");
        return;
      }
      
      // Fetch weight entries
      const { data: weightEntries, error: entriesError } = await supabase
        .from("weight_entries")
        .select("*")
        .eq("user_id", user.id)
        .order("date", { ascending: false });
        
      if (entriesError) throw entriesError;
      
      // Fetch goals
      const { data: goals, error: goalsError } = await supabase
        .from("goals")
        .select("*")
        .eq("user_id", user.id);
        
      if (goalsError) throw goalsError;
      
      // Fetch profile
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
        
      if (profileError && profileError.code !== "PGRST116") throw profileError;
      
      // Prepare export data
      const exportData = {
        profile: profile || {},
        weightEntries: weightEntries || [],
        goals: goals || [],
        exportDate: new Date().toISOString(),
        version: "1.0"
      };
      
      // Convert to JSON and create download link
      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: "application/json" });
      const url = URL.createObjectURL(dataBlob);
      
      const a = document.createElement("a");
      a.href = url;
      a.download = `weight-tracker-export-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      
      // Cleanup
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 100);
      
      toast.success("Data exported successfully");
    } catch (error: any) {
      console.error("Error exporting data:", error);
      toast.error(error.message || "Failed to export data");
    } finally {
      setIsExporting(false);
    }
  };

  // Function to handle file selection for import
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setImportFile(e.target.files[0]);
    }
  };

  // Function to handle importing data
  const handleImportData = async () => {
    if (!importFile) {
      toast.error("Please select a file to import");
      return;
    }
    
    try {
      setIsImporting(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("You must be logged in to import data");
        return;
      }
      
      // Read file
      const fileContent = await importFile.text();
      let importData;
      
      try {
        importData = JSON.parse(fileContent);
      } catch (e) {
        throw new Error("Invalid JSON file format");
      }
      
      // Validate file structure
      if (!importData.weightEntries || !Array.isArray(importData.weightEntries)) {
        throw new Error("Invalid import file: missing weight entries");
      }
      
      // Prepare data for import - modify to match current user ID
      const weightEntries = importData.weightEntries.map((entry: any) => ({
        ...entry,
        user_id: user.id,
        id: undefined  // Remove existing IDs to create new ones
      }));
      
      // Import weight entries
      if (weightEntries.length > 0) {
        const { error: entriesError } = await supabase
          .from("weight_entries")
          .insert(weightEntries);
          
        if (entriesError) throw entriesError;
      }
      
      // Import goals if they exist
      if (importData.goals && Array.isArray(importData.goals) && importData.goals.length > 0) {
        const goals = importData.goals.map((goal: any) => ({
          ...goal,
          user_id: user.id,
          id: undefined  // Remove existing IDs to create new ones
        }));
        
        const { error: goalsError } = await supabase
          .from("goals")
          .insert(goals);
          
        if (goalsError) throw goalsError;
      }
      
      toast.success(`Successfully imported ${weightEntries.length} weight entries and ${importData.goals?.length || 0} goals`);
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      setImportFile(null);
      
      // Reload the page to reflect the imported data
      setTimeout(() => {
        window.location.reload();
      }, 1500);
      
    } catch (error: any) {
      console.error("Error importing data:", error);
      toast.error(error.message || "Failed to import data");
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="min-h-screen pb-16 md:pb-0 bg-ui-background">
      <Navbar />
      <div className="container pt-6 pb-24">
        <h1 className="text-2xl font-bold mb-6">Account Settings</h1>
        
        {userName && (
          <div className="mb-4 text-muted-foreground">
            Welcome, {userName}
          </div>
        )}
        
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                Update your account settings and preferences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AccountManagement />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Preferences</CardTitle>
              <CardDescription>
                Customize your weight tracking experience
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="preferred-unit">Preferred Weight Unit</Label>
                  <Select value={preferredUnit} onValueChange={setPreferredUnit}>
                    <SelectTrigger id="preferred-unit">
                      <SelectValue placeholder="Select unit" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="kg">Kilograms (kg)</SelectItem>
                      <SelectItem value="lbs">Pounds (lbs)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select value={timezone} onValueChange={setTimezone}>
                    <SelectTrigger id="timezone">
                      <SelectValue placeholder="Select timezone" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="UTC">UTC</SelectItem>
                      <SelectItem value="America/New_York">Eastern Time (ET)</SelectItem>
                      <SelectItem value="America/Chicago">Central Time (CT)</SelectItem>
                      <SelectItem value="America/Denver">Mountain Time (MT)</SelectItem>
                      <SelectItem value="America/Los_Angeles">Pacific Time (PT)</SelectItem>
                      <SelectItem value="Europe/London">Greenwich Mean Time (GMT)</SelectItem>
                      <SelectItem value="Europe/Paris">Central European Time (CET)</SelectItem>
                      <SelectItem value="Asia/Tokyo">Japan Standard Time (JST)</SelectItem>
                      <SelectItem value="Australia/Sydney">Australian Eastern Time (AET)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <Button onClick={updatePreferences} className="mt-4">
                Save Preferences
              </Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Data Management</CardTitle>
              <CardDescription>
                Export or import your weight tracking data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-2 p-4 border rounded-md">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-medium">Export Data</h3>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <HelpCircle className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">Download all your weight entries and goals in JSON format</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    Download all your weight tracking data as a JSON file for backup or transferring to another device.
                  </p>
                  <Button 
                    onClick={handleExportData} 
                    disabled={isExporting}
                    className="w-full"
                  >
                    {isExporting ? "Exporting..." : "Export Data"}
                    <Download className="ml-2 h-4 w-4" />
                  </Button>
                </div>
                
                <div className="space-y-2 p-4 border rounded-md">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-medium">Import Data</h3>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <HelpCircle className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">Import previously exported data in JSON format</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    Import previously exported weight tracking data from a JSON file.
                  </p>
                  
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button className="w-full">
                        Import Data
                        <Upload className="ml-2 h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Import Weight Tracking Data</DialogTitle>
                        <DialogDescription>
                          Upload a previously exported JSON file to import your weight data. This will add the imported entries to your existing data.
                        </DialogDescription>
                      </DialogHeader>
                      
                      <div className="space-y-4 py-4">
                        <div className="flex items-center justify-center w-full">
                          <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-muted/30 hover:bg-muted/50 transition-colors">
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                              <FileJson className="w-10 h-10 mb-3 text-muted-foreground" />
                              <p className="mb-2 text-sm text-muted-foreground">
                                <span className="font-semibold">Click to upload</span> or drag and drop
                              </p>
                              <p className="text-xs text-muted-foreground">JSON files only</p>
                            </div>
                            <input 
                              ref={fileInputRef}
                              id="dropzone-file" 
                              type="file" 
                              accept=".json" 
                              className="hidden" 
                              onChange={handleFileChange}
                            />
                          </label>
                        </div>
                        
                        {importFile && (
                          <div className="p-3 bg-muted rounded-md flex items-center justify-between">
                            <div className="flex items-center">
                              <FileJson className="h-5 w-5 mr-2 text-brand-primary" />
                              <span className="text-sm font-medium truncate max-w-[200px]">
                                {importFile.name}
                              </span>
                            </div>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => {
                                setImportFile(null);
                                if (fileInputRef.current) {
                                  fileInputRef.current.value = "";
                                }
                              }}
                            >
                              <RotateCcw className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                      
                      <DialogFooter>
                        <Button variant="outline" type="button" className="w-full sm:w-auto" onClick={() => setImportFile(null)}>
                          Cancel
                        </Button>
                        <Button 
                          type="button" 
                          className="w-full sm:w-auto" 
                          disabled={!importFile || isImporting}
                          onClick={handleImportData}
                        >
                          {isImporting ? "Importing..." : "Import"}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Account;
