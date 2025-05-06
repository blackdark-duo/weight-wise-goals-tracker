import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Save } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface NotesInputProps {
  userId: string | undefined;
  initialValue?: string;
  onSave?: (notes: string) => void;
  maxLength?: number;
}

const NotesInput = ({ 
  userId, 
  initialValue = "", 
  onSave,
  maxLength = 1000
}: NotesInputProps) => {
  const [notes, setNotes] = useState(initialValue);
  const [isSaving, setIsSaving] = useState(false);
  const [charCount, setCharCount] = useState(initialValue.length);
  
  useEffect(() => {
    setCharCount(notes.length);
  }, [notes]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (value.length <= maxLength) {
      setNotes(value);
    }
  };

  const handleSave = async () => {
    if (!userId) {
      toast.error("You must be logged in to save notes");
      return;
    }

    setIsSaving(true);
    
    try {
      // Here we would typically save to a database
      // For demo purposes, we're simulating a delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Call the onSave callback if provided
      if (onSave) {
        onSave(notes);
      }
      
      toast.success("Notes saved successfully");
    } catch (error) {
      console.error("Error saving notes:", error);
      toast.error("Failed to save notes. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const charactersRemaining = maxLength - charCount;
  const isNearLimit = charactersRemaining < maxLength * 0.1; // Within 10% of limit
  const isAtLimit = charactersRemaining === 0;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Notes (Diet Related)</h3>
        <Badge 
          variant={isAtLimit ? "destructive" : "secondary"}
          className={`${isAtLimit ? "bg-destructive" : isNearLimit ? "bg-yellow-500" : ""}`}
        >
          {charactersRemaining} characters remaining
        </Badge>
      </div>
      
      <Textarea
        placeholder="Enter your diet notes here..."
        value={notes}
        onChange={handleChange}
        rows={5}
        maxLength={maxLength}
        className="resize-none"
      />
      
      <Button 
        onClick={handleSave}
        disabled={isSaving || notes === initialValue}
        className="flex items-center gap-2"
      >
        <Save className="w-4 h-4" />
        {isSaving ? "Saving..." : "Save Notes"}
      </Button>
      
      <div className="text-xs text-muted-foreground">
        These notes are visible only to you and help track your dietary habits.
      </div>
    </div>
  );
};

export default NotesInput;
