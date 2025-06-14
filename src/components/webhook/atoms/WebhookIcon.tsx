import React from 'react';
import { Webhook } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WebhookIconProps {
  className?: string;
  size?: number;
}

export const WebhookIcon: React.FC<WebhookIconProps> = ({ 
  className,
  size = 20
}) => {
  return (
    <Webhook 
      className={cn("text-primary", className)} 
      size={size}
    />
  );
};