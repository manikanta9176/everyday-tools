# Security

Everyday Tools processes untrusted text and files locally.

## Supported use

- Generate secrets only with the Web Crypto API.
- Treat uploaded files as untrusted. The app limits file size and does not execute them.
- User-controlled strings are rendered as text. Markdown preview escapes HTML.
- SVG is not rendered as live markup from an upload.

## Reporting

Please open a private GitHub security advisory on [manikanta9176/everyday-tools](https://github.com/manikanta9176/everyday-tools) or email the maintainer through the address listed on that GitHub profile. Describe the behavior, the tool involved, and a safe reproduction. Do not include real secrets.

## Out of scope

- JWT decoding is not signature verification.
- The optional HTTP request helper, if enabled, is the browser's `fetch` and is subject to CORS. It is not a proxy.
- Color and CMYK conversions are not print-certified.
