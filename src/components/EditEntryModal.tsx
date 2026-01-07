import { useState, useEffect } from 'react';
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
import { FoodEntry, calculateCalories } from '@/lib/repositories';

interface EditEntryModalProps {
  entry: FoodEntry | null;
  onClose: () => void;
  onSave: (id: string, updates: Partial<Omit<FoodEntry, 'id'>>) => void;
}

export function EditEntryModal({ entry, onClose, onSave }: EditEntryModalProps) {
  const [label, setLabel] = useState('');
  const [datetime, setDatetime] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Initialize form when entry changes
  useEffect(() => {
    if (entry) {
      setLabel(entry.label);
      const date = new Date(entry.datetime);
      date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
      setDatetime(date.toISOString().slice(0, 16));
      setProtein(String(entry.protein_g));
      setCarbs(String(entry.carbs_g));
      setFat(String(entry.fat_g));
      setError(null);
      setHasChanges(false);
    }
  }, [entry]);

  const proteinNum = parseFloat(protein) || 0;
  const carbsNum = parseFloat(carbs) || 0;
  const fatNum = parseFloat(fat) || 0;
  const calories = calculateCalories(proteinNum, carbsNum, fatNum);

  const handleChange = (setter: (v: string) => void) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setter(e.target.value);
    setHasChanges(true);
  };

  const handleClose = () => {
    if (hasChanges) {
      setShowDiscardConfirm(true);
    } else {
      onClose();
    }
  };

  const handleSave = () => {
    if (!entry) return;
    setError(null);

    if (proteinNum < 0 || carbsNum < 0 || fatNum < 0) {
      setError("Macros can't be negative.");
      return;
    }

    if (proteinNum === 0 && carbsNum === 0 && fatNum === 0) {
      setError('Enter at least one macro value.');
      return;
    }

    if (!datetime) {
      setError('Please enter a valid date and time.');
      return;
    }

    onSave(entry.id, {
      label: label.trim(),
      datetime: new Date(datetime).toISOString(),
      protein_g: proteinNum,
      carbs_g: carbsNum,
      fat_g: fatNum,
    });
  };

  return (
    <>
      <Dialog open={!!entry} onOpenChange={(open) => !open && handleClose()}>
        <DialogContent className="bg-card border-border max-w-md">
          <DialogHeader>
            <DialogTitle className="text-foreground">Edit Entry</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="edit-label" className="text-sm text-foreground">Food (optional)</Label>
              <Input
                id="edit-label"
                value={label}
                onChange={handleChange(setLabel)}
                className="bg-input border-border"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-datetime" className="text-sm text-foreground">Date & Time</Label>
              <Input
                id="edit-datetime"
                type="datetime-local"
                value={datetime}
                onChange={handleChange(setDatetime)}
                className="bg-input border-border"
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-2">
                <Label htmlFor="edit-protein" className="text-sm text-foreground">Protein (g)</Label>
                <Input
                  id="edit-protein"
                  type="number"
                  min="0"
                  value={protein}
                  onChange={handleChange(setProtein)}
                  className="bg-input border-border"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-carbs" className="text-sm text-foreground">Carbs (g)</Label>
                <Input
                  id="edit-carbs"
                  type="number"
                  min="0"
                  value={carbs}
                  onChange={handleChange(setCarbs)}
                  className="bg-input border-border"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-fat" className="text-sm text-foreground">Fat (g)</Label>
                <Input
                  id="edit-fat"
                  type="number"
                  min="0"
                  value={fat}
                  onChange={handleChange(setFat)}
                  className="bg-input border-border"
                />
              </div>
            </div>

            <div className="flex items-center justify-between py-2 px-3 bg-muted rounded-lg">
              <span className="text-sm text-muted-foreground">Calories</span>
              <span className="text-sm font-medium text-foreground">{calories} cal</span>
            </div>

            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}

            <div className="flex gap-3 pt-2">
              <Button variant="secondary" onClick={handleClose} className="flex-1">
                Cancel
              </Button>
              <Button onClick={handleSave} className="flex-1">
                Save Changes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={showDiscardConfirm}
        onOpenChange={setShowDiscardConfirm}
        title="Discard changes?"
        description="You have unsaved edits that will be lost."
        confirmLabel="Discard"
        cancelLabel="Keep Editing"
        onConfirm={() => {
          setShowDiscardConfirm(false);
          onClose();
        }}
        variant="destructive"
      />
    </>
  );
}

