import React, { useState } from 'react';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Scale, Plus, AlertTriangle } from 'lucide-react';
import { validateWeight, sanitizeText } from '@/utils/inputValidation';

interface WeightEntry {
  id: string;
  weight: number;
  unit: string;
  date: string;
  time: string;
  description?: string;
}

interface WeightEntryFormProps {
  onEntryAdded: (entry: WeightEntry) => void;
  preferredUnit: string;
}

const WeightEntryForm: React.FC<WeightEntryFormProps> = ({ onEntryAdded, preferredUnit }) => {
  const [newWeight, setNewWeight] = useState("");
  const [weightUnit, setWeightUnit] = useState(preferredUnit);
  const [entryDate, setEntryDate] = useState(new Date().toISOString().split('T')[0]);
  const [entryTime, setEntryTime] = useState(new Date().toLocaleTimeString('en-US', { hour12: false }).slice(0, 5));
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showReconfirmation, setShowReconfirmation] = useState(false);
  const [pendingEntry, setPendingEntry] = useState<any>(null);
  const [validationMessage, setValidationMessage] = useState("");

  // Function to fetch last 5 weight entries for validation
  const fetchLastFiveEntries = async (userId: string) => {
    const { data, error } = await supabase
      .from("weight_entries")
      .select("weight, unit")
      .eq("user_id", userId)
      .order("date", { ascending: false })
      .order("time", { ascending: false })
      .limit(5);
      
    if (error) {
      console.error("Error fetching last entries:", error);
      return [];
    }
    
    return data || [];
  };

  // Function to validate weight against last 5 entries
  const validateWeightAgainstHistory = async (newWeight: number, newUnit: string, userId: string) => {
    const lastEntries = await fetchLastFiveEntries(userId);
    
    if (lastEntries.length === 0) {
      // No historical data, allow entry
      return { isValid: true };
    }

    // Convert all weights to the same unit for comparison
    const convertToKg = (weight: number, unit: string) => {
      if (unit === "lbs") return weight * 0.453592;
      return weight; // Already in kg or other units treated as kg
    };

    const newWeightInKg = convertToKg(newWeight, newUnit);
    const lastWeightsInKg = lastEntries.map(entry => convertToKg(entry.weight, entry.unit));
    const average = lastWeightsInKg.reduce((sum, weight) => sum + weight, 0) / lastWeightsInKg.length;

    const percentageDifference = Math.abs((newWeightInKg - average) / average) * 100;

    if (percentageDifference > 25) {
      return { 
        isValid: false, 
        error: `Weight entry rejected. New weight (${newWeight} ${newUnit}) deviates by ${percentageDifference.toFixed(1)}% from your recent average. This seems unusually high. Please check your entry.`
      };
    } else if (percentageDifference > 10) {
      return { 
        isValid: true, 
        requiresConfirmation: true,
        message: `Weight entry deviates by ${percentageDifference.toFixed(1)}% from your recent average. Please confirm this is correct.`
      };
    }

    return { isValid: true };
  };

  const handleAddWeight = async (e: React.FormEvent, forceSubmit = false) => {
    e.preventDefault();
    
    if (!newWeight) {
      toast({
        title: "Error",
        description: "Please enter a weight value",
        variant: "destructive"
      });
      return;
    }

    const weight = parseFloat(newWeight);

    // Check for negative values
    if (weight < 0) {
      toast({
        title: "Error",
        description: "Weight cannot be negative",
        variant: "destructive"
      });
      return;
    }

    // Validate weight using security utility
    const weightValidation = validateWeight(weight, weightUnit);
    if (!weightValidation.isValid) {
      toast({
        title: "Error",
        description: weightValidation.error,
        variant: "destructive"
      });
      return;
    }
    
    // Prevent future date
    const today = new Date();
    const selectedDate = new Date(entryDate);
    if (selectedDate > today) {
      toast({
        title: "Error",
        description: "Date cannot be in the future",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in to add weight entries",
          variant: "destructive"
        });
        setIsSubmitting(false);
        return;
      }

      // Validate against historical data unless forced
      if (!forceSubmit) {
        const historyValidation = await validateWeightAgainstHistory(weight, weightUnit, user.id);
        
        if (!historyValidation.isValid) {
          toast({
            title: "Entry Rejected",
            description: historyValidation.error,
            variant: "destructive"
          });
          setIsSubmitting(false);
          return;
        }
        
        if (historyValidation.requiresConfirmation) {
          // Store pending entry and show confirmation dialog
          const entryData = {
            user_id: user.id,
            weight,
            unit: weightUnit,
            date: entryDate,
            time: entryTime,
            description: sanitizeText(description, 200) || null
          };
          setPendingEntry(entryData);
          setValidationMessage(historyValidation.message || "");
          setShowReconfirmation(true);
          setIsSubmitting(false);
          return;
        }
      }

      // Validate description length (200 character limit)
      if (description.length > 200) {
        toast({
          title: "Error",
          description: "Notes cannot exceed 200 characters",
          variant: "destructive"
        });
        setIsSubmitting(false);
        return;
      }

      // Sanitize description input
      const sanitizedDescription = sanitizeText(description, 200);
      
      const entryData = forceSubmit ? pendingEntry : {
        user_id: user.id,
        weight,
        unit: weightUnit,
        date: entryDate,
        time: entryTime,
        description: sanitizedDescription || null
      };
      
      const { data, error } = await supabase
        .from("weight_entries")
        .insert(entryData)
        .select()
        .single();
        
      if (error) throw error;
      
      // Reset form and state
      setNewWeight("");
      setDescription("");
      setEntryDate(new Date().toISOString().split('T')[0]);
      setEntryTime(new Date().toLocaleTimeString('en-US', { hour12: false }).slice(0, 5));
      setShowReconfirmation(false);
      setPendingEntry(null);
      setValidationMessage("");
      
      toast({
        title: "Success",
        description: "Weight entry added successfully!",
        variant: "default"
      });
      
      // Pass the new entry back to the parent component
      if (data) {
        onEntryAdded(data as WeightEntry);
      }
      
    } catch (err: any) {
      console.error("Error adding weight entry:", err);
      let message = "Failed to add weight entry";
      if (err?.message?.includes("network")) {
        message = "Network error. Please check your connection.";
      } else if (err?.message?.includes("duplicate")) {
        message = "Duplicate entry. You have already logged weight for this date/time.";
      } else if (err?.message) {
        message = err.message;
      }
      toast({
        title: "Error",
        description: message,
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmEntry = () => {
    handleAddWeight({ preventDefault: () => {} } as React.FormEvent, true);
  };

  const handleCancelEntry = () => {
    setShowReconfirmation(false);
    setPendingEntry(null);
  };

  return (
    <>
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
                    aria-busy={isSubmitting}
                    className="w-full bg-gradient-to-r from-brand-primary to-purple-500 hover:from-brand-primary/90 hover:to-purple-500/90"
                  >
                    {isSubmitting ? (
                      <><span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent inline-block align-middle"></span>Adding...</>
                    ) : (
                      <>Add Entry <Plus className="ml-2 h-4 w-4" /></>
                    )}
                  </Button>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Notes (Diet Related) - {description.length}/200</Label>
              <Textarea
                id="description"
                placeholder="Add any notes about this weight entry..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                maxLength={200}
                className={description.length > 200 ? "border-destructive" : ""}
              />
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Weight Entry Confirmation Dialog */}
      <AlertDialog open={showReconfirmation} onOpenChange={setShowReconfirmation}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-warning" />
              Confirm Weight Entry
            </AlertDialogTitle>
            <AlertDialogDescription>
              {validationMessage}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelEntry}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmEntry}
              className="bg-gradient-to-r from-brand-primary to-purple-500 hover:from-brand-primary/90 hover:to-purple-500/90"
            >
              Confirm Entry
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default WeightEntryForm;
