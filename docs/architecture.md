# Architecture

Tools is a Next.js App Router application. Tool work runs in the browser. The public origin is `https://tools.manikanta.net`.

## Boundaries

- `src/app` owns routes, metadata, and the document shell.
- `src/components` owns shared layout, search, and controls.
- `src/features/tools` owns each tool family: pure operations plus the client UI that calls them.
- `src/lib/tool-registry.ts` is the only catalog. Navigation, search, related links, and the tool inventory are derived from it.

A tool is `ready` only when its operation works. Planned work stays in `docs/tool-inventory.md` and `docs/roadmap.md`.

## Loading

The homepage and registry load tool metadata only. Image codecs, PDF libraries, Prettier, and other heavy modules are imported from the tool that needs them.

## Privacy

Favorites and recently used tools are stored in `localStorage` as tool ids and timestamps. Inputs, outputs, filenames, and secrets are not written to URLs or to the server.

## Adding a tool

1. Add a tested function under `src/features/tools/<family>/`.
2. Add a client view that calls that function and handles invalid input.
3. Register the tool in `src/lib/tool-registry.ts` with `status: "ready"`.
4. Point the loader map at the view.
5. Cover the operation with unit tests and, for a primary workflow, a Playwright check.
6. Update `docs/tool-inventory.md`.
