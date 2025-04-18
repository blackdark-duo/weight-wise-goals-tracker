
import React, { useState } from "react";
import ProfileForm from "./ProfileForm";
import PasswordForm from "./PasswordForm";

interface AccountProfileProps {
  userName: string | null;
  email: string | null;
  userId: string | null;
  setIsLoading: (loading: boolean) => void;
}

const AccountProfile: React.FC<AccountProfileProps> = ({
  userName,
  email,
  userId,
  setIsLoading
}) => {
  const [displayName, setDisplayName] = useState<string | null>(userName);
  
  // Create a function to update profile that will be passed to ProfileForm
  const updateProfile = (data: { userName?: string | null }) => {
    if (data.userName !== undefined) {
      setDisplayName(data.userName);
    }
  };
  
  return (
    <div className="space-y-6">
      <ProfileForm 
        userName={displayName} 
        email={email}
        userId={userId}
        setIsLoading={setIsLoading}
        updateProfile={updateProfile}
      />
      <PasswordForm setIsLoading={setIsLoading} />
    </div>
  );
};

export default AccountProfile;
