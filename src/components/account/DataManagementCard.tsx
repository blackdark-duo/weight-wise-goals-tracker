
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Database, Download, Upload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface DataManagementCardProps {
  userId: string | null;
  setIsLoading: (loading: boolean) => void;
}

const DataManagementCard = ({ userId, setIsLoading }: DataManagementCardProps) => {
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  const handleExportData = async () => {
    if (!userId) {
      toast.error("User not authenticated");
      return;
    }
    
    setIsExporting(true);
    setIsLoading(true);
    
    try {
      // Get weight entries
      const { data: weightData, error: weightError } = await supabase
        .from("weight_entries")
        .select("*")
        .eq("user_id", userId);
      
      if (weightError) throw weightError;
      
      // Get goals
      const { data: goalsData, error: goalsError } = await supabase
        .from("goals")
        .select("*")
        .eq("user_id", userId);
      
      if (goalsError) throw goalsError;
      
      // Combine data
      const exportData = {
        weight_entries: weightData || [],
        goals: goalsData || [],
        exported_at: new Date().toISOString(),
      };
      
      // Create and download file
      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: "application/json" });
      const url = URL.createObjectURL(dataBlob);
      
      const link = document.createElement("a");
      link.href = url;
      link.download = `weightwise_data_${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success("Data exported successfully");
    } catch (error: any) {
      console.error("Error exporting data:", error);
      toast.error(error.message || "Failed to export data");
    } finally {
      setIsExporting(false);
      setIsLoading(false);
    }
  };

  const handleImportData = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!userId) {
      toast.error("User not authenticated");
      return;
    }
    
    const file = event.target.files?.[0];
    if (!file) return;
    
    setIsImporting(true);
    setIsLoading(true);
    
    try {
      const fileReader = new FileReader();
      
      fileReader.onload = async (e) => {
        try {
          const result = e.target?.result;
          if (typeof result !== "string") throw new Error("Invalid file format");
          
          const importData = JSON.parse(result);
          
          if (!importData.weight_entries || !importData.goals) {
            throw new Error("Invalid data format");
          }
          
          // Import weight entries
          if (importData.weight_entries.length > 0) {
            const weightEntries = importData.weight_entries.map((entry: any) => ({
              ...entry,
              user_id: userId,
              id: undefined // Let Supabase generate new IDs
            }));
            
            const { error: weightError } = await supabase
              .from("weight_entries")
              .insert(weightEntries);
            
            if (weightError) throw weightError;
          }
          
          // Import goals
          if (importData.goals.length > 0) {
            const goals = importData.goals.map((goal: any) => ({
              ...goal,
              user_id: userId,
              id: undefined // Let Supabase generate new IDs
            }));
            
            const { error: goalsError } = await supabase
              .from("goals")
              .insert(goals);
            
            if (goalsError) throw goalsError;
          }
          
          toast.success("Data imported successfully");
        } catch (error: any) {
          console.error("Error processing import:", error);
          toast.error(error.message || "Failed to import data");
        } finally {
          setIsImporting(false);
          setIsLoading(false);
        }
      };
      
      fileReader.onerror = () => {
        toast.error("Failed to read file");
        setIsImporting(false);
        setIsLoading(false);
      };
      
      fileReader.readAsText(file);
    } catch (error: any) {
      console.error("Error importing data:", error);
      toast.error(error.message || "Failed to import data");
      setIsImporting(false);
      setIsLoading(false);
    }
    
    // Reset file input
    event.target.value = "";
  };

  return (
    <Card className="border border-teal-100 bg-gradient-to-r from-white to-teal-50/30 shadow-md">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center text-teal-700 gap-2">
          <Database className="h-5 w-5" />
          Data Management
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="rounded-md border border-teal-100 p-4">
          <h3 className="font-medium mb-2">Export Your Data</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Download all your weight entries, goals, and tracking history in JSON format.
          </p>
          
          <Button 
            variant="outline" 
            onClick={handleExportData}
            disabled={isExporting}
            className="border-teal-200 text-teal-700 hover:bg-teal-50"
          >
            {isExporting ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                Exporting...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Export Data
              </>
            )}
          </Button>
        </div>
        
        <div className="rounded-md border border-teal-100 p-4">
          <h3 className="font-medium mb-2">Import Data</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Upload previously exported data to restore your weight entries and goals.
          </p>
          
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => document.getElementById("import-file")?.click()}
              disabled={isImporting}
              className="border-teal-200 text-teal-700 hover:bg-teal-50"
            >
              {isImporting ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                  Importing...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Import Data
                </>
              )}
            </Button>
            <input
              id="import-file"
              type="file"
              accept=".json"
              className="hidden"
              onChange={handleImportData}
              disabled={isImporting}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DataManagementCard;
