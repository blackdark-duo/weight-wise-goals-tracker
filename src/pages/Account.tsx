
import { useState, useEffect } from "react";
import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import AccountManagement from "@/components/AccountManagement";
import { supabase } from "@/integrations/supabase/client";
import { Download, Upload, FileText, ExternalLink, HelpCircle, RotateCcw, X } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// Define grouped timezones with geography information
const TIMEZONES = {
  popular: [
    { value: "Asia/Kolkata", label: "India Standard Time (UTC+5:30) - New Delhi, Mumbai" },
    { value: "America/New_York", label: "Eastern Time (UTC-5:00) - New York, Washington DC" },
    { value: "Europe/London", label: "Greenwich Mean Time (UTC+0:00) - London, Dublin" },
  ],
  others: [
    { value: "UTC", label: "Coordinated Universal Time (UTC)" },
    { value: "Asia/Dubai", label: "Gulf Standard Time (UTC+4:00) - Dubai, Abu Dhabi" },
    { value: "Asia/Kabul", label: "Afghanistan Time (UTC+4:30) - Kabul" },
    { value: "Asia/Tehran", label: "Iran Standard Time (UTC+3:30) - Tehran" },
    { value: "Asia/Tokyo", label: "Japan Standard Time (UTC+9:00) - Tokyo, Osaka" },
    { value: "Asia/Singapore", label: "Singapore Time (UTC+8:00) - Singapore, Kuala Lumpur" },
    { value: "Australia/Sydney", label: "Australian Eastern Time (UTC+10:00) - Sydney, Melbourne" },
    { value: "Pacific/Auckland", label: "New Zealand Time (UTC+12:00) - Auckland, Wellington" },
    { value: "America/Chicago", label: "Central Time (UTC-6:00) - Chicago, Dallas" },
    { value: "America/Denver", label: "Mountain Time (UTC-7:00) - Denver, Phoenix" },
    { value: "America/Los_Angeles", label: "Pacific Time (UTC-8:00) - Los Angeles, Seattle" },
    { value: "Europe/Paris", label: "Central European Time (UTC+1:00) - Paris, Berlin, Rome" },
    { value: "Europe/Moscow", label: "Moscow Time (UTC+3:00) - Moscow, St. Petersburg" },
  ]
};

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
          updated_at: new Date().toISOString()
        })
        .eq("id", user.id);
        
      if (error) throw error;
      
      toast.success("Preferences updated successfully");
      
      // Update global app state (if applicable)
      // This will help ensure the unit preference is reflected immediately across the app
      window.localStorage.setItem("preferredUnit", preferredUnit);
      window.dispatchEvent(new Event("storage"));
    } catch (error: any) {
      console.error("Error updating preferences:", error);
      toast.error(error.message || "Failed to update preferences");
    }
  };

  // Function to export CSV
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
      
      // Convert to CSV
      const weightEntriesCSV = convertToCSV(weightEntries || [], [
        'date', 'weight', 'unit', 'time', 'dietary_notes'
      ], 'weight_entries');
      
      const goalsCSV = convertToCSV(goals || [], [
        'target_weight', 'start_weight', 'unit', 'target_date', 'achieved'
      ], 'goals');
      
      // Combine both CSVs with section headers
      const combinedCSV = `# Weight Tracker Export\n# Date: ${new Date().toISOString()}\n\n` +
                         `# WEIGHT ENTRIES\n${weightEntriesCSV}\n\n` +
                         `# GOALS\n${goalsCSV}`;
      
      // Create download link
      const blob = new Blob([combinedCSV], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement("a");
      a.href = url;
      a.download = `weightwise-export-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      
      // Cleanup
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 100);
      
      toast.success("Data exported successfully as CSV");
    } catch (error: any) {
      console.error("Error exporting data:", error);
      toast.error(error.message || "Failed to export data");
    } finally {
      setIsExporting(false);
    }
  };
  
  // Function to convert JSON to CSV
  const convertToCSV = (data: any[], fields: string[], type: string) => {
    // Create header row
    const header = fields.join(',');
    
    // Create data rows
    const rows = data.map(item => {
      return fields.map(field => {
        let value = item[field] || '';
        // If the value contains commas, quotes, or newlines, wrap it in quotes
        if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
          value = `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      }).join(',');
    });
    
    return [header, ...rows].join('\n');
  };

  // Function to parse CSV data
  const parseCSV = (csv: string) => {
    const result: { weightEntries: any[], goals: any[] } = {
      weightEntries: [],
      goals: []
    };
    
    let currentSection = '';
    const lines = csv.split('\n');
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Skip empty lines
      if (!line) continue;
      
      // Check for section headers
      if (line.startsWith('#')) {
        if (line.includes('WEIGHT ENTRIES')) {
          currentSection = 'weightEntries';
          continue;
        } else if (line.includes('GOALS')) {
          currentSection = 'goals';
          continue;
        } else {
          // Skip other comments
          continue;
        }
      }
      
      // Process data lines
      if (currentSection) {
        // First line after section header is the column names
        if (result[currentSection].length === 0) {
          // Store column names
          result[`${currentSection}Columns`] = line.split(',');
        } else {
          // Parse data row
          const values = line.split(',');
          
          if (values.length > 1) { // Make sure it's a valid data row
            const dataObject = {};
            result[`${currentSection}Columns`].forEach((column, index) => {
              dataObject[column] = values[index] || '';
            });
            result[currentSection].push(dataObject);
          }
        }
      }
    }
    
    return result;
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
    
    if (!importFile.name.endsWith('.csv')) {
      toast.error("Please select a CSV file");
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
      
      // Parse CSV
      const importData = parseCSV(fileContent);
      
      if (!importData.weightEntries || importData.weightEntries.length === 0) {
        throw new Error("No valid weight entries found in the CSV file");
      }
      
      // Add user_id to entries and prepare for import
      const weightEntries = importData.weightEntries.map(entry => ({
        ...entry,
        user_id: user.id,
        description: entry.dietary_notes || entry.description, // Handle both field names
      }));
      
      // Import weight entries
      if (weightEntries.length > 0) {
        const { error: entriesError } = await supabase
          .from("weight_entries")
          .insert(weightEntries);
          
        if (entriesError) throw entriesError;
      }
      
      // Import goals if they exist
      if (importData.goals && importData.goals.length > 0) {
        const goals = importData.goals.map(goal => ({
          ...goal,
          user_id: user.id,
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
                      <SelectItem value="" disabled>
                        Popular Timezones
                      </SelectItem>
                      {TIMEZONES.popular.map((tz) => (
                        <SelectItem key={tz.value} value={tz.value}>
                          {tz.label}
                        </SelectItem>
                      ))}
                      
                      <SelectItem value="" disabled>
                        Other Timezones
                      </SelectItem>
                      {TIMEZONES.others.map((tz) => (
                        <SelectItem key={tz.value} value={tz.value}>
                          {tz.label}
                        </SelectItem>
                      ))}
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
                          <p className="max-w-xs">Download all your weight entries and goals in CSV format</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    Download all your weight tracking data as a CSV file for backup or transferring to another device.
                  </p>
                  <Button 
                    onClick={handleExportData} 
                    disabled={isExporting}
                    className="w-full"
                  >
                    {isExporting ? "Exporting..." : "Export CSV Data"}
                    <FileText className="ml-2 h-4 w-4" />
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
                          <p className="max-w-xs">Import previously exported data in CSV format</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    Import previously exported weight tracking data from a CSV file.
                  </p>
                  
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button className="w-full">
                        Import CSV Data
                        <Upload className="ml-2 h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Import Weight Tracking Data</DialogTitle>
                        <DialogDescription>
                          Upload a previously exported CSV file to import your weight data. This will add the imported entries to your existing data.
                        </DialogDescription>
                      </DialogHeader>
                      
                      <div className="space-y-4 py-4">
                        <div className="flex items-center justify-center w-full">
                          <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-muted/30 hover:bg-muted/50 transition-colors">
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                              <FileText className="w-10 h-10 mb-3 text-muted-foreground" />
                              <p className="mb-2 text-sm text-muted-foreground">
                                <span className="font-semibold">Click to upload</span> or drag and drop
                              </p>
                              <p className="text-xs text-muted-foreground">CSV files only</p>
                            </div>
                            <input 
                              ref={fileInputRef}
                              id="dropzone-file" 
                              type="file" 
                              accept=".csv" 
                              className="hidden" 
                              onChange={handleFileChange}
                            />
                          </label>
                        </div>
                        
                        {importFile && (
                          <div className="p-3 bg-muted rounded-md flex items-center justify-between">
                            <div className="flex items-center">
                              <FileText className="h-5 w-5 mr-2 text-brand-primary" />
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
