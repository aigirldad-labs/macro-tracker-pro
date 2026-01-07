import { useState } from 'react';
import { Pencil, Trash2, Bot, Hand } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FoodEntry } from '@/lib/repositories';

interface EntriesListProps {
  entries: FoodEntry[];
  onEdit: (entry: FoodEntry) => void;
  onDelete: (entry: FoodEntry) => void;
}

export function EntriesList({ entries, onEdit, onDelete }: EntriesListProps) {
  const [expanded, setExpanded] = useState(false);

  if (entries.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-sm font-medium text-foreground">No entries yet</p>
        <p className="text-sm text-muted-foreground mt-1">
          Add your first food entry to start tracking.
        </p>
      </div>
    );
  }

  const displayedEntries = expanded ? entries : entries.slice(0, 5);
  const hasMore = entries.length > 5;

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-foreground">Recent (Last 5)</h3>
      
      <div className="space-y-2">
        {displayedEntries.map((entry) => (
          <EntryRow
            key={entry.id}
            entry={entry}
            onEdit={() => onEdit(entry)}
            onDelete={() => onDelete(entry)}
          />
        ))}
      </div>

      {hasMore && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setExpanded(!expanded)}
          className="w-full text-muted-foreground hover:text-foreground"
        >
          {expanded ? 'Show Less' : 'See More'}
        </Button>
      )}
    </div>
  );
}

interface EntryRowProps {
  entry: FoodEntry;
  onEdit: () => void;
  onDelete: () => void;
}

function EntryRow({ entry, onEdit, onDelete }: EntryRowProps) {
  const date = new Date(entry.datetime);
  const isToday = new Date().toDateString() === date.toDateString();
  const timeStr = date.toLocaleTimeString('en-US', { 
    hour: 'numeric', 
    minute: '2-digit',
    hour12: true 
  });
  const dateStr = isToday 
    ? timeStr 
    : `${timeStr} • ${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;

  return (
    <div className="p-3 bg-muted rounded-lg space-y-2">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground truncate">
            {entry.label || '(No label)'}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {dateStr} • P {entry.protein_g} / C {entry.carbs_g} / F {entry.fat_g} • {entry.calories} cal
          </p>
        </div>
        <Badge variant="secondary" className="text-xs shrink-0">
          {entry.source === 'ai' ? (
            <>
              <Bot className="h-3 w-3 mr-1" />
              AI
            </>
          ) : (
            <>
              <Hand className="h-3 w-3 mr-1" />
              Manual
            </>
          )}
        </Badge>
      </div>
      <div className="flex gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={onEdit}
          className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
        >
          <Pencil className="h-3 w-3 mr-1" />
          Edit
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onDelete}
          className="h-7 px-2 text-xs text-muted-foreground hover:text-destructive"
        >
          <Trash2 className="h-3 w-3 mr-1" />
          Delete
        </Button>
      </div>
    </div>
  );
}

