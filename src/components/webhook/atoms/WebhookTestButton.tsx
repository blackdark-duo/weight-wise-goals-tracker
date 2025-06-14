import React from 'react';
import { Button } from '@/components/ui/button';
import { TestTube } from 'lucide-react';

interface WebhookTestButtonProps {
  onTest: () => void;
  isLoading?: boolean;
  disabled?: boolean;
  size?: 'sm' | 'default' | 'lg';
  variant?: 'default' | 'outline' | 'secondary';
}

export const WebhookTestButton: React.FC<WebhookTestButtonProps> = ({
  onTest,
  isLoading = false,
  disabled = false,
  size = 'sm',
  variant = 'outline'
}) => {
  return (
    <Button
      variant={variant}
      size={size}
      onClick={onTest}
      disabled={isLoading || disabled}
      className="flex items-center gap-2"
    >
      <TestTube className="h-4 w-4" />
      {isLoading ? "Testing..." : "Test Webhook"}
    </Button>
  );
};