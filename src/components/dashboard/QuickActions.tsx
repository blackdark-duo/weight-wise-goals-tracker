
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Target, BarChart3 } from "lucide-react";
import { Link } from "react-router-dom";

const QuickActions: React.FC = () => {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Goals</CardTitle>
          <CardDescription>Set and track your weight goals</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col">
            <p className="text-muted-foreground mb-4">
              Set weight goals to stay motivated and track your progress over time.
            </p>
            <Button asChild>
              <Link to="/goals">
                <Target className="mr-2 h-4 w-4" />
                Manage Goals
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Reports</CardTitle>
          <CardDescription>View detailed weight analytics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col">
            <p className="text-muted-foreground mb-4">
              Access comprehensive reports and insights about your weight journey.
            </p>
            <Button asChild>
              <Link to="/reports">
                <BarChart3 className="mr-2 h-4 w-4" />
                View Reports
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default QuickActions;

