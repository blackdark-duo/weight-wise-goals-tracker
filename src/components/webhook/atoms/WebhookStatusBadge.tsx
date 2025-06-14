import React from 'react';
import { Badge } from '@/components/ui/badge';

export type WebhookStatus = 'success' | 'failed' | 'pending' | 'testing';

interface WebhookStatusBadgeProps {
  status: WebhookStatus;
}

export const WebhookStatusBadge: React.FC<WebhookStatusBadgeProps> = ({ status }) => {
  const getVariant = () => {
    switch (status) {
      case 'success':
        return 'default';
      case 'failed':
        return 'destructive';
      case 'testing':
        return 'secondary';
      case 'pending':
      default:
        return 'outline';
    }
  };

  const getLabel = () => {
    switch (status) {
      case 'success':
        return 'Success';
      case 'failed':
        return 'Failed';
      case 'testing':
        return 'Testing';
      case 'pending':
      default:
        return 'Pending';
    }
  };

  return (
    <Badge variant={getVariant()}>
      {getLabel()}
    </Badge>
  );
};