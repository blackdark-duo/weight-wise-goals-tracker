
import React from "react";
import { NavigateFunction } from "react-router-dom";
import { AlertCircle } from "lucide-react";

interface AdminAuthGuardProps {
  isAdmin: boolean;
  navigate: NavigateFunction;
  children: React.ReactNode;
}

const AdminAuthGuard: React.FC<AdminAuthGuardProps> = ({ isAdmin, navigate, children }) => {
  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <AlertCircle className="h-16 w-16 text-destructive mb-4" />
        <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
        <p className="text-muted-foreground mb-6 text-center">
          You do not have permission to access this page.
        </p>
      </div>
    );
  }

  return <>{children}</>;
};

export default AdminAuthGuard;
