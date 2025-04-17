
import React from "react";
import DangerZoneCard from "./DangerZoneCard";

interface AccountDangerZoneProps {
  userId: string | null;
  setIsLoading: (loading: boolean) => void;
}

const AccountDangerZone: React.FC<AccountDangerZoneProps> = ({ userId, setIsLoading }) => {
  return (
    <div className="space-y-6">
      <DangerZoneCard userId={userId} setIsLoading={setIsLoading} />
    </div>
  );
};

export default AccountDangerZone;
