
import React from "react";
import { Settings } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface AdminHeaderProps {
  error: string | null;
}

const AdminHeader: React.FC<AdminHeaderProps> = ({ error }) => {
  return (
    <>
      <h1 className="text-3xl font-bold mb-8 flex items-center">
        <Settings className="mr-2 h-8 w-8 text-[#ff7f50]" />
        Admin Dashboard
      </h1>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </>
  );
};

export default AdminHeader;
