
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Scale, Globe, Save } from "lucide-react";
import { toast } from "sonner";

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

interface AccountPreferencesProps {
  preferredUnit: string;
  timezone: string;
  updatePreferences: (prefs: { preferredUnit?: string; timezone?: string }) => Promise<void>;
  setIsLoading: (loading: boolean) => void;
}

const AccountPreferences = ({ 
  preferredUnit, 
  timezone, 
  updatePreferences,
  setIsLoading
}: AccountPreferencesProps) => {
  const [selectedUnit, setSelectedUnit] = useState(preferredUnit);
  const [selectedTimezone, setSelectedTimezone] = useState(timezone);

  const handleUpdatePreferences = async () => {
    setIsLoading(true);
    
    try {
      await updatePreferences({
        preferredUnit: selectedUnit,
        timezone: selectedTimezone
      });
      
      toast.success("Preferences updated successfully");
    } catch (error: any) {
      console.error("Error updating preferences:", error);
      toast.error(error.message || "Failed to update preferences");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>User Preferences</CardTitle>
        <CardDescription>
          Customize your weight tracking experience
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="preferred-unit" className="flex items-center gap-2">
              <Scale className="h-4 w-4" />
              Preferred Weight Unit
            </Label>
            <Select value={selectedUnit} onValueChange={setSelectedUnit}>
              <SelectTrigger id="preferred-unit">
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
              <Globe className="h-4 w-4" />
              Timezone
            </Label>
            <Select value={selectedTimezone} onValueChange={setSelectedTimezone}>
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
            <p className="text-xs text-muted-foreground">
              Used for displaying dates and times correctly
            </p>
          </div>
        </div>
        
        <Button onClick={handleUpdatePreferences} className="mt-4 w-full md:w-auto">
          <Save className="mr-2 h-4 w-4" />
          Save Preferences
        </Button>
      </CardContent>
    </Card>
  );
};

export default AccountPreferences;
