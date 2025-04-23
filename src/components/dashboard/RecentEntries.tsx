
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { format } from "date-fns";

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
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Recent Entries</CardTitle>
          <CardDescription>Your latest weight measurements</CardDescription>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link to="/reports">
            <Calendar className="mr-2 h-4 w-4" />
            View All
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        {entries.length > 0 ? (
          <div className="space-y-1">
            {entries.slice(0, 5).map((entry) => (
              <div 
                key={entry.id}
                className="flex items-center justify-between border-b py-3 last:border-0 last:pb-0"
              >
                <div className="flex items-center">
                  <div>
                    <p className="text-sm font-medium">
                      {format(new Date(entry.date), "MMM dd, yyyy")}
                      <span className="text-xs text-muted-foreground ml-2">
                        {entry.time.slice(0, 5)}
                      </span>
                    </p>
                    {entry.description && (
                      <p className="text-xs text-muted-foreground mt-1 italic">
                        "{entry.description}"
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center">
                  <p className="mr-2 text-sm font-semibold">{entry.weight} {entry.unit}</p>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-32 text-center">
            <p className="text-muted-foreground">
              No weight entries yet. Add your first entry above.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentEntries;

