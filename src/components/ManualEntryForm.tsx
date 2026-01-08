import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FoodEntry, calculateCalories } from '@/lib/repositories';

interface ManualEntryFormProps {
  onSubmit: (entry: Omit<FoodEntry, 'id' | 'dateKey' | 'calories'>) => void;
}

export function ManualEntryForm({ onSubmit }: ManualEntryFormProps) {
  const [label, setLabel] = useState('');
  const [datetime, setDatetime] = useState(() => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  });
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');
  const [error, setError] = useState<string | null>(null);

  const proteinNum = parseFloat(protein) || 0;
  const carbsNum = parseFloat(carbs) || 0;
  const fatNum = parseFloat(fat) || 0;
  const calories = calculateCalories(proteinNum, carbsNum, fatNum);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (proteinNum < 0 || carbsNum < 0 || fatNum < 0) {
      setError("Macros can't be negative.");
      return;
    }

    if (proteinNum === 0 && carbsNum === 0 && fatNum === 0) {
      setError('Enter at least one macro value.');
      return;
    }

    onSubmit({
      datetime: new Date(datetime).toISOString(),
      label: label.trim(),
      protein_g: proteinNum,
      carbs_g: carbsNum,
      fat_g: fatNum,
      source: 'manual',
      rawText: null,
    });

    // Reset form
    setLabel('');
    setProtein('');
    setCarbs('');
    setFat('');
    setDatetime(() => {
      const now = new Date();
      now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
      return now.toISOString().slice(0, 16);
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="label" className="text-sm text-foreground">Food (optional)</Label>
        <Input
          id="label"
          placeholder="e.g., Chicken bowl"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          className="bg-input border-border"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="datetime" className="text-sm text-foreground">Date & Time</Label>
        <Input
          id="datetime"
          type="datetime-local"
          value={datetime}
          onChange={(e) => setDatetime(e.target.value)}
          className="bg-input border-border text-sm"
        />
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="space-y-2">
          <Label htmlFor="protein" className="text-sm text-foreground">Protein (g)</Label>
          <Input
            id="protein"
            type="number"
            min="0"
            placeholder="0"
            value={protein}
            onChange={(e) => setProtein(e.target.value)}
            className="bg-input border-border"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="carbs" className="text-sm text-foreground">Carbs (g)</Label>
          <Input
            id="carbs"
            type="number"
            min="0"
            placeholder="0"
            value={carbs}
            onChange={(e) => setCarbs(e.target.value)}
            className="bg-input border-border"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="fat" className="text-sm text-foreground">Fat (g)</Label>
          <Input
            id="fat"
            type="number"
            min="0"
            placeholder="0"
            value={fat}
            onChange={(e) => setFat(e.target.value)}
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

      <Button type="submit" className="w-full">
        Save Entry
      </Button>
    </form>
  );
}

