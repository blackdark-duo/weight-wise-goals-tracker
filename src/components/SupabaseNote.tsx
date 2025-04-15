
import React from 'react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Terminal } from 'lucide-react';

const SupabaseNote = () => {
  return (
    <Alert>
      <Terminal className="h-4 w-4" />
      <AlertDescription>
        Authentication is fully implemented with Supabase. Use real credentials to sign up/in or try the admin account.
      </AlertDescription>
    </Alert>
  );
};

export default SupabaseNote;
