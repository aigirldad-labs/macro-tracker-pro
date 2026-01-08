import { useState, useCallback } from 'react';
import { Settings, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { TargetsPanel } from '@/components/TargetsPanel';
import { FoodJournalPanel } from '@/components/FoodJournalPanel';
import { ChartPanel } from '@/components/ChartPanel';
import { SettingsModal } from '@/components/SettingsModal';
import { UpgradeModal } from '@/components/UpgradeModal';
import { EntriesRepository, FoodEntry } from '@/lib/repositories';

const Index = () => {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [entries, setEntries] = useState<FoodEntry[]>(() => EntriesRepository.getAll());

  const handleEntriesChange = useCallback(() => {
    setEntries(EntriesRepository.getAll());
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
          <div>
            <span className="text-lg font-semibold text-foreground">Macro Mapper</span>
            <div className="flex gap-1 mt-1">
              <span className="h-0.5 w-10 rounded-full bg-sky-400" />
              <span className="h-0.5 w-6 rounded-full bg-emerald-400" />
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setUpgradeOpen(true)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <Sparkles className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Upgrade</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSettingsOpen(true)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <Settings className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Settings</TooltipContent>
            </Tooltip>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container max-w-2xl mx-auto px-4 py-6 space-y-6">
        <ChartPanel entries={entries} />
        <TargetsPanel entries={entries} />
        <FoodJournalPanel onEntriesChange={handleEntriesChange} />
        
      </main>

      {/* Settings Modal */}
      <SettingsModal open={settingsOpen} onOpenChange={setSettingsOpen} />
      <UpgradeModal open={upgradeOpen} onOpenChange={setUpgradeOpen} />
    </div>
  );
};

export default Index;
