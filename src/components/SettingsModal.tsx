import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from './ConfirmDialog';
import { SettingsRepository } from '@/lib/repositories';
import { useToast } from '@/hooks/use-toast';

interface SettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SettingsModal({ open, onOpenChange }: SettingsModalProps) {
  const [showClearAllConfirm, setShowClearAllConfirm] = useState(false);
  const { toast } = useToast();

  const handleClearAll = () => {
    SettingsRepository.clearAll();
    setShowClearAllConfirm(false);
    onOpenChange(false);
    toast({
      title: 'Data cleared',
      description: 'All app data has been deleted.',
    });
    // Reload to reset state
    window.location.reload();
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="bg-card border-border max-w-md">
          <DialogHeader>
            <DialogTitle className="text-foreground">Settings</DialogTitle>
          </DialogHeader>

          <div className="space-y-6 pt-4">
            <div className="rounded-lg border border-border bg-muted/40 p-3">
              <p className="text-sm text-muted-foreground">
                Settings are minimal right now. Your data lives only in this browser.
              </p>
            </div>
            {/* Danger Zone */}
            <div className="pt-2 border-t border-border">
              <Button
                variant="destructive"
                onClick={() => setShowClearAllConfirm(true)}
                className="w-full"
              >
                Clear All App Data
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={showClearAllConfirm}
        onOpenChange={setShowClearAllConfirm}
        title="Clear all data?"
        description="This deletes your goal weight and entries from this browser."
        confirmLabel="Clear All"
        onConfirm={handleClearAll}
        variant="destructive"
      />
    </>
  );
}
