import { useState, useEffect } from 'react';
import { Info } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { calculateTargets, FORMULAS, Targets } from '@/lib/calculations';
import { GoalRepository } from '@/lib/repositories';

export function TargetsPanel() {
  const [goalWeight, setGoalWeight] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [targets, setTargets] = useState<Targets | null>(null);

  // Load stored goal weight on mount
  useEffect(() => {
    const stored = GoalRepository.get();
    if (stored) {
      setGoalWeight(String(stored));
      setTargets(calculateTargets(stored));
    }
  }, []);

  const handleChange = (value: string) => {
    setGoalWeight(value);
    
    if (!value.trim()) {
      setError(null);
      setTargets(null);
      return;
    }

    const parsed = parseFloat(value);
    
    if (isNaN(parsed)) {
      setError('Please enter a valid number.');
      setTargets(null);
      return;
    }
    
    if (parsed <= 0) {
      setError('Enter a goal weight greater than 0.');
      setTargets(null);
      return;
    }

    setError(null);
    setTargets(calculateTargets(parsed));
    GoalRepository.set(parsed);
  };

  const weightNum = parseFloat(goalWeight) || 200; // Default for examples

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold text-foreground">Daily Targets</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Goal Weight Input */}
        <div className="space-y-2">
          <Label htmlFor="goal-weight" className="text-sm font-medium text-foreground">
            Goal Body Weight (lbs)
          </Label>
          <Input
            id="goal-weight"
            type="number"
            placeholder="e.g., 200"
            value={goalWeight}
            onChange={(e) => handleChange(e.target.value)}
            className="bg-input border-border text-foreground placeholder:text-muted-foreground"
          />
          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}
          <p className="text-xs text-muted-foreground">
            Used to calculate daily calories and macros.
          </p>
        </div>

        {/* Targets Display */}
        <div className="space-y-3">
          <TargetRow
            label="Daily Calories"
            value={targets ? `${targets.dailyCalories} kcal` : '—'}
            formula={FORMULAS.dailyCalories}
            exampleWeight={weightNum}
          />
          <TargetRow
            label="Protein"
            value={targets ? `${targets.proteinGrams} g • ${targets.proteinCalories} kcal` : '—'}
            formula={FORMULAS.protein}
            exampleWeight={weightNum}
          />
          <TargetRow
            label="Fat"
            value={targets ? `${targets.fatGrams} g • ${targets.fatCalories} kcal` : '—'}
            formula={FORMULAS.fat}
            exampleWeight={weightNum}
          />
          <TargetRow
            label="Carbs"
            value={targets ? `${targets.carbGrams} g • ${targets.carbCalories} kcal` : '—'}
            formula={FORMULAS.carbs}
            exampleWeight={weightNum}
          />
          <TargetRow
            label="Water Intake"
            value={targets ? `${targets.waterKg} kg/day` : '—'}
            formula={FORMULAS.water}
            exampleWeight={weightNum}
          />
        </div>
      </CardContent>
    </Card>
  );
}

interface FormulaInfo {
  title: string;
  formula: string;
  example: (weight: number) => string;
}

interface TargetRowProps {
  label: string;
  value: string;
  formula: FormulaInfo;
  exampleWeight: number;
}

function TargetRow({ label, value, formula, exampleWeight }: TargetRowProps) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-border last:border-0">
      <div className="flex items-center gap-2">
        <span className="text-sm text-foreground">{label}</span>
        <Tooltip>
          <TooltipTrigger asChild>
            <button className="text-muted-foreground hover:text-foreground transition-colors focus-ring rounded">
              <Info className="h-4 w-4" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="right" className="max-w-xs">
            <div className="space-y-2">
              <p className="font-medium text-sm">{formula.title}</p>
              <p className="text-xs whitespace-pre-line text-muted-foreground">{formula.formula}</p>
              <p className="text-xs text-muted-foreground">{formula.example(exampleWeight)}</p>
            </div>
          </TooltipContent>
        </Tooltip>
      </div>
      <span className="text-sm font-medium text-foreground">{value}</span>
    </div>
  );
}
