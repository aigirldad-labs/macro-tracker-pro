// Target calculations as per PRD formulas

export interface Targets {
  dailyCalories: number;
  proteinGrams: number;
  proteinCalories: number;
  fatCalories: number;
  fatGrams: number;
  carbCalories: number;
  carbGrams: number;
}

export function calculateTargets(goalWeightLb: number): Targets {
  const dailyCalories = Math.round(goalWeightLb * 12);
  const proteinGrams = Math.round(goalWeightLb * 1);
  const proteinCalories = Math.round(proteinGrams * 4);
  const fatCalories = Math.round(dailyCalories * 0.25);
  const fatGrams = Math.round(fatCalories / 9);
  const carbCalories = dailyCalories - proteinCalories - fatCalories;
  const carbGrams = Math.round(carbCalories / 4);

  return {
    dailyCalories,
    proteinGrams,
    proteinCalories,
    fatCalories,
    fatGrams,
    carbCalories,
    carbGrams,
  };
}

export const FORMULAS = {
  dailyCalories: {
    title: 'How this is calculated',
    formula: 'Daily calories = goal weight x 12',
    example: (weight: number) => `Example: ${weight} lb x 12 = ${weight * 12} cal/day`,
  },
  protein: {
    title: 'How this is calculated',
    formula: 'Protein grams = goal weight x 1\nProtein calories = protein grams x 4',
    example: (weight: number) => `Example: ${weight} lb -> ${weight} g -> ${weight * 4} cal`,
  },
  fat: {
    title: 'How this is calculated',
    formula: 'Fat calories = daily calories x 0.25\nFat grams = fat calories / 9',
    example: (weight: number) => {
      const dailyCal = weight * 12;
      const fatCal = Math.round(dailyCal * 0.25);
      const fatG = Math.round(fatCal / 9);
      return `Example: ${dailyCal} cal -> ${fatCal} cal -> ${fatG} g`;
    },
  },
  carbs: {
    title: 'How this is calculated',
    formula: 'Carb calories = daily calories - protein calories - fat calories\nCarb grams = carb calories / 4',
    example: (weight: number) => {
      const dailyCal = weight * 12;
      const proteinCal = weight * 4;
      const fatCal = Math.round(dailyCal * 0.25);
      const carbCal = dailyCal - proteinCal - fatCal;
      const carbG = Math.round(carbCal / 4);
      return `Example: ${dailyCal} - ${proteinCal} - ${fatCal} = ${carbCal} cal -> ${carbG} g`;
    },
  },
};
