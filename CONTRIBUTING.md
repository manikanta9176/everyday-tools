# Contributing

Thanks for improving Tools. The maintainer pushes finished work directly to `main`. If you want to contribute, use a pull request and follow the instructions below.

## Before you change a tool

Read [docs/architecture.md](docs/architecture.md) and [docs/privacy-model.md](docs/privacy-model.md).

- Process tool input in the browser. Do not add a server route that receives pasted text, secrets, images, or documents.
- Generate secrets, passwords, tokens, and API keys with `crypto.getRandomValues()` or `crypto.randomUUID()`. Do not use `Math.random()`.
- Register a tool in `apps/web/src/lib/tool-registry.ts` only when its operation works and has tests.
- Keep transformation logic in testable modules, separate from React components.
- Lazy-load image, PDF, and code-formatting libraries.
- Do not log generated secrets or raw user input.
- Store favorites and recent tools as identifiers only.

## Setup

- Node.js 24 (see `.nvmrc`)
- pnpm 10.28.1

```bash
pnpm install
pnpm dev
```

The site is the `web` app in `apps/web`. Open [http://localhost:3000](http://localhost:3000).

## Checks

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm test:e2e
```

## Adding a tool

1. Add a tested function under `apps/web/src/features/tools/<family>/`. Use a workspace package in `packages/tools/<name>` when that logic is shared.
2. Add a client view that calls the function and handles invalid input.
3. Register the tool in `apps/web/src/lib/tool-registry.ts` with `status: "ready"`.
4. Point the loader in `apps/web/src/features/tools/ui/tool-host.tsx` at that view.
5. Cover the operation with unit tests and, for a primary workflow, a Playwright check.
6. Update [docs/tool-inventory.md](docs/tool-inventory.md).

## Report an issue

Use the issue form. A blank issue is not available.

- [Bug report](https://github.com/manikanta9176/everyday-tools/issues/new?template=bug.yml) for a tool that did the wrong thing. Name the tool, the browser, the steps, and a short fake example.
- [Tool request](https://github.com/manikanta9176/everyday-tools/issues/new?template=tool-request.yml) for a new tool or a change to one. Describe the job and the result you want.
- Do not paste real secrets, tokens, passwords, or private documents.
- Do not use an issue for a vulnerability. Use [SECURITY.md](SECURITY.md).

## Open a pull request

1. Fork the repository and branch from `main`.
2. Keep the change small. Use a conventional commit, for example `feat: add json formatter and validator`.
3. Do not commit `.env` files, credentials, generated secrets, or private sample documents.
4. Open a pull request. GitHub fills in the template. Complete it:
   - Say what changed and why.
   - Check off `pnpm lint`, `pnpm typecheck`, `pnpm test`, and `pnpm build`. Run `pnpm test:e2e` when a page or user flow changed.
   - Confirm tool input still stays in the browser, and that the diff has no secret or private sample.

## Security

Report a vulnerability through [SECURITY.md](SECURITY.md). Do not open a public issue for one.
