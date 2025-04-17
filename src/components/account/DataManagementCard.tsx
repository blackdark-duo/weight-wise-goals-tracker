
import React, { useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { convertToCSV, parseCSV } from "@/utils/csvHelpers";
import { Download, Upload, FileText, HelpCircle, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToasts } from "../ui/toast-notification";

interface DataManagementCardProps {
  userId: string | null;
  setIsLoading: (loading: boolean) => void;
}

const DataManagementCard = ({ userId, setIsLoading }: DataManagementCardProps) => {
  const [isExporting, setIsExporting] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { addToast } = useToasts();

  const handleExportData = async () => {
    try {
      setIsExporting(true);
      setIsLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        addToast({
          title: "Authentication required",
          message: "You must be logged in to export data",
          variant: "error"
        });
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
        'date', 'weight', 'unit', 'time', 'description'
      ], 'weight_entries');
      
      const goalsCSV = convertToCSV(goals || [], [
        'target_weight', 'start_weight', 'unit', 'target_date', 'achieved'
      ], 'goals');
      
      // Combine both CSVs with section headers
      const combinedCSV = `# WeightWise Export\n# Date: ${new Date().toISOString()}\n\n` +
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
      
      addToast({
        title: "Export successful",
        message: "Your data has been exported as a CSV file",
        variant: "success"
      });
    } catch (error: any) {
      console.error("Error exporting data:", error);
      addToast({
        title: "Export failed",
        message: error.message || "Failed to export data",
        variant: "error"
      });
    } finally {
      setIsExporting(false);
      setIsLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setImportFile(e.target.files[0]);
    }
  };

  const handleImportData = async () => {
    if (!importFile) {
      addToast({
        title: "No file selected",
        message: "Please select a file to import",
        variant: "warning"
      });
      return;
    }
    
    if (!importFile.name.endsWith('.csv')) {
      addToast({
        title: "Invalid file type",
        message: "Please select a CSV file",
        variant: "error"
      });
      return;
    }
    
    try {
      setIsImporting(true);
      setIsLoading(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        addToast({
          title: "Authentication required",
          message: "You must be logged in to import data",
          variant: "error"
        });
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
      
      addToast({
        title: "Import successful",
        message: `Imported ${weightEntries.length} weight entries and ${importData.goals?.length || 0} goals`,
        variant: "success"
      });
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      setImportFile(null);
      
    } catch (error: any) {
      console.error("Error importing data:", error);
      addToast({
        title: "Import failed",
        message: error.message || "Failed to import data",
        variant: "error"
      });
    } finally {
      setIsImporting(false);
      setIsLoading(false);
    }
  };

  return (
    <Card className="border border-brand-primary/10 bg-gradient-to-r from-white to-teal-50 shadow-md">
      <CardHeader className="pb-4">
        <CardTitle>Data Management</CardTitle>
        <CardDescription>
          Export or import your weight tracking data
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="space-y-2 p-4 border rounded-md border-teal-200 bg-teal-50/50">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-medium flex items-center gap-2">
                <Download className="h-4 w-4 text-teal-600" />
                Export Data
              </h3>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-muted-foreground">
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
              className="w-full bg-gradient-to-r from-teal-500 to-green-500 hover:from-teal-600 hover:to-green-600"
            >
              {isExporting ? "Exporting..." : "Export CSV Data"}
              <Download className="ml-2 h-4 w-4" />
            </Button>
          </div>
          
          <div className="space-y-2 p-4 border rounded-md border-indigo-200 bg-indigo-50/50">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-medium flex items-center gap-2">
                <Upload className="h-4 w-4 text-indigo-600" />
                Import Data
              </h3>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-muted-foreground">
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
                <Button className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600">
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
                    <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-muted/30 hover:bg-muted/50 border-brand-primary/20 hover:border-brand-primary/40 transition-colors">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <FileText className="w-10 h-10 mb-3 text-brand-primary/60" />
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
                    <div className="p-3 bg-muted/30 rounded-md flex items-center justify-between border border-brand-primary/10">
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
                        <X className="h-4 w-4" />
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
                    className="w-full sm:w-auto bg-gradient-to-r from-indigo-500 to-purple-500" 
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
  );
};

export default DataManagementCard;
