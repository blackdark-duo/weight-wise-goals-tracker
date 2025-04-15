
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const SupabaseNote = () => {
  return (
    <Alert className="bg-blue-50 border-blue-200 text-blue-700 mb-6">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Supabase Integration Required</AlertTitle>
      <AlertDescription className="mt-2">
        <p>
          This app requires Supabase integration for the following features:
        </p>
        <ul className="list-disc list-inside mt-2 space-y-1">
          <li>Email-based authentication with OTP verification</li>
          <li>User data storage and management</li>
          <li>Account management functionality</li>
        </ul>
        <p className="mt-2">
          To enable these features, please connect your Lovable project to Supabase 
          by clicking the green Supabase button in the top right corner of the interface.
        </p>
      </AlertDescription>
    </Alert>
  );
};

export default SupabaseNote;
