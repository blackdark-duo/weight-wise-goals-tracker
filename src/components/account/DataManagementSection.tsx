
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Database, Download, Upload, FileCheck, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { convertToCSV, parseCSV, createCompleteCSV } from "@/utils/csvHelpers";

interface DataManagementSectionProps {
  userId: string | null;
  setIsLoading: (loading: boolean) => void;
}

const DataManagementSection: React.FC<DataManagementSectionProps> = ({ 
  userId, 
  setIsLoading 
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleExportData = async () => {
    if (!userId) {
      toast.error("Please sign in to export your data");
      return;
    }
    
    setIsExporting(true);
    setIsLoading(true);
    setError(null);
    
    try {
      // Fetch weight entries
      const { data: weightEntries, error: weightError } = await supabase
        .from("weight_entries")
        .select("*")
        .eq("user_id", userId)
        .order("date", { ascending: false });
        
      if (weightError) throw weightError;
      
      // Fetch goals
      const { data: goals, error: goalError } = await supabase
        .from("goals")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });
        
      if (goalError) throw goalError;
      
      // Create a combined CSV file with both data types
      const csvData = createCompleteCSV(weightEntries || [], goals || []);
      
      // Create a download link
      const blob = new Blob([csvData], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `cozyweight_export_${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success("Data exported successfully");
    } catch (err: any) {
      console.error("Error exporting data:", err);
      setError(err.message || "Failed to export data");
      toast.error("Failed to export data. Please try again.");
    } finally {
      setIsExporting(false);
      setIsLoading(false);
    }
  };

  const handleImportClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
      setError("Please upload a CSV file");
      toast.error("Invalid file format. Please upload a CSV file.");
      return;
    }
    
    const reader = new FileReader();
    reader.onload = handleFileRead;
    reader.readAsText(file);
  };

  const handleFileRead = async (event: ProgressEvent<FileReader>) => {
    if (!userId) {
      toast.error("Please sign in to import data");
      return;
    }
    
    setIsImporting(true);
    setIsLoading(true);
    setError(null);
    setProgress(0);
    
    try {
      const csvData = event.target?.result as string;
      if (!csvData) {
        throw new Error("Could not read file contents");
      }
      
      // Parse the CSV data
      const parsedData = parseCSV(csvData);
      
      if (parsedData.weightEntries.length === 0 && parsedData.goals.length === 0) {
        throw new Error("No valid data found in the CSV file");
      }
      
      // Import weight entries
      if (parsedData.weightEntries.length > 0) {
        setProgress(25);
        
        const weightEntriesToInsert = parsedData.weightEntries.map(entry => ({
          ...entry,
          user_id: userId,
        }));
        
        const { error: weightError } = await supabase
          .from("weight_entries")
          .insert(weightEntriesToInsert);
          
        if (weightError) throw weightError;
      }
      
      setProgress(50);
      
      // Import goals
      if (parsedData.goals.length > 0) {
        const goalsToInsert = parsedData.goals.map(goal => ({
          ...goal,
          user_id: userId,
        }));
        
        const { error: goalError } = await supabase
          .from("goals")
          .insert(goalsToInsert);
          
        if (goalError) throw goalError;
      }
      
      setProgress(100);
      toast.success("Data imported successfully");
      
      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
    } catch (err: any) {
      console.error("Error importing data:", err);
      setError(err.message || "Failed to import data");
      toast.error("Failed to import data. Please check the format and try again.");
    } finally {
      setIsImporting(false);
      setIsLoading(false);
    }
  };

  return (
    <Card className="overflow-hidden shadow-sm border border-[#ff7f50]/5">
      <div className="h-1 bg-[#ff7f50]"></div>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-xl">
          <Database className="h-5 w-5 text-[#ff7f50]" />
          Data Management
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <div className="space-y-2">
          <h3 className="text-lg font-medium">Export Your Data</h3>
          <p className="text-sm text-muted-foreground">
            Download all your weight entries and goals as a CSV file for backup or analysis.
          </p>
          <Button 
            variant="default" 
            onClick={handleExportData}
            disabled={isExporting || !userId}
            className="mt-2"
          >
            {isExporting ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                Exporting...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Export Data (CSV)
              </>
            )}
          </Button>
        </div>
        
        <div className="space-y-2">
          <h3 className="text-lg font-medium">Import Data</h3>
          <p className="text-sm text-muted-foreground">
            Import weight entries and goals from a CSV file. The file should be in the same format as the export file.
          </p>
          <input 
            ref={fileInputRef}
            type="file" 
            accept=".csv" 
            onChange={handleFileChange}
            className="hidden"
          />
          <Button 
            variant="outline" 
            onClick={handleImportClick}
            disabled={isImporting || !userId}
            className="mt-2"
          >
            {isImporting ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                Importing...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Import Data (CSV)
              </>
            )}
          </Button>
          
          {isImporting && (
            <div className="space-y-2 mt-4">
              <div className="flex justify-between text-sm">
                <span>Importing data...</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
              <p className="text-xs text-muted-foreground">
                {progress < 50 ? "Processing weight entries..." : "Processing goals..."}
              </p>
            </div>
          )}
          
          <div className="mt-4 rounded-md bg-amber-50 p-4 text-sm border border-amber-200">
            <div className="flex items-start">
              <FileCheck className="h-5 w-5 text-amber-600 mr-2 mt-0.5" />
              <div className="text-amber-800">
                <p className="font-medium mb-1">Import Format Requirements</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>The file must be in CSV format</li>
                  <li>It should have sections marked with # WEIGHT ENTRIES and # GOALS</li>
                  <li>Each section should have appropriate column headers</li>
                  <li>Date format should be YYYY-MM-DD</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DataManagementSection;
