
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

interface EmailDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  selectedProfile: Profile | null;
  emailSubject: string;
  setEmailSubject: (subject: string) => void;
  emailContent: string;
  setEmailContent: (content: string) => void;
  isSendingEmail: boolean;
  onSendEmail: () => void;
}

const EmailDialog: React.FC<EmailDialogProps> = ({
  isOpen,
  setIsOpen,
  selectedProfile,
  emailSubject,
  setEmailSubject,
  emailContent,
  setEmailContent,
  isSendingEmail,
  onSendEmail
}) => {
  const handleClose = () => {
    setIsOpen(false);
    setEmailSubject("");
    setEmailContent("");
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Send Email</DialogTitle>
          <DialogDescription>
            Send an email to {selectedProfile?.email || "the user"}.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label htmlFor="subject">Subject</label>
            <Input
              id="subject"
              value={emailSubject}
              onChange={(e) => setEmailSubject(e.target.value)}
              placeholder="Email subject"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="content">Message</label>
            <textarea
              id="content"
              value={emailContent}
              onChange={(e) => setEmailContent(e.target.value)}
              className="min-h-[100px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground"
              placeholder="Write your message here..."
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              onSendEmail();
              setIsOpen(false);
            }}
            disabled={isSendingEmail || !emailSubject || !emailContent}
          >
            {isSendingEmail ? "Sending..." : "Send Email"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EmailDialog;
