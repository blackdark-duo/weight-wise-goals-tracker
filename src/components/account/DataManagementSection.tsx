
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Database, Download, ArrowDownToLine, DownloadCloud, Trash } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface DataManagementSectionProps {
  userId: string | null;
  setIsLoading: (loading: boolean) => void;
}

const DataManagementSection: React.FC<DataManagementSectionProps> = ({ userId, setIsLoading }) => {
  const [isExporting, setIsExporting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleExportData = async () => {
    if (!userId) {
      toast.error("You must be logged in to export data");
      return;
    }

    setIsExporting(true);
    setIsLoading(true);
    
    try {
      // Get weight entries
      const { data: weightEntries, error: weightError } = await supabase
        .from("weight_entries")
        .select("*")
        .eq("user_id", userId);
        
      if (weightError) throw weightError;
      
      // Get goals
      const { data: goals, error: goalsError } = await supabase
        .from("goals")
        .select("*")
        .eq("user_id", userId);
        
      if (goalsError) throw goalsError;
      
      // Combine data
      const exportData = {
        weightEntries: weightEntries || [],
        goals: goals || [],
        exportDate: new Date().toISOString()
      };
      
      // Create download
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportData, null, 2));
      const downloadAnchorNode = document.createElement('a');
      downloadAnchorNode.setAttribute("href", dataStr);
      downloadAnchorNode.setAttribute("download", "weight-tracker-data.json");
      document.body.appendChild(downloadAnchorNode);
      downloadAnchorNode.click();
      downloadAnchorNode.remove();
      
      toast.success("Data exported successfully!");
    } catch (error: any) {
      console.error("Error exporting data:", error);
      toast.error("Failed to export data. Please try again.");
    } finally {
      setIsExporting(false);
      setIsLoading(false);
    }
  };

  const handleDeleteAllData = async () => {
    if (!userId) {
      toast.error("You must be logged in to delete data");
      return;
    }

    setIsDeleting(true);
    setIsLoading(true);
    
    try {
      // Delete weight entries
      const { error: weightError } = await supabase
        .from("weight_entries")
        .delete()
        .eq("user_id", userId);
        
      if (weightError) throw weightError;
      
      // Delete goals
      const { error: goalsError } = await supabase
        .from("goals")
        .delete()
        .eq("user_id", userId);
        
      if (goalsError) throw goalsError;
      
      toast.success("All data has been deleted successfully!");
    } catch (error: any) {
      console.error("Error deleting data:", error);
      toast.error("Failed to delete data. Please try again.");
    } finally {
      setIsDeleting(false);
      setIsLoading(false);
    }
  };

  return (
    <Card className="border border-teal-500/10 bg-gradient-to-r from-white to-teal-50/30 shadow-md">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-2">
          <Database className="h-5 w-5 text-teal-500" />
          <CardTitle>Data Management</CardTitle>
        </div>
        <CardDescription>
          Export or delete your weight tracking data
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="rounded-md border border-teal-200/50 p-4 bg-teal-50/50">
          <div className="space-y-2">
            <h3 className="font-medium flex items-center gap-2">
              <Download className="h-4 w-4 text-teal-500" />
              Export Your Data
            </h3>
            <p className="text-sm text-muted-foreground">
              Download all your weight entries and goals as a JSON file. This file can be used for backup purposes or data analysis.
            </p>
          </div>
          <Button 
            onClick={handleExportData} 
            variant="outline" 
            className="mt-4 border-teal-200 text-teal-700 hover:bg-teal-50 hover:text-teal-800"
            disabled={isExporting}
          >
            {isExporting ? (
              <>
                <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></span>
                Exporting...
              </>
            ) : (
              <>
                <ArrowDownToLine className="mr-2 h-4 w-4" />
                Export Data
              </>
            )}
          </Button>
        </div>
        
        <div className="rounded-md border border-destructive/20 p-4 bg-destructive/5">
          <div className="space-y-2">
            <h3 className="font-medium flex items-center gap-2 text-destructive">
              <Trash className="h-4 w-4" />
              Delete All Data
            </h3>
            <p className="text-sm text-muted-foreground">
              Permanently delete all your weight entries and goals. This action cannot be undone.
            </p>
          </div>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button 
                variant="outline" 
                className="mt-4 border-destructive/30 text-destructive hover:bg-destructive/10"
              >
                <Trash className="mr-2 h-4 w-4" />
                Delete All Data
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete all your weight entries and goals from our servers.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteAllData}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  disabled={isDeleting}
                >
                  {isDeleting ? "Deleting..." : "Yes, delete all my data"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardContent>
    </Card>
  );
};

export default DataManagementSection;
