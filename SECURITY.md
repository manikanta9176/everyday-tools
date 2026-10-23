# Security

Tools processes untrusted text and files locally.

## Supported use

- Generate secrets only with the Web Crypto API.
- Treat uploaded files as untrusted. The app limits file size and does not execute them.
- User-controlled strings are rendered as text. Markdown preview escapes HTML.
- SVG is not rendered as live markup from an upload.

## Reporting

Open a private advisory on [manikanta9176/everyday-tools](https://github.com/manikanta9176/everyday-tools/security/advisories/new), or email the address listed on the [GitHub profile](https://github.com/manikanta9176). Describe the behavior, the tool involved, and a safe reproduction. Do not include real secrets. Do not open a public issue for a vulnerability.

## Out of scope

- JWT decoding is not signature verification.
- The optional HTTP request helper, if enabled, is the browser's `fetch` and is subject to CORS. It is not a proxy.
- Color and CMYK conversions are not print-certified.
