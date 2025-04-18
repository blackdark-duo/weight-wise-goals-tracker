
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Globe, Scale, Save, AlertCircle, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Define list of timezones for the dropdown
const TIMEZONES = [
  "UTC",
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "Europe/London",
  "Europe/Paris",
  "Europe/Berlin",
  "Asia/Tokyo",
  "Asia/Singapore",
  "Australia/Sydney",
  "Pacific/Auckland"
];

interface PreferencesFormProps {
  userId: string | null;
  preferredUnit: string;
  timezone: string;
  setIsLoading: (loading: boolean) => void;
  updateProfile: (data: { preferredUnit?: string, timezone?: string }) => void;
}

const PreferencesForm: React.FC<PreferencesFormProps> = ({ 
  userId, 
  preferredUnit, 
  timezone,
  setIsLoading,
  updateProfile
}) => {
  const [selectedUnit, setSelectedUnit] = useState<string>(preferredUnit);
  const [selectedTimezone, setSelectedTimezone] = useState<string>(timezone);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  // Track changes
  React.useEffect(() => {
    if (preferredUnit !== selectedUnit || timezone !== selectedTimezone) {
      setHasChanges(true);
    } else {
      setHasChanges(false);
    }
  }, [selectedUnit, selectedTimezone, preferredUnit, timezone]);

  const handleSavePreferences = async () => {
    if (!userId) {
      toast.error("You must be logged in to update preferences");
      return;
    }
    
    setIsSaving(true);
    setIsLoading(true);
    setError(null);
    
    try {
      // Update profile in Supabase
      const { error } = await supabase
        .from("profiles")
        .update({
          preferred_unit: selectedUnit,
          timezone: selectedTimezone,
          updated_at: new Date().toISOString()
        })
        .eq("id", userId);
        
      if (error) throw error;
      
      // Update localStorage for immediate use in the app
      localStorage.setItem("preferredUnit", selectedUnit);
      
      // Trigger a storage event to notify other components
      window.dispatchEvent(new StorageEvent("storage", {
        key: "preferredUnit",
        newValue: selectedUnit
      }));
      
      // Update the parent component state
      updateProfile({
        preferredUnit: selectedUnit,
        timezone: selectedTimezone
      });
      
      toast.success("Preferences updated successfully!", {
        icon: <Check className="h-4 w-4 text-green-500" />
      });
      setHasChanges(false);
    } catch (err: any) {
      console.error("Error saving preferences:", err);
      setError(err.message || "Failed to update preferences");
      toast.error("Failed to update preferences. Please try again.");
    } finally {
      setIsSaving(false);
      setIsLoading(false);
    }
  };

  return (
    <Card className="overflow-hidden shadow-sm border border-brand-primary/5">
      <div className="h-1 bg-gradient-to-r from-blue-400 to-indigo-500"></div>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-xl">
          <Scale className="h-5 w-5 text-blue-500" />
          Application Preferences
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {error && (
          <div className="flex items-center gap-2 rounded-md bg-destructive/15 p-3 text-sm text-destructive">
            <AlertCircle className="h-4 w-4" />
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <Label htmlFor="preferredUnit" className="flex items-center gap-2 text-base">
              <Scale className="h-4 w-4 text-brand-primary" />
              Weight Unit
            </Label>
            <Select value={selectedUnit} onValueChange={setSelectedUnit}>
              <SelectTrigger id="preferredUnit" className="w-full">
                <SelectValue placeholder="Select unit" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="kg">Kilograms (kg)</SelectItem>
                <SelectItem value="lbs">Pounds (lbs)</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              This will be used as the default unit for all weight entries and goals.
            </p>
          </div>
          
          <div className="space-y-3">
            <Label htmlFor="timezone" className="flex items-center gap-2 text-base">
              <Globe className="h-4 w-4 text-blue-500" />
              Timezone
            </Label>
            <Select value={selectedTimezone} onValueChange={setSelectedTimezone}>
              <SelectTrigger id="timezone" className="w-full">
                <SelectValue placeholder="Select timezone" />
              </SelectTrigger>
              <SelectContent>
                {TIMEZONES.map((tz) => (
                  <SelectItem key={tz} value={tz}>
                    {tz.replace("_", " ")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              This will be used for displaying dates and times across the application.
            </p>
          </div>
        </div>
        
        <div className="flex justify-end pt-4">
          <Button 
            onClick={handleSavePreferences} 
            disabled={isSaving || !hasChanges}
            className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white"
          >
            {isSaving ? (
              <>
                <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></span>
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Preferences
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PreferencesForm;
