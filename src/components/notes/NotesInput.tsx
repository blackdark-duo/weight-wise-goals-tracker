
import React, { useState, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { AlertCircle } from "lucide-react";

interface NotesInputProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  id?: string;
  rows?: number;
  className?: string;
  required?: boolean;
  maxLength?: number;
  disabled?: boolean;
}

const NotesInput: React.FC<NotesInputProps> = ({
  value,
  onChange,
  label = "Notes",
  placeholder = "Enter your notes here...",
  id = "notes",
  rows = 4,
  className = "",
  required = false,
  maxLength = 1000,
  disabled = false
}) => {
  const [error, setError] = useState<string | null>(null);
  const [charactersLeft, setCharactersLeft] = useState(maxLength - (value?.length || 0));
  const isApproachingLimit = charactersLeft <= maxLength * 0.1; // Within 10% of limit

  useEffect(() => {
    const length = value?.length || 0;
    setCharactersLeft(maxLength - length);
    
    if (length > maxLength) {
      setError(`Notes are limited to ${maxLength} characters`);
    } else {
      setError(null);
    }
  }, [value, maxLength]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    const length = newValue.length;
    
    onChange(newValue);
    
    setCharactersLeft(maxLength - length);
    if (length > maxLength) {
      setError(`Notes are limited to ${maxLength} characters`);
    } else {
      setError(null);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between">
        <Label htmlFor={id} className="text-base font-medium">
          {label} {required && <span className="text-destructive">*</span>}
        </Label>
        <span className={`text-xs ${isApproachingLimit ? (charactersLeft < 0 ? 'text-destructive' : 'text-amber-500') : 'text-muted-foreground'}`}>
          {charactersLeft} characters left
        </span>
      </div>
      
      <Textarea
        id={id}
        value={value}
        onChange={handleInputChange}
        placeholder={placeholder}
        rows={rows}
        className={`${className} ${error ? 'border-destructive' : ''}`}
        disabled={disabled}
      />
      
      {error && (
        <div className="flex items-center text-destructive text-sm mt-1">
          <AlertCircle className="h-4 w-4 mr-1" />
          {error}
        </div>
      )}
    </div>
  );
};

export default NotesInput;
