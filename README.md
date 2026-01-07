# Macro Mapper

Macro Mapper helps you set daily macro targets and log meals.

## Deployed

- https://aigirldad-labs.github.io/macro-tracker-pro

## Getting Started (Local Development)

Prerequisites:
- Node.js 20 LTS
- npm 9+ (bundled with Node)

Install and run:

```sh
npm install
npm run dev
```

Vite will print the local URL (usually http://localhost:5173/).

## Dependencies

- Vite
- React 18
- TypeScript
- Tailwind CSS
- shadcn/ui
- Radix UI
- TanStack Query
- Recharts

## Example Meals (Estimates)

Macros below are reasonable estimates and will vary by brand and portion size.

- Peanut butter and jelly: 14g protein / 44g carbs / 16g fat (~376 cal)
- Chicken broccoli and rice: 55g protein / 50g carbs / 6g fat (~474 cal)
- Pizza (2 slices): 24g protein / 64g carbs / 22g fat (~550 cal)
- Ice cream (3 scoops): 9g protein / 90g carbs / 30g fat (~666 cal)
- Protein shake: 25g protein / 5g carbs / 2g fat (~138 cal)
- Dozen eggs: 72g protein / 2g carbs / 60g fat (~836 cal)

## Seed Example Data

This will overwrite any existing food entries in local storage.

1. Start the dev server: `npm run dev`
2. Open the app in your browser
3. Open DevTools Console and run:

```js
(() => {
  const entries = [
    { label: 'Peanut butter and jelly', protein_g: 14, carbs_g: 44, fat_g: 16 },
    { label: 'Chicken broccoli and rice', protein_g: 55, carbs_g: 50, fat_g: 6 },
    { label: 'Pizza (2 slices)', protein_g: 24, carbs_g: 64, fat_g: 22 },
    { label: 'Ice cream (3 scoops)', protein_g: 9, carbs_g: 90, fat_g: 30 },
    { label: 'Protein shake', protein_g: 25, carbs_g: 5, fat_g: 2 },
    { label: 'Dozen eggs', protein_g: 72, carbs_g: 2, fat_g: 60 },
  ];

  const now = new Date();
  const minutesStep = 120;

  const makeId = () =>
    (crypto.randomUUID && crypto.randomUUID()) ||
    `seed-${Date.now()}-${Math.random().toString(16).slice(2)}`;

  const seeded = entries.map((entry, index) => {
    const dt = new Date(now);
    dt.setMinutes(now.getMinutes() - index * minutesStep);

    const dateKey = [
      dt.getFullYear(),
      String(dt.getMonth() + 1).padStart(2, '0'),
      String(dt.getDate()).padStart(2, '0'),
    ].join('-');

    const calories = Math.round(
      entry.protein_g * 4 + entry.carbs_g * 4 + entry.fat_g * 9,
    );

    return {
      id: makeId(),
      datetime: dt.toISOString(),
      dateKey,
      calories,
      source: 'manual',
      rawText: null,
      ...entry,
    };
  });

  localStorage.setItem('macroPlanner.entries', JSON.stringify(seeded));
  console.log(`Seeded ${seeded.length} demo entries.`);
})();
```

Refresh the page to see the seeded entries.

## TODO

- Add cloud persistence and real-time sync.
- Enable collaboration and friendly competition.
- Add a meal planner.
- Add an agentic shopping workflow.
- Offer an upgrade flow to capture interest.

## Contact

- Email: [aigirldad.labs@gmail.com](mailto:aigirldad.labs@gmail.com)
