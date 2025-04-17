
import React from "react";
import DataManagementCard from "./DataManagementCard";

interface AccountDataManagementProps {
  userId: string | null;
  setIsLoading: (loading: boolean) => void;
}

const AccountDataManagement: React.FC<AccountDataManagementProps> = ({ userId, setIsLoading }) => {
  return (
    <div className="space-y-6">
      <DataManagementCard userId={userId} setIsLoading={setIsLoading} />
    </div>
  );
};

export default AccountDataManagement;
