import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ManualEntryForm } from './ManualEntryForm';
import { EntriesList } from './EntriesList';
import { EditEntryModal } from './EditEntryModal';
import { ConfirmDialog } from './ConfirmDialog';
import { calculateTargets } from '@/lib/calculations';
import { EntriesRepository, FoodEntry, getDateKey, GoalRepository } from '@/lib/repositories';
import { useToast } from '@/hooks/use-toast';

interface FoodJournalPanelProps {
  onEntriesChange: () => void;
}

export function FoodJournalPanel({ onEntriesChange }: FoodJournalPanelProps) {
  const [entries, setEntries] = useState<FoodEntry[]>([]);
  const [editingEntry, setEditingEntry] = useState<FoodEntry | null>(null);
  const [deletingEntry, setDeletingEntry] = useState<FoodEntry | null>(null);
  const { toast } = useToast();

  const loadEntries = useCallback(() => {
    const loaded = EntriesRepository.getAll();
    setEntries(loaded);
    onEntriesChange();
  }, [onEntriesChange]);

  useEffect(() => {
    loadEntries();
  }, [loadEntries]);

  const handleAddEntry = (entry: Omit<FoodEntry, 'id' | 'dateKey' | 'calories'>) => {
    EntriesRepository.add(entry);
    loadEntries();
    toast({
      title: 'Entry saved',
      description: 'Your food entry has been added.',
    });
  };

  const handleEditEntry = (id: string, updates: Partial<Omit<FoodEntry, 'id'>>) => {
    EntriesRepository.update(id, updates);
    loadEntries();
    setEditingEntry(null);
    toast({
      title: 'Entry updated',
      description: 'Your changes have been saved.',
    });
  };

  const handleDeleteEntry = () => {
    if (!deletingEntry) return;
    EntriesRepository.delete(deletingEntry.id);
    loadEntries();
    setDeletingEntry(null);
    toast({
      title: 'Entry deleted',
      description: 'The entry has been removed.',
    });
  };

  return (
    <>
      <Card className="bg-card border-border">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold text-foreground">Food Journal</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {(() => {
            const goalWeight = GoalRepository.get();
            const targets = goalWeight ? calculateTargets(goalWeight) : null;
            const todayKey = getDateKey(new Date().toISOString());
            const totals = entries.reduce(
              (acc, entry) => {
                if (entry.dateKey !== todayKey) return acc;
                acc.calories += entry.calories;
                acc.protein += entry.protein_g;
                acc.carbs += entry.carbs_g;
                acc.fat += entry.fat_g;
                return acc;
              },
              { calories: 0, protein: 0, carbs: 0, fat: 0 },
            );

            if (!targets) {
              return null;
            }

            if (totals.calories === 0 && totals.protein === 0 && totals.carbs === 0 && totals.fat === 0) {
              return null;
            }

            const remainingCalories = targets.dailyCalories - totals.calories;
            const remainingClassName =
              remainingCalories < 0
                ? 'border-destructive/40 bg-destructive/10'
                : 'border-emerald-500/30 bg-emerald-500/10';

            return (
              <div className={`rounded-lg border p-3 ${remainingClassName}`}>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Remaining Today
                </p>
                <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Calories</span>
                    <span className="font-medium text-foreground">
                      {remainingCalories} cal
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Protein</span>
                    <span className="font-medium text-foreground">
                      {targets.proteinGrams - totals.protein} g
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Carbs</span>
                    <span className="font-medium text-foreground">
                      {targets.carbGrams - totals.carbs} g
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Fat</span>
                    <span className="font-medium text-foreground">
                      {targets.fatGrams - totals.fat} g
                    </span>
                  </div>
                </div>
              </div>
            );
          })()}
          <ManualEntryForm onSubmit={handleAddEntry} />

          <EntriesList
            entries={entries}
            onEdit={setEditingEntry}
            onDelete={setDeletingEntry}
          />
        </CardContent>
      </Card>

      <EditEntryModal
        entry={editingEntry}
        onClose={() => setEditingEntry(null)}
        onSave={handleEditEntry}
      />

      <ConfirmDialog
        open={!!deletingEntry}
        onOpenChange={(open) => !open && setDeletingEntry(null)}
        title="Delete entry?"
        description="This cannot be undone."
        confirmLabel="Delete"
        onConfirm={handleDeleteEntry}
        variant="destructive"
      />
    </>
  );
}
