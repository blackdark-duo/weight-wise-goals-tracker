
import React from 'react';
import WebhookSettings from './WebhookSettings';
import WebhookLogViewer from './WebhookLogViewer';
import { Card } from '@/components/ui/card';

const AppControlsTab: React.FC = () => {
  return (
    <div className="space-y-6">
      <WebhookSettings onUpdate={() => console.log('Webhook settings updated')} />
      <WebhookLogViewer />
    </div>
  );
};

export default AppControlsTab;
