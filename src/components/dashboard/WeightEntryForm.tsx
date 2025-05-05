import React, { useState } from 'react';
import { toast } from "sonner";
import AIInsightsView from "./AIInsightsView";
import { fetchInsightsData } from "@/services/insightsService";

interface AIInsightsProps {
  userId: string | null;
}

const AIInsights: React.FC<AIInsightsProps> = ({ userId }) => {
  const [insights, setInsights] = useState<string | null>(null);
  // REMOVED: const [rawResponse, setRawResponse] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchInsights = async () => {
    if (!userId) {
      toast.error("Please sign in to fetch insights");
      setError("Authentication required. Please sign in to use AI insights.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // CHANGED: fetchInsightsData now returns a string, not an object
      const formattedInsights = await fetchInsightsData(userId);

      if (!formattedInsights || formattedInsights.trim() === "") {
        throw new Error("The AI service returned an empty response. Please try again later.");
      }

      setInsights(formattedInsights);
      // REMOVED: setRawResponse(rawResponse);
      toast.success("AI insights updated successfully!");
    } catch (err: any) {
      console.error("Error fetching AI insights:", err);

      // Retain advanced error handling from current file
      let errorMessage = "Failed to fetch AI insights. Please try again later.";

      if (err.message?.includes("fetch")) {
        errorMessage = "Couldn't connect to the AI service. Please check your network connection and try again.";
      } else if (err.message?.includes("Webhook returned 5")) {
        errorMessage = "The AI service is currently unavailable. Our team has been notified.";
      } else if (err.message?.includes("Webhook returned 4")) {
        errorMessage = "Unable to process your request. Please try again in a few moments.";
      } else if (err.message?.includes("Supabase") || err.message?.includes("profiles")) {
        errorMessage = "There was an issue accessing your profile data. Please try again later.";
      } else if (err.message?.includes("daily limit")) {
        errorMessage = err.message;
      }

      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AIInsightsView
      insights={insights}
      // REMOVED: rawResponse={rawResponse}
      loading={loading}
      error={error}
      onAnalyzeClick={fetchInsights}
    />
  );
};

export default AIInsights;
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Scale, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface WeightEntryFormProps {
  onEntryAdded: () => void;
  preferredUnit: string;
}

const WeightEntryForm: React.FC<WeightEntryFormProps> = ({ onEntryAdded, preferredUnit }) => {
  const [newWeight, setNewWeight] = useState("");
  const [weightUnit, setWeightUnit] = useState(preferredUnit);
  const [entryDate, setEntryDate] = useState(new Date().toISOString().split('T')[0]);
  const [entryTime, setEntryTime] = useState(new Date().toLocaleTimeString('en-US', { hour12: false }).slice(0, 5));
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddWeight = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newWeight) {
      toast.error("Please enter a weight value");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const weight = parseFloat(newWeight);
      
      if (isNaN(weight) || weight <= 0) {
        toast.error("Please enter a valid weight value");
        return;
      }
      
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("You must be logged in to add weight entries");
        return;
      }
      
      const { error } = await supabase
        .from("weight_entries")
        .insert({
          user_id: user.id,
          weight,
          unit: weightUnit,
          date: entryDate,
          time: entryTime,
          description: description.trim() || null
        });
        
      if (error) throw error;
      
      setNewWeight("");
      setDescription("");
      
      toast.success("Weight entry added successfully!");
      onEntryAdded();
      
    } catch (err: any) {
      console.error("Error adding weight entry:", err);
      toast.error(err.message || "Failed to add weight entry");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="overflow-hidden">
      <div className="h-1 bg-gradient-to-r from-brand-primary to-purple-500"></div>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Scale className="h-5 w-5 text-brand-primary" />
          Add Weight Entry
        </CardTitle>
        <CardDescription>
          Record your current weight to track your progress
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleAddWeight} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <Label htmlFor="weight">Weight*</Label>
              <div className="flex">
                <Input
                  id="weight"
                  type="number"
                  step="any"
                  min="0"
                  placeholder="Enter weight"
                  value={newWeight}
                  onChange={(e) => setNewWeight(e.target.value)}
                  required
                  className="rounded-r-none"
                />
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => setWeightUnit(weightUnit === "kg" ? "lbs" : "kg")}
                  className="rounded-l-none border-l-0"
                >
                  {weightUnit}
                </Button>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={entryDate}
                onChange={(e) => setEntryDate(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="time">Time</Label>
              <Input
                id="time"
                type="time"
                value={entryTime}
                onChange={(e) => setEntryTime(e.target.value)}
              />
            </div>
            
            <div className="flex items-end">
              <div className="w-full">
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-brand-primary to-purple-500 hover:from-brand-primary/90 hover:to-purple-500/90"
                >
                  {isSubmitting ? "Adding..." : "Add Entry"}
                  <Plus className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Notes (Diet Related)</Label>
            <Textarea
              id="description"
              placeholder="Add any notes about this weight entry..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
            />
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default WeightEntryForm;

