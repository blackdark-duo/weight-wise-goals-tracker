
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Navbar from "@/components/Navbar";
import AccountManagement from "@/components/AccountManagement";

const Account = () => {
  return (
    <div className="min-h-screen pb-16 md:pb-0 bg-ui-background">
      <Navbar />
      <div className="container py-10">
        <h1 className="text-2xl font-bold mb-6">Account Settings</h1>
        
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                Update your account settings and preferences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AccountManagement />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Account;
