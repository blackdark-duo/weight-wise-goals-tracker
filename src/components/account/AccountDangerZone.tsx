
import React from "react";
import DangerZoneCard from "./DangerZoneCard";

interface AccountDangerZoneProps {
  userId: string | null;
  setIsLoading: (loading: boolean) => void;
}

const AccountDangerZone: React.FC<AccountDangerZoneProps> = ({ userId, setIsLoading }) => {
  return <DangerZoneCard userId={userId} setIsLoading={setIsLoading} />;
};

export default AccountDangerZone;
