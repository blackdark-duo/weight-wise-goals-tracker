
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Scale, Globe, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

// Timezone groups
const TIMEZONE_GROUPS = {
  "Asia": [
    { value: "Asia/Kolkata", label: "India (UTC+5:30)" },
    { value: "Asia/Tokyo", label: "Japan (UTC+9:00)" },
    { value: "Asia/Dubai", label: "UAE (UTC+4:00)" },
    { value: "Asia/Singapore", label: "Singapore (UTC+8:00)" },
    { value: "Asia/Shanghai", label: "China (UTC+8:00)" },
  ],
  "America": [
    { value: "America/New_York", label: "Eastern (UTC-5:00)" },
    { value: "America/Chicago", label: "Central (UTC-6:00)" },
    { value: "America/Denver", label: "Mountain (UTC-7:00)" },
    { value: "America/Los_Angeles", label: "Pacific (UTC-8:00)" },
    { value: "America/Sao_Paulo", label: "Brazil (UTC-3:00)" },
  ],
  "Europe": [
    { value: "Europe/London", label: "UK (UTC+0:00)" },
    { value: "Europe/Paris", label: "Central Europe (UTC+1:00)" },
    { value: "Europe/Moscow", label: "Russia (UTC+3:00)" },
    { value: "Europe/Berlin", label: "Germany (UTC+1:00)" },
    { value: "Europe/Rome", label: "Italy (UTC+1:00)" },
  ],
  "Oceania": [
    { value: "Australia/Sydney", label: "Eastern Australia (UTC+10:00)" },
    { value: "Pacific/Auckland", label: "New Zealand (UTC+12:00)" },
    { value: "Australia/Perth", label: "Western Australia (UTC+8:00)" },
  ],
  "Africa": [
    { value: "Africa/Cairo", label: "Egypt (UTC+2:00)" },
    { value: "Africa/Johannesburg", label: "South Africa (UTC+2:00)" },
    { value: "Africa/Lagos", label: "Nigeria (UTC+1:00)" },
  ],
  "Other": [
    { value: "UTC", label: "Coordinated Universal Time (UTC)" },
  ]
};

interface PreferencesFormProps {
  setIsLoading: (loading: boolean) => void;
}

const PreferencesForm = ({ setIsLoading }: PreferencesFormProps) => {
  const [selectedUnit, setSelectedUnit] = useState("kg");
  const [selectedTimezone, setSelectedTimezone] = useState("UTC");
  const { toast } = useToast();

  // Fetch user preferences on component mount
  React.useEffect(() => {
    const fetchPreferences = async () => {
      setIsLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          return;
        }
        
        const { data, error } = await supabase
          .from("profiles")
          .select("preferred_unit, timezone")
          .eq("id", user.id)
          .single();
          
        if (error) {
          console.error("Error fetching preferences:", error);
          return;
        }
        
        if (data) {
          setSelectedUnit(data.preferred_unit || "kg");
          setSelectedTimezone(data.timezone || "UTC");
        }
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchPreferences();
  }, [setIsLoading]);

  const handleUpdatePreferences = async () => {
    setIsLoading(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Authentication error",
          description: "You must be logged in to update preferences",
          variant: "destructive",
        });
        return;
      }
      
      const { error } = await supabase
        .from("profiles")
        .update({
          preferred_unit: selectedUnit,
          timezone: selectedTimezone,
          updated_at: new Date().toISOString()
        })
        .eq("id", user.id);
      
      if (error) throw error;
      
      toast({
        title: "Preferences updated",
        description: "Your preferences have been saved successfully",
      });
      
      // Update localStorage
      localStorage.setItem("preferredUnit", selectedUnit);
      
      // Dispatch storage event for other components
      window.dispatchEvent(new StorageEvent("storage", {
        key: "preferredUnit",
        newValue: selectedUnit
      }));
    } catch (error: any) {
      console.error("Error updating preferences:", error);
      toast({
        title: "Update failed",
        description: error.message || "Failed to update preferences",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="border border-brand-primary/10 bg-gradient-to-r from-white to-blue-50 shadow-md transition-all hover:shadow-lg">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-2">
          <Scale className="h-5 w-5 text-brand-primary" />
          <CardTitle>User Preferences</CardTitle>
        </div>
        <CardDescription>
          Customize your weight tracking experience
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="preferred-unit" className="flex items-center gap-2">
              <Scale className="h-4 w-4 text-brand-primary" />
              Preferred Weight Unit
            </Label>
            <Select value={selectedUnit} onValueChange={setSelectedUnit}>
              <SelectTrigger id="preferred-unit" className="border-brand-primary/20 focus-visible:ring-brand-primary/30">
                <SelectValue placeholder="Select unit" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="kg">Kilograms (kg)</SelectItem>
                <SelectItem value="lbs">Pounds (lbs)</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              This will be used as the default unit for weight entries and goals
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="timezone" className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-blue-500" />
              Timezone
            </Label>
            <Select value={selectedTimezone} onValueChange={setSelectedTimezone}>
              <SelectTrigger id="timezone" className="border-brand-primary/20 focus-visible:ring-brand-primary/30">
                <SelectValue placeholder="Select timezone" />
              </SelectTrigger>
              <SelectContent className="max-h-[300px]">
                {Object.entries(TIMEZONE_GROUPS).map(([groupName, timezones]) => (
                  <SelectGroup key={groupName}>
                    <SelectLabel>{groupName}</SelectLabel>
                    {timezones.map((tz) => (
                      <SelectItem key={tz.value} value={tz.value}>
                        {tz.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Used for displaying dates and times correctly
            </p>
          </div>
        </div>
        
        <Button 
          onClick={handleUpdatePreferences} 
          className="mt-6 w-full md:w-auto bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 transition-all"
        >
          <Save className="mr-2 h-4 w-4" />
          Save Preferences
        </Button>
      </CardContent>
    </Card>
  );
};

export default PreferencesForm;
