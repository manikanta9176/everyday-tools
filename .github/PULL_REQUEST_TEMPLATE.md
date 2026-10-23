## Summary

<!-- What changed, and why? -->

## Checks

- [ ] `pnpm lint`
- [ ] `pnpm typecheck`
- [ ] `pnpm test`
- [ ] `pnpm build`
- [ ] `pnpm test:e2e`, if a page or user flow changed

## Privacy

- [ ] Tool input still stays in the browser. This does not add a route that receives pasted text, secrets, images, or documents.
- [ ] Secrets still come from `crypto.getRandomValues()` or `crypto.randomUUID()`.
- [ ] No `.env` file, credential, generated secret, or private sample is in the diff.

## Notes

<!-- Screenshots or anything a reviewer should try. -->
