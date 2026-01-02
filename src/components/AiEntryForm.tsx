import { useState, useEffect } from 'react';
import { Mic, MicOff, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { FoodEntry, calculateCalories, SettingsRepository } from '@/lib/repositories';
import { parseFood } from '@/lib/ai-parse';
import { useSpeechToText } from '@/hooks/use-speech-to-text';

type ParseState = 'idle' | 'missing-key' | 'ready' | 'parsing' | 'success' | 'error';

interface AiEntryFormProps {
  onSubmit: (entry: Omit<FoodEntry, 'id' | 'dateKey' | 'calories'>) => void;
  onOpenSettings: () => void;
}

export function AiEntryForm({ onSubmit, onOpenSettings }: AiEntryFormProps) {
  const [label, setLabel] = useState('');
  const [text, setText] = useState('');
  const [datetime, setDatetime] = useState(() => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  });
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');
  const [parseState, setParseState] = useState<ParseState>('idle');
  const [parseError, setParseError] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  const speech = useSpeechToText();

  // Check API key on mount and text change
  useEffect(() => {
    const apiKey = SettingsRepository.getApiKey();
    if (!apiKey) {
      setParseState('missing-key');
    } else if (text.length >= 10) {
      setParseState('ready');
    } else {
      setParseState('idle');
    }
  }, [text]);

  // Append speech transcript to text
  useEffect(() => {
    if (speech.transcript) {
      setText(prev => prev + (prev ? ' ' : '') + speech.transcript);
    }
  }, [speech.transcript]);

  const proteinNum = parseFloat(protein) || 0;
  const carbsNum = parseFloat(carbs) || 0;
  const fatNum = parseFloat(fat) || 0;
  const calories = calculateCalories(proteinNum, carbsNum, fatNum);

  const handleParse = async () => {
    const apiKey = SettingsRepository.getApiKey();
    if (!apiKey) {
      setParseState('missing-key');
      return;
    }

    if (text.length < 10) {
      setParseError('Please describe your meal in more detail.');
      return;
    }

    setParseState('parsing');
    setParseError(null);

    const result = await parseFood(text, apiKey);

    if (result.success) {
      setProtein(String(result.data.protein_g));
      setCarbs(String(result.data.carbs_g));
      setFat(String(result.data.fat_g));
      setParseState('success');
    } else {
      // result.success is false, so message exists
      const errorResult = result as { success: false; error: string; message: string };
      setParseError(errorResult.message);
      setParseState('error');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (proteinNum < 0 || carbsNum < 0 || fatNum < 0) {
      setValidationError("Macros can't be negative.");
      return;
    }

    if (proteinNum === 0 && carbsNum === 0 && fatNum === 0) {
      setValidationError('Enter at least one macro value.');
      return;
    }

    onSubmit({
      datetime: new Date(datetime).toISOString(),
      label: label.trim(),
      protein_g: proteinNum,
      carbs_g: carbsNum,
      fat_g: fatNum,
      source: 'ai',
      rawText: text,
    });

    // Reset form
    setLabel('');
    setText('');
    setProtein('');
    setCarbs('');
    setFat('');
    setParseState('idle');
    setDatetime(() => {
      const now = new Date();
      now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
      return now.toISOString().slice(0, 16);
    });
  };

  const handleMicClick = () => {
    if (speech.state === 'listening') {
      speech.stopListening();
    } else {
      speech.startListening();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="ai-label" className="text-sm text-foreground">Food (optional)</Label>
        <Input
          id="ai-label"
          placeholder="e.g., Breakfast"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          className="bg-input border-border"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="meal-text" className="text-sm text-foreground">Describe what you ate</Label>
        <div className="relative">
          <Textarea
            id="meal-text"
            placeholder="Example: I had 2 eggs, 2 slices of bacon, and a piece of toast with butter."
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="bg-input border-border min-h-[100px] pr-12"
          />
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="absolute right-2 top-2"
                onClick={handleMicClick}
                disabled={!speech.isSupported}
              >
                {speech.state === 'listening' ? (
                  <MicOff className="h-4 w-4 text-destructive" />
                ) : (
                  <Mic className="h-4 w-4 text-muted-foreground" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {!speech.isSupported 
                ? 'Voice input not supported'
                : speech.state === 'listening'
                  ? 'Listening… Tap to stop'
                  : 'Voice input'}
            </TooltipContent>
          </Tooltip>
        </div>
      </div>

      {parseState === 'missing-key' && (
        <div className="p-3 bg-muted rounded-lg text-sm">
          <span className="text-muted-foreground">AI parsing requires an API key. </span>
          <button
            type="button"
            onClick={onOpenSettings}
            className="text-primary hover:underline font-medium"
          >
            Open Settings
          </button>
        </div>
      )}

      {parseError && (
        <p className="text-sm text-destructive">{parseError}</p>
      )}

      <Button
        type="button"
        variant="secondary"
        onClick={handleParse}
        disabled={parseState === 'parsing' || parseState === 'missing-key' || text.length < 10}
        className="w-full"
      >
        {parseState === 'parsing' ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Parsing…
          </>
        ) : parseState === 'error' ? (
          'Try Again'
        ) : (
          'Parse Macros'
        )}
      </Button>

      {parseState === 'success' && (
        <p className="text-sm text-muted-foreground">
          Macros filled. Review and edit before saving.
        </p>
      )}

      <div className="space-y-2">
        <Label htmlFor="ai-datetime" className="text-sm text-foreground">Date & Time</Label>
        <Input
          id="ai-datetime"
          type="datetime-local"
          value={datetime}
          onChange={(e) => setDatetime(e.target.value)}
          className="bg-input border-border"
        />
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="space-y-2">
          <Label htmlFor="ai-protein" className="text-sm text-foreground">Protein (g)</Label>
          <Input
            id="ai-protein"
            type="number"
            min="0"
            placeholder="0"
            value={protein}
            onChange={(e) => setProtein(e.target.value)}
            className="bg-input border-border"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="ai-carbs" className="text-sm text-foreground">Carbs (g)</Label>
          <Input
            id="ai-carbs"
            type="number"
            min="0"
            placeholder="0"
            value={carbs}
            onChange={(e) => setCarbs(e.target.value)}
            className="bg-input border-border"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="ai-fat" className="text-sm text-foreground">Fat (g)</Label>
          <Input
            id="ai-fat"
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
        <span className="text-sm font-medium text-foreground">{calories} kcal</span>
      </div>

      {validationError && (
        <p className="text-sm text-destructive">{validationError}</p>
      )}

      <Button type="submit" className="w-full">
        Save Entry
      </Button>
    </form>
  );
}
