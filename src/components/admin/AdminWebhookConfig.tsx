
import React from "react";
import { WebhookConfigCard } from "./webhook/config/WebhookConfigCard";
import { LoadingSpinner } from "./webhook/config/LoadingSpinner";
import { useWebhookConfig } from "./webhook/config/useWebhookConfig";

const AdminWebhookConfig: React.FC = () => {
  const {
    config,
    isLoading,
    isSaving,
    updateUrl,
    updateDays,
    updateField,
    updateDefaultWebhookLimit,
    saveConfig,
  } = useWebhookConfig();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <WebhookConfigCard
      url={config.url}
      days={config.days}
      fields={config.fields}
      defaultWebhookLimit={config.default_webhook_limit}
      isSaving={isSaving}
      onUrlChange={updateUrl}
      onDaysChange={updateDays}
      onFieldChange={updateField}
      onDefaultWebhookLimitChange={updateDefaultWebhookLimit}
      onSave={saveConfig}
    />
  );
};

export default AdminWebhookConfig;
