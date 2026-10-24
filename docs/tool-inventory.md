# Tool inventory

This file is the human-readable catalog. The application only exposes tools whose registry status is `ready`.

Status values: `ready` (works in the app). The registry is the source of truth for navigation.

| Tool                                                            | Priority | Status  |
| --------------------------------------------------------------- | -------- | ------- |
| Random secret and token generator                               | P0       | ready |
| Password generator                                              | P0       | ready |
| Passphrase generator                                            | P0       | ready |
| UUID generator                                                  | P0       | ready |
| API key generator                                               | P0       | ready |
| Base64 and Base64URL codecs                                     | P0       | ready |
| Hex, URL, HTML, JSON string, Unicode, and binary codecs         | P0       | ready |
| Data URL, UTF-8 counter, query string, MIME lookup              | P0       | ready |
| JSON formatter, minifier, tree, sort, and diff                  | P0       | ready |
| Text counters, case conversion, line tools, and diff            | P0       | ready |
| Timestamp converter                                             | P0       | ready |
| Unit converter                                                  | P0       | ready |
| QR code generator                                               | P0       | ready |
| QR file share                                                   | P1       | ready |
| Color converter                                                 | P0       | ready |
| Palette, contrast, gradient, and CSS variables                  | P0       | ready |
| Image compress, resize, convert, crop, rotate, and flip         | P0       | ready |
| Image inspector, metadata, data URL, and colors                 | P1       | ready |
| CSV, YAML, XML, TOML, env diff, JSON Schema, JSONPath           | P1       | ready |
| Code formatters, SQL, regex, cron, hash, JWT                    | P1       | ready |
| URL tools, cURL builder, HTTP status, CIDR                      | P1       | ready |
| Configuration generators                                        | P1       | ready |
| Date math and everyday calculators                              | P1       | ready |
| PDF utilities                                                   | P1       | ready |
| Markdown, lorem, placeholder image, license, and README helpers | P1       | ready |

These groups are available from search and the sidebar.

Not shipped, and not shown as tools:

- Barcode generation
- A general HTTP request tester or server-side proxy
- DNS or external IP lookup
- PDF text extraction and PDF compression
- A service worker for offline caching

Those stay out until they can do the real job without overstating privacy or capability.
