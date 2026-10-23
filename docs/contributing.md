# Contributing

## Requirements

- Node.js 24
- pnpm 10.28.1 (`packageManager` in `package.json`)

## Checks

```bash
pnpm install
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm test:e2e
```

## Commit shape

Use a small conventional commit for each cohesive change, for example `feat: add json formatter and validator`.

Do not commit `.env` files, credentials, generated secrets, or private sample documents.

## New tools

Follow `docs/architecture.md`. Keep parsing and transformation code independent of the component so it can be tested without the browser.
