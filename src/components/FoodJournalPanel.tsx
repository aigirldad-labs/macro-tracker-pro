import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ManualEntryForm } from './ManualEntryForm';
import { AiEntryForm } from './AiEntryForm';
import { EntriesList } from './EntriesList';
import { EditEntryModal } from './EditEntryModal';
import { ConfirmDialog } from './ConfirmDialog';
import { EntriesRepository, FoodEntry } from '@/lib/repositories';
import { useToast } from '@/hooks/use-toast';

interface FoodJournalPanelProps {
  onOpenSettings: () => void;
  onEntriesChange: () => void;
}

export function FoodJournalPanel({ onOpenSettings, onEntriesChange }: FoodJournalPanelProps) {
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
          <Tabs defaultValue="manual" className="w-full">
            <TabsList className="w-full grid grid-cols-2 bg-muted">
              <TabsTrigger value="manual" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                Manual
              </TabsTrigger>
              <TabsTrigger value="ai" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                AI Parse
              </TabsTrigger>
            </TabsList>
            <TabsContent value="manual" className="mt-4">
              <ManualEntryForm onSubmit={handleAddEntry} />
            </TabsContent>
            <TabsContent value="ai" className="mt-4">
              <AiEntryForm onSubmit={handleAddEntry} onOpenSettings={onOpenSettings} />
            </TabsContent>
          </Tabs>

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
