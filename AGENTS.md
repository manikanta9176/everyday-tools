<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Tools

This repository is a local-first utility website. Read `docs/architecture.md` and `docs/privacy-model.md` before adding tools.

- Register ready tools only in `src/lib/tool-registry.ts`.
- Keep operations testable and separate from UI.
- Do not send tool input to a server route.
- Use Web Crypto for secrets.
- Lazy-load PDF, image, and formatter libraries.
