
import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Profile } from "@/types/webhook";

interface WebhookUrlDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  selectedProfile: Profile | null;
  webhookUrl: string;
  setWebhookUrl: (url: string) => void;
  isSaving: boolean;
  onSave: () => Promise<void>;
}

const WebhookUrlDialog: React.FC<WebhookUrlDialogProps> = ({
  isOpen,
  setIsOpen,
  selectedProfile,
  webhookUrl,
  setWebhookUrl,
  isSaving,
  onSave
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Webhook URL</DialogTitle>
          <DialogDescription>
            Update the webhook URL for {selectedProfile?.display_name || selectedProfile?.email || "this user"}.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label htmlFor="webhookUrl">Webhook URL</label>
            <Input
              id="webhookUrl"
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              placeholder="https://example.com/webhook"
            />
            <p className="text-xs text-muted-foreground">
              This webhook URL will be used when the user requests AI insights.
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => setIsOpen(false)}
          >
            Cancel
          </Button>
          <Button
            onClick={onSave}
            disabled={isSaving}
          >
            {isSaving ? "Saving..." : "Save URL"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default WebhookUrlDialog;
