
import React from "react";
import PreferencesForm from "./PreferencesForm";

interface PreferencesSectionProps {
  userId: string | null;
  preferredUnit: string;
  timezone: string;
  setIsLoading: (loading: boolean) => void;
  updateProfile: (data: { preferredUnit?: string, timezone?: string }) => void;
}

const PreferencesSection: React.FC<PreferencesSectionProps> = ({
  userId,
  preferredUnit,
  timezone,
  setIsLoading,
  updateProfile
}) => {
  return (
    <div className="space-y-6">
      <PreferencesForm 
        userId={userId}
        preferredUnit={preferredUnit}
        timezone={timezone}
        setIsLoading={setIsLoading}
        updateProfile={updateProfile}
      />
    </div>
  );
};

export default PreferencesSection;
