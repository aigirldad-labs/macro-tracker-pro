// LocalStorage keys as per PRD
const KEYS = {
  goalWeight: 'macroPlanner.goalWeightLb',
  entries: 'macroPlanner.entries',
  apiKey: 'macroPlanner.settings.apiKey',
} as const;

// Types
export interface FoodEntry {
  id: string;
  datetime: string; // ISO string
  dateKey: string; // YYYY-MM-DD local
  label: string;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  calories: number;
  source: 'manual' | 'ai';
  rawText: string | null;
}

// UUID generator
function generateId(): string {
  return crypto.randomUUID();
}

// Date key from datetime
export function getDateKey(datetime: string): string {
  const date = new Date(datetime);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Calculate calories from macros
export function calculateCalories(protein: number, carbs: number, fat: number): number {
  return Math.round(protein * 4 + carbs * 4 + fat * 9);
}

// Goal Repository
export const GoalRepository = {
  get(): number | null {
    const stored = localStorage.getItem(KEYS.goalWeight);
    if (!stored) return null;
    const parsed = parseFloat(stored);
    return isNaN(parsed) || parsed <= 0 ? null : parsed;
  },

  set(weight: number): void {
    if (weight > 0) {
      localStorage.setItem(KEYS.goalWeight, String(weight));
    }
  },

  clear(): void {
    localStorage.removeItem(KEYS.goalWeight);
  },
};

// Entries Repository
export const EntriesRepository = {
  getAll(): FoodEntry[] {
    try {
      const stored = localStorage.getItem(KEYS.entries);
      if (!stored) return [];
      const parsed = JSON.parse(stored);
      if (!Array.isArray(parsed)) {
        this.clear();
        return [];
      }
      // Sort by datetime desc
      return parsed.sort((a, b) => 
        new Date(b.datetime).getTime() - new Date(a.datetime).getTime()
      );
    } catch {
      // Corruption handling
      this.clear();
      return [];
    }
  },

  add(entry: Omit<FoodEntry, 'id' | 'dateKey' | 'calories'>): FoodEntry {
    const entries = this.getAll();
    const newEntry: FoodEntry = {
      ...entry,
      id: generateId(),
      dateKey: getDateKey(entry.datetime),
      calories: calculateCalories(entry.protein_g, entry.carbs_g, entry.fat_g),
    };
    entries.push(newEntry);
    localStorage.setItem(KEYS.entries, JSON.stringify(entries));
    return newEntry;
  },

  update(id: string, updates: Partial<Omit<FoodEntry, 'id'>>): FoodEntry | null {
    const entries = this.getAll();
    const index = entries.findIndex(e => e.id === id);
    if (index === -1) return null;

    const updated = { ...entries[index], ...updates };
    // Recalculate dateKey and calories
    updated.dateKey = getDateKey(updated.datetime);
    updated.calories = calculateCalories(updated.protein_g, updated.carbs_g, updated.fat_g);
    
    entries[index] = updated;
    localStorage.setItem(KEYS.entries, JSON.stringify(entries));
    return updated;
  },

  delete(id: string): boolean {
    const entries = this.getAll();
    const filtered = entries.filter(e => e.id !== id);
    if (filtered.length === entries.length) return false;
    localStorage.setItem(KEYS.entries, JSON.stringify(filtered));
    return true;
  },

  clear(): void {
    localStorage.removeItem(KEYS.entries);
  },
};

// Settings Repository
export const SettingsRepository = {
  getApiKey(): string | null {
    return localStorage.getItem(KEYS.apiKey);
  },

  setApiKey(key: string): void {
    localStorage.setItem(KEYS.apiKey, key);
  },

  clearApiKey(): void {
    localStorage.removeItem(KEYS.apiKey);
  },

  clearAll(): void {
    GoalRepository.clear();
    EntriesRepository.clear();
    this.clearApiKey();
  },
};
