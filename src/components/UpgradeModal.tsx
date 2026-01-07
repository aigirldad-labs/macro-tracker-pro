import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface UpgradeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const DEFAULT_MESSAGE =
  "I want to upgrade for features like persistent storage to the cloud, real-time data sync, collaboration or competition with friends/family, a meal planner, and an agentic shopping solution.";
const EMAIL_TO = 'aigirldad.labs@gmail.com';
const SUBJECT = 'Macro Mapper upgrade request';
const DONATION_URL = 'https://www.buymeacoffee.com/aigirldad';

export function UpgradeModal({ open, onOpenChange }: UpgradeModalProps) {
  const [message, setMessage] = useState(DEFAULT_MESSAGE);
  const [successOpen, setSuccessOpen] = useState(false);

  useEffect(() => {
    if (open) {
      setMessage(DEFAULT_MESSAGE);
    }
  }, [open]);

  const handleSendEmail = () => {
    const mailto = `mailto:${EMAIL_TO}?subject=${encodeURIComponent(
      SUBJECT,
    )}&body=${encodeURIComponent(message.trim())}`;
    window.location.href = mailto;
    onOpenChange(false);
    setSuccessOpen(true);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="bg-card border-border max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-foreground">Upgrade request</DialogTitle>
            <DialogDescription>
              Send a quick note about the features you want to upgrade for.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="upgrade-message" className="text-sm text-foreground">
                Message
              </Label>
              <Textarea
                id="upgrade-message"
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                className="min-h-[140px] bg-input border-border"
              />
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
              <Button variant="secondary" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button onClick={handleSendEmail} disabled={!message.trim()}>
                Send email
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={successOpen} onOpenChange={setSuccessOpen}>
        <DialogContent className="bg-card border-border max-w-md">
          <DialogHeader>
            <DialogTitle className="text-foreground">Thanks for the support</DialogTitle>
            <DialogDescription>
              If you want to help fuel more features, you can send a coffee donation below.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
            <Button variant="secondary" onClick={() => setSuccessOpen(false)}>
              Close
            </Button>
            <Button asChild>
              <a href={DONATION_URL} target="_blank" rel="noreferrer">
                Send a coffee
              </a>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
