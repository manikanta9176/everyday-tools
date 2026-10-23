# Privacy model

Tools is built so ordinary tool use does not require an account or an upload.

## Processed locally

Text, secrets, colors, JSON and other structured text, images, and PDFs are processed with browser APIs and libraries that run on the device. The application does not provide an endpoint that accepts tool input.

Generated secrets use the Web Crypto API. They are not logged.

## Stored on the device

When you favorite a tool or open one, the browser stores the tool id and, for recent tools, a timestamp. Color chips you pin in Color Studio stay in `localStorage` only after you use that control. Nothing else about the input is kept.

Clearing site data removes those preferences.

## Network

The site loads its own HTML, CSS, JavaScript, and icons from the host you opened. It does not call an analytics service, and it does not send pasted text, files, or tokens to an application API.

Fonts are self-hosted by Next.js. There is no third-party font request at runtime.

A service worker is intentionally not registered. Offline caching of pages could retain private work, so installability is limited to the web app manifest.

## What this does not cover

Your browser, extensions, employer device management, and the host that serves the static site can still see requests for the application itself. Decoding a JWT does not verify it. Approximate color conversions are not a print contract.
