import { useState, useEffect } from 'react';
import { Info } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { calculateTargets, FORMULAS, Targets } from '@/lib/calculations';
import { FoodEntry, getDateKey, GoalRepository } from '@/lib/repositories';

interface TargetsPanelProps {
  entries: FoodEntry[];
}

export function TargetsPanel({ entries }: TargetsPanelProps) {
  const [goalWeight, setGoalWeight] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [targets, setTargets] = useState<Targets | null>(null);

  useEffect(() => {
    const stored = GoalRepository.get();
    if (stored) {
      setGoalWeight(String(stored));
      setTargets(calculateTargets(stored));
    }
  }, []);

  const todayKey = getDateKey(new Date().toISOString());
  const todaysTotals = entries.reduce(
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

  const remaining = targets
    ? {
        calories: targets.dailyCalories - todaysTotals.calories,
        protein: targets.proteinGrams - todaysTotals.protein,
        carbs: targets.carbGrams - todaysTotals.carbs,
        fat: targets.fatGrams - todaysTotals.fat,
      }
    : null;

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

  const weightNum = parseFloat(goalWeight) || 200;

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold text-foreground">Daily Targets</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
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
            Used to calculate calories and macro targets for your goals.
          </p>
          <details className="px-1 pt-2">
            <summary className="cursor-pointer text-xs font-medium text-foreground">
              Why macros matter
            </summary>
            <div className="pt-2 pl-4 text-xs text-muted-foreground space-y-2">
              <p>
                Macros are protein, carbs, and fat. Protein supports muscle repair and growth, carbs fuel
                training and daily activity, and fat helps with hormones and long-term energy.
              </p>
              <p>
                These targets help you balance intake for goals like losing weight, maintaining, or building
                muscle.
              </p>
            </div>
          </details>
        </div>

        <div className="space-y-3">
          <TargetRow
            label="Calories"
            value={targets ? `${targets.dailyCalories} cal` : '-'}
            formula={FORMULAS.dailyCalories}
            exampleWeight={weightNum}
            consumed={todaysTotals.calories}
            target={targets?.dailyCalories ?? 0}
            remainingLabel={remaining ? `${remaining.calories} cal` : 'Set a goal weight first.'}
            consumedLabel={`${todaysTotals.calories} cal`}
            barColor="hsl(199 89% 48%)"
          />
          <TargetRow
            label="Protein"
            value={targets ? `${targets.proteinGrams} g - ${targets.proteinCalories} cal` : '-'}
            formula={FORMULAS.protein}
            exampleWeight={weightNum}
            consumed={todaysTotals.protein}
            target={targets?.proteinGrams ?? 0}
            remainingLabel={
              remaining
                ? `${remaining.protein} g - ${remaining.protein * 4} cal`
                : 'Set a goal weight first.'
            }
            consumedLabel={`${todaysTotals.protein} g - ${todaysTotals.protein * 4} cal`}
            barColor="hsl(142 76% 45%)"
          />
          <TargetRow
            label="Fat"
            value={targets ? `${targets.fatGrams} g - ${targets.fatCalories} cal` : '-'}
            formula={FORMULAS.fat}
            exampleWeight={weightNum}
            consumed={todaysTotals.fat}
            target={targets?.fatGrams ?? 0}
            remainingLabel={
              remaining
                ? `${remaining.fat} g - ${remaining.fat * 9} cal`
                : 'Set a goal weight first.'
            }
            consumedLabel={`${todaysTotals.fat} g - ${todaysTotals.fat * 9} cal`}
            barColor="hsl(280 65% 60%)"
          />
          <TargetRow
            label="Carbs"
            value={targets ? `${targets.carbGrams} g - ${targets.carbCalories} cal` : '-'}
            formula={FORMULAS.carbs}
            exampleWeight={weightNum}
            consumed={todaysTotals.carbs}
            target={targets?.carbGrams ?? 0}
            remainingLabel={
              remaining
                ? `${remaining.carbs} g - ${remaining.carbs * 4} cal`
                : 'Set a goal weight first.'
            }
            consumedLabel={`${todaysTotals.carbs} g - ${todaysTotals.carbs * 4} cal`}
            barColor="hsl(43 96% 58%)"
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
  consumed: number;
  target: number;
  remainingLabel: string;
  consumedLabel: string;
  barColor: string;
}

function TargetRow({
  label,
  value,
  formula,
  exampleWeight,
  consumed,
  target,
  remainingLabel,
  consumedLabel,
  barColor,
}: TargetRowProps) {
  const percentage = target > 0 ? Math.round((consumed / target) * 100) : 0;
  const barWidth = Math.min(percentage, 100);
  const percentLabel = percentage > 100 ? '>100%' : `${percentage}%`;
  const showConsumed = percentage > 100;
  const statusLabel = showConsumed ? 'Consumed' : 'Remaining';
  const detailLabel = showConsumed ? consumedLabel : remainingLabel;

  return (
    <div className="grid grid-cols-5 gap-3 items-center py-2 border-b border-border last:border-0">
      <div className="col-span-1 flex items-center gap-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              title={formula.formula}
              aria-label={`${label} calculation details`}
              className="text-muted-foreground hover:text-foreground transition-colors focus-ring rounded"
            >
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
        <span className="text-sm text-foreground">{label}</span>
      </div>
      <div className="col-span-4">
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="relative h-10 rounded-md bg-muted/40 border border-border overflow-hidden">
              <div
                className="absolute inset-y-0 left-0"
                style={{
                  width: `${barWidth}%`,
                  backgroundColor: barColor,
                  opacity: 0.25,
                }}
              />
              <div className="relative z-10 h-full flex items-center justify-between px-3 text-sm">
                <span className="text-xs text-muted-foreground">{percentLabel}</span>
                <span className="text-sm font-medium text-foreground text-right">{value}</span>
              </div>
            </div>
          </TooltipTrigger>
          <TooltipContent side="top" className="max-w-xs">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">{statusLabel}</p>
              <p className="text-sm text-foreground">{detailLabel}</p>
            </div>
          </TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
}
