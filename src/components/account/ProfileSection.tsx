
import React from "react";
import ProfileForm from "./ProfileForm";
import PasswordForm from "./PasswordForm";

interface ProfileSectionProps {
  userName: string | null;
  email: string | null;
  userId: string | null;
  setIsLoading: (loading: boolean) => void;
  updateProfile: (data: { userName?: string | null }) => void;
}

const ProfileSection: React.FC<ProfileSectionProps> = ({
  userName,
  email,
  userId,
  setIsLoading,
  updateProfile
}) => {
  return (
    <div className="space-y-6">
      <ProfileForm 
        userName={userName} 
        email={email}
        userId={userId}
        setIsLoading={setIsLoading}
        updateProfile={updateProfile}
      />
      <PasswordForm 
        setIsLoading={setIsLoading} 
      />
    </div>
  );
};

export default ProfileSection;
