
import React from "react";
import { Card, CardContent } from "@/components/ui/card";

export const LoadingSpinner: React.FC = () => {
  return (
    <Card>
      <CardContent className="flex items-center justify-center p-6">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </CardContent>
    </Card>
  );
};
