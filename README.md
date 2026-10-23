# Everyday Tools

Small tools. Less busywork.

Everyday Tools is a privacy-first collection of utilities for the work people repeat: secrets, encoding, JSON, color, images, text, time, and documents. Processing happens in the browser. There is no account and no upload of tool input to an application server.

## Requirements

- Node.js 24 (see `.nvmrc`)
- pnpm 10.28.1

## Develop

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Quality checks

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm test:e2e
```

## Privacy

See [docs/privacy-model.md](docs/privacy-model.md). Tool contents stay on the device. Favorites and recent tools are stored locally as identifiers.

Set `NEXT_PUBLIC_SITE_URL` when you know the public origin. It is used only for canonical URLs and the sitemap.

## Documentation

- [Architecture](docs/architecture.md)
- [Tool inventory](docs/tool-inventory.md)
- [Roadmap](docs/roadmap.md)
- [Contributing](CONTRIBUTING.md)
- [Security](SECURITY.md)

## License

MIT. The passphrase word list is the EFF Short Wordlist 2.0, used under [CC BY 3.0](https://creativecommons.org/licenses/by/3.0/) with attribution to the Electronic Frontier Foundation.
