
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Calendar, ClipboardList } from "lucide-react";
import { useUserPreferences } from "@/hooks/use-user-preferences";
import { convertWeight } from "@/utils/unitConversion";

interface WeightEntry {
  id: string;
  weight: number;
  unit: string;
  date: string;
  time: string;
  description?: string;
}

interface RecentEntriesProps {
  entries: WeightEntry[];
}

const RecentEntries: React.FC<RecentEntriesProps> = ({ entries }) => {
  const { preferredUnit, timezone } = useUserPreferences();
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      timeZone: timezone || 'UTC'
    });
  };

  const formatTime = (timeString: string) => {
    // Parse time string like "12:30:00" to a Date object
    const [hours, minutes] = timeString.split(':').map(Number);
    
    const date = new Date();
    date.setHours(hours);
    date.setMinutes(minutes);
    
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      timeZone: timezone || 'UTC'
    });
  };
  
  // Convert weight to preferred unit for display
  const displayWeight = (weight: number, originalUnit: string) => {
    return convertWeight(weight, originalUnit, preferredUnit);
  };

  return (
    <Card className="bg-white shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center">
          <ClipboardList className="h-5 w-5 mr-2" />
          Recent Weight Entries
        </CardTitle>
      </CardHeader>
      <CardContent>
        {entries.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No weight entries yet. Add your first weight entry above.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Weight</TableHead>
                  <TableHead>Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {entries.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell>
                      <div className="flex items-start gap-2">
                        <Calendar className="h-4 w-4 mt-0.5 text-muted-foreground" />
                        <div>
                          <div>{formatDate(entry.date)}</div>
                          <div className="text-xs text-muted-foreground">{formatTime(entry.time)}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      {displayWeight(entry.weight, entry.unit)} {preferredUnit}
                    </TableCell>
                    <TableCell>
                      <div className="max-w-xs truncate">
                        {entry.description || <span className="text-muted-foreground text-sm">No notes</span>}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentEntries;
