
import React from "react";
import DataManagementCard from "./DataManagementCard";

interface AccountDataManagementProps {
  userId: string | null;
  setIsLoading: (loading: boolean) => void;
}

const AccountDataManagement: React.FC<AccountDataManagementProps> = ({ userId, setIsLoading }) => {
  return <DataManagementCard userId={userId} setIsLoading={setIsLoading} />;
};

export default AccountDataManagement;
