
import React, { useState } from 'react';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Scale, Plus } from 'lucide-react';

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
      toast({
        title: "Error",
        description: "Please enter a weight value",
        variant: "destructive"
      });
      return;
    }

    const weight = parseFloat(newWeight);

    if (isNaN(weight) || weight <= 0) {
      toast({
        title: "Error",
        description: "Please enter a valid weight value",
        variant: "destructive"
      });
      return;
    }
    if (weight < 1 || weight > 500) {
      toast({
        title: "Error",
        description: "Weight must be between 1 and 500",
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
      if (isNaN(weight) || weight <= 0) {
        toast({
          title: "Error",
          description: "Please enter a valid weight value",
          variant: "destructive"
        });
        return;
      }
      
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in to add weight entries",
          variant: "destructive"
        });
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
      setEntryDate(new Date().toISOString().split('T')[0]);
      setEntryTime(new Date().toLocaleTimeString('en-US', { hour12: false }).slice(0, 5));
      toast({
        title: "Success",
        description: "Weight entry added successfully!",
        variant: "default"
      });
      onEntryAdded();
      
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
