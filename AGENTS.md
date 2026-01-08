# AGENTS

This file describes how automated agents should work in this repo.

## Basics

- Keep changes minimal and scoped to the request.
- Prefer TypeScript + React conventions already in the codebase.
- Avoid introducing new dependencies unless requested.
- Use ASCII text unless the file already contains Unicode.

## Dev Workflow

- Install deps: `npm install`
- Run locally: `npm run dev`
- Build: `npm run build`

## UI/UX

- Match existing UI patterns and Tailwind utility usage.
- Avoid breaking layouts on mobile.

## Data & Storage

- LocalStorage keys live in `src/lib/repositories.ts`.
- If you add new stored data, document it in `README.md`.

## Testing

- No automated test suite configured yet.
- If you add tests, document how to run them in `README.md`.
