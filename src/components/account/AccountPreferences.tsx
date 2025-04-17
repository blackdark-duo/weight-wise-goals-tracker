
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Globe, Scale, Save, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useUserPreferences } from "@/hooks/use-user-preferences";

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

interface AccountPreferencesProps {
  userId: string | null;
  preferredUnit: string;
  setIsLoading: (loading: boolean) => void;
}

const AccountPreferences: React.FC<AccountPreferencesProps> = ({ userId, preferredUnit, setIsLoading }) => {
  const [selectedUnit, setSelectedUnit] = useState<string>(preferredUnit || 'kg');
  const [selectedTimezone, setSelectedTimezone] = useState<string>("UTC");
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const { updatePreferences } = useUserPreferences();

  // Get browser's timezone as default
  useEffect(() => {
    const browserTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    setSelectedTimezone(browserTimezone || "UTC");
    
    const fetchUserPreferences = async () => {
      if (!userId) return;
      
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("preferred_unit, timezone")
          .eq("id", userId)
          .maybeSingle();
          
        if (error) throw error;
        
        if (data) {
          setSelectedUnit(data.preferred_unit || preferredUnit || 'kg');
          setSelectedTimezone(data.timezone || browserTimezone || "UTC");
        }
      } catch (error) {
        console.error("Error fetching preferences:", error);
      }
    };
    
    fetchUserPreferences();
  }, [userId, preferredUnit]);

  // Track changes
  useEffect(() => {
    if (preferredUnit !== selectedUnit) {
      setHasChanges(true);
    } else {
      setHasChanges(false);
    }
  }, [selectedUnit, preferredUnit]);

  const handleSavePreferences = async () => {
    if (!userId) {
      toast.error("You must be logged in to update preferences");
      return;
    }
    
    setIsSaving(true);
    setIsLoading(true);
    
    try {
      // Update profile in Supabase
      await updatePreferences({
        preferredUnit: selectedUnit,
        timezone: selectedTimezone
      });
      
      toast.success("Preferences updated successfully!", {
        icon: <Check className="h-4 w-4 text-green-500" />
      });
    } catch (error) {
      console.error("Error saving preferences:", error);
      toast.error("Failed to update preferences. Please try again.");
    } finally {
      setIsSaving(false);
      setIsLoading(false);
      setHasChanges(false);
    }
  };

  return (
    <Card className="overflow-hidden shadow-sm border border-brand-primary/5">
      <div className="h-1 bg-gradient-to-r from-blue-400 to-indigo-500"></div>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <Settings className="h-5 w-5 text-blue-500" />
          Application Preferences
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
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
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
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

export default AccountPreferences;
