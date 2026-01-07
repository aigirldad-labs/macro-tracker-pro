import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { FoodEntry } from '@/lib/repositories';

interface ChartPanelProps {
  entries: FoodEntry[];
}

export function ChartPanel({ entries }: ChartPanelProps) {
  const chartData = useMemo(() => {
    // Get last 30 days
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29);
    thirtyDaysAgo.setHours(0, 0, 0, 0);

    // Create a map for each day
    const dayMap = new Map<string, { protein: number; carbs: number; fat: number }>();

    // Initialize all 30 days with 0
    for (let i = 0; i < 30; i++) {
      const date = new Date(thirtyDaysAgo);
      date.setDate(date.getDate() + i);
      const dateKey = date.toISOString().split('T')[0];
      dayMap.set(dateKey, { protein: 0, carbs: 0, fat: 0 });
    }

    // Aggregate entries by dateKey
    entries.forEach((entry) => {
      const existing = dayMap.get(entry.dateKey);
      if (existing) {
        existing.protein += entry.protein_g;
        existing.carbs += entry.carbs_g;
        existing.fat += entry.fat_g;
      }
    });

    // Convert to array
    return Array.from(dayMap.entries())
      .map(([date, macros]) => ({
        date,
        displayDate: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        protein: macros.protein,
        carbs: macros.carbs,
        fat: macros.fat,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [entries]);

  const hasData = entries.some((entry) => {
    const entryDate = new Date(entry.datetime);
    const today = new Date();
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return entryDate >= thirtyDaysAgo && entryDate <= today;
  });

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold text-foreground">
          Daily Macros (Last 30 Days)
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!hasData ? (
          <div className="flex items-center justify-center h-[300px] text-center">
            <div>
              <p className="text-sm font-medium text-foreground">No data yet</p>
              <p className="text-sm text-muted-foreground mt-1">
                Add entries to see your macro trends.
              </p>
            </div>
          </div>
        ) : (
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(222 30% 20%)" />
                <XAxis
                  dataKey="displayDate"
                  stroke="hsl(215 20% 65%)"
                  tick={{ fontSize: 11, fill: 'hsl(215 20% 65%)' }}
                  tickLine={{ stroke: 'hsl(222 30% 20%)' }}
                  interval="preserveStartEnd"
                />
                <YAxis
                  stroke="hsl(215 20% 65%)"
                  tick={{ fontSize: 11, fill: 'hsl(215 20% 65%)' }}
                  tickLine={{ stroke: 'hsl(222 30% 20%)' }}
                  unit="g"
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(222 47% 11%)',
                    border: '1px solid hsl(222 30% 20%)',
                    borderRadius: '8px',
                  }}
                  labelStyle={{ color: 'hsl(210 40% 96%)' }}
                />
                <Legend
                  wrapperStyle={{ paddingTop: '10px' }}
                />
                <Line
                  type="monotone"
                  dataKey="protein"
                  name="Protein (g)"
                  stroke="hsl(142 76% 45%)"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="carbs"
                  name="Carbs (g)"
                  stroke="hsl(43 96% 58%)"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="fat"
                  name="Fat (g)"
                  stroke="hsl(280 65% 60%)"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
