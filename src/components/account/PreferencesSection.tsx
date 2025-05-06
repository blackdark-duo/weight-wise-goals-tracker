
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Globe, Scale, Save, Check, Settings as SettingsIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useUserPreferences } from "@/hooks/use-user-preferences";
import { timezoneOptions } from "@/utils/timezoneData";

interface PreferencesSectionProps {
  userId: string | null;
  preferredUnit: string;
  timezone: string;
  setIsLoading: (loading: boolean) => void;
  updateProfile: (data: any) => void;
}

const PreferencesSection: React.FC<PreferencesSectionProps> = ({ 
  userId, 
  preferredUnit, 
  timezone,
  setIsLoading, 
  updateProfile 
}) => {
  const [selectedUnit, setSelectedUnit] = useState<string>(preferredUnit || 'kg');
  const [selectedTimezone, setSelectedTimezone] = useState<string>(timezone || "UTC");
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const { updatePreferences } = useUserPreferences();

  // Track changes
  React.useEffect(() => {
    if (preferredUnit !== selectedUnit || timezone !== selectedTimezone) {
      setHasChanges(true);
    } else {
      setHasChanges(false);
    }
  }, [selectedUnit, preferredUnit, timezone, selectedTimezone]);

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
      
      // Update local state
      updateProfile({
        preferredUnit: selectedUnit,
        timezone: selectedTimezone
      });
      
      toast.success("Preferences updated successfully!", {
        icon: <Check className="h-4 w-4 text-green-500" />
      });
      setHasChanges(false);
    } catch (error: any) {
      console.error("Error saving preferences:", error);
      toast.error("Failed to update preferences. Please try again.");
    } finally {
      setIsSaving(false);
      setIsLoading(false);
    }
  };

  return (
    <Card className="overflow-hidden shadow-sm border border-[#ff7f50]/5">
      <div className="h-1 bg-[#ff7f50]"></div>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-xl">
          <SettingsIcon className="h-5 w-5 text-[#ff7f50]" />
          Application Preferences
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <Label htmlFor="preferredUnit" className="flex items-center gap-2 text-base">
              <Scale className="h-4 w-4 text-[#ff7f50]" />
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
              <Globe className="h-4 w-4 text-[#ff7f50]" />
              Timezone
            </Label>
            <Select value={selectedTimezone} onValueChange={setSelectedTimezone}>
              <SelectTrigger id="timezone" className="w-full">
                <SelectValue placeholder="Select timezone" />
              </SelectTrigger>
              <SelectContent className="max-h-[300px]">
                {timezoneOptions.map((tz) => (
                  <SelectItem key={tz.value} value={tz.value}>
                    {tz.label}
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
            className="bg-[#ff7f50] hover:bg-[#ff6347] text-white"
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

export default PreferencesSection;
