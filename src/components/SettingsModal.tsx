import { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ConfirmDialog } from './ConfirmDialog';
import { SettingsRepository } from '@/lib/repositories';
import { useToast } from '@/hooks/use-toast';

interface SettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SettingsModal({ open, onOpenChange }: SettingsModalProps) {
  const [apiKey, setApiKey] = useState(() => SettingsRepository.getApiKey() || '');
  const [showClearAllConfirm, setShowClearAllConfirm] = useState(false);
  const { toast } = useToast();

  const handleSaveKey = () => {
    if (apiKey.trim()) {
      SettingsRepository.setApiKey(apiKey.trim());
      toast({
        title: 'API key saved',
        description: 'Your AI API key has been stored.',
      });
    }
  };

  const handleClearKey = () => {
    SettingsRepository.clearApiKey();
    setApiKey('');
    toast({
      title: 'API key cleared',
      description: 'Your API key has been removed.',
    });
  };

  const handleClearAll = () => {
    SettingsRepository.clearAll();
    setApiKey('');
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
            {/* API Key Section */}
            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="api-key" className="text-sm text-foreground">AI API Key</Label>
                <Input
                  id="api-key"
                  type="password"
                  placeholder="Paste your key here"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="bg-input border-border"
                />
                <p className="text-xs text-muted-foreground">
                  Used only to parse macros from your text.
                </p>
              </div>

              <div className="flex items-start gap-2 p-3 bg-muted rounded-lg">
                <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5 shrink-0" />
                <p className="text-xs text-muted-foreground">
                  Storing API keys in browser storage is not fully secure. Clear it when you're done.
                </p>
              </div>

              <div className="flex gap-2">
                <Button onClick={handleSaveKey} disabled={!apiKey.trim()} className="flex-1">
                  Save API Key
                </Button>
                <Button variant="secondary" onClick={handleClearKey} className="flex-1">
                  Clear API Key
                </Button>
              </div>
            </div>

            {/* Danger Zone */}
            <div className="pt-4 border-t border-border">
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
        description="This deletes your goal weight, entries, and API key from this browser."
        confirmLabel="Clear All"
        onConfirm={handleClearAll}
        variant="destructive"
      />
    </>
  );
}
