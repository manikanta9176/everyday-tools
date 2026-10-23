import type { CategoryId } from "@/lib/categories";
import type { ToolDefinition, ToolIconName } from "@/lib/tool-types";

type Draft = Omit<ToolDefinition, "status" | "supportsLocalProcessing" | "id"> & { icon: ToolIconName };

const drafts: Draft[] = [
  tool("secrets", "random-secret-generator", "Random Secret Generator", "Generate a cryptographically secure token and a separate OpenSSL command.", ["token generator", "openssl"], ["generate secret", "openssl rand", "base64 token"], { featured: true, quickAction: true, icon: "key", related: ["password-generator", "api-key-generator", "uuid-generator"] }),
  tool("secrets", "password-generator", "Password Generator", "Create a password from the character sets you choose.", ["secure password"], ["password", "exclude ambiguous"], { featured: true, icon: "lock", related: ["passphrase-generator", "random-secret-generator"] }),
  tool("secrets", "passphrase-generator", "Passphrase Generator", "Build a passphrase from the EFF short wordlist.", ["diceware"], ["passphrase", "word list"], { icon: "key", related: ["password-generator"] }),
  tool("secrets", "uuid-generator", "UUID Generator", "Generate UUID v4 and UUID v7 identifiers.", ["guid"], ["uuid", "uuid v7"], { icon: "fingerprint", related: ["random-secret-generator"] }),
  tool("secrets", "api-key-generator", "API Key Generator", "Create a prefixed random API key.", ["token"], ["api key", "prefix"], { icon: "key", related: ["random-secret-generator"] }),
  tool("encoding", "base64-codec", "Base64", "Encode and decode Base64 text, including Unicode.", ["base64 encode"], ["base64", "decode base64"], { featured: true, icon: "binary", related: ["base64url-codec", "hex-codec"] }),
  tool("encoding", "base64url-codec", "Base64URL", "Encode and decode URL-safe Base64.", ["base64 url"], ["base64url"], { icon: "binary", related: ["base64-codec", "jwt-inspector"] }),
  tool("encoding", "hex-codec", "Hex Encoder", "Convert text to hexadecimal and back.", ["hex to text"], ["hex", "hexadecimal"], { icon: "binary", related: ["binary-codec", "base64-codec"] }),
  tool("encoding", "url-codec", "URL Encoder", "Percent-encode and decode text.", ["encodeURIComponent"], ["url encode", "percent encoding"], { icon: "globe", related: ["query-string", "url-parser"] }),
  tool("encoding", "html-entities", "HTML Entities", "Escape and unescape HTML characters.", ["html encode"], ["html entity"], { icon: "code", related: ["json-escape"] }),
  tool("encoding", "json-escape", "JSON String Escape", "Escape a value for use inside a JSON string.", ["unescape json"], ["json escape"], { icon: "braces", related: ["json-formatter"] }),
  tool("encoding", "unicode-inspector", "Unicode Inspector", "Show code points, UTF-8 bytes, and escape sequences.", ["code point"], ["unicode", "utf-8"], { icon: "type", related: ["utf8-byte-counter"] }),
  tool("encoding", "binary-codec", "Binary Text", "Convert text to binary bytes and back.", ["text to binary"], ["binary"], { icon: "binary", related: ["hex-codec"] }),
  tool("encoding", "data-url-codec", "Data URL", "Build or read a data URL.", ["data uri"], ["data url"], { icon: "file", related: ["image-data-url", "base64-codec"] }),
  tool("encoding", "utf8-byte-counter", "UTF-8 Byte Counter", "Count characters, UTF-16 units, and UTF-8 bytes.", ["byte length"], ["utf-8 bytes"], { icon: "type", related: ["text-counter"] }),
  tool("encoding", "query-string", "Query String", "Parse and build URL query parameters.", ["query params"], ["query string", "search params"], { icon: "globe", related: ["url-parser", "utm-builder"] }),
  tool("encoding", "mime-types", "MIME Types", "Look up common file types and extensions.", ["content type"], ["mime type"], { icon: "file", related: ["data-url-codec"] }),
  tool("data", "json-formatter", "JSON Formatter", "Format, minify, sort, and validate JSON.", ["prettify json", "json validator"], ["format json", "validate json"], { featured: true, quickAction: true, icon: "braces", related: ["json-diff", "jsonpath", "json-to-typescript"] }),
  tool("data", "json-diff", "JSON Diff", "Compare two JSON values.", ["compare json"], ["json diff"], { icon: "diff", related: ["text-diff", "json-formatter"] }),
  tool("data", "csv-json", "CSV and JSON", "Convert CSV to JSON and JSON to CSV.", ["csv converter"], ["csv to json", "json to csv"], { icon: "file", related: ["json-formatter"] }),
  tool("data", "yaml-json", "YAML and JSON", "Convert between YAML and JSON.", ["yaml converter"], ["yaml to json"], { icon: "file", related: ["toml-json", "json-formatter"] }),
  tool("data", "xml-tools", "XML Tools", "Format XML and convert it to JSON.", ["xml formatter"], ["xml to json"], { icon: "code", related: ["json-formatter"] }),
  tool("data", "toml-json", "TOML and JSON", "Convert between TOML and JSON.", ["toml converter"], ["toml"], { icon: "file", related: ["yaml-json"] }),
  tool("data", "json-to-typescript", "JSON to TypeScript", "Draft TypeScript interfaces from a JSON sample.", ["json types"], ["json to typescript"], { icon: "code", related: ["json-formatter"] }),
  tool("data", "env-diff", "Env Diff", "Compare .env files and mask likely secrets.", ["dotenv diff"], ["compare env", ".env"], { icon: "diff", related: ["env-template", "text-diff"] }),
  tool("data", "json-schema", "JSON Schema", "Validate JSON against a JSON Schema.", ["ajv"], ["json schema"], { icon: "braces", related: ["json-formatter"] }),
  tool("data", "jsonpath", "JSONPath", "Query JSON with a practical JSONPath subset.", ["json path"], ["jsonpath"], { icon: "braces", related: ["json-formatter"] }),
  tool("color", "color-converter", "Color Converter", "Convert HEX, RGB, HSL, OKLCH, and other color formats.", ["hex to rgb", "color picker"], ["hex to rgb", "convert color", "oklch"], { featured: true, quickAction: true, icon: "palette", related: ["contrast-checker", "palette-generator", "gradient-generator"] }),
  tool("color", "palette-generator", "Palette Generator", "Build complementary, analogous, triadic, and tetradic sets.", ["color harmony"], ["palette", "complementary"], { icon: "palette", related: ["color-converter", "gradient-generator"] }),
  tool("color", "contrast-checker", "Contrast Checker", "Check WCAG contrast for text and UI.", ["wcag"], ["contrast ratio", "wcag"], { icon: "palette", related: ["color-converter"] }),
  tool("color", "gradient-generator", "Gradient Generator", "Create a CSS linear gradient.", ["css gradient"], ["gradient"], { icon: "palette", related: ["color-converter"] }),
  tool("color", "css-variables", "CSS Variables", "Convert CSS custom properties to JSON and back.", ["css vars"], ["css variables"], { icon: "code", related: ["color-converter"] }),
  tool("image", "image-compressor", "Image Compressor", "Compress a JPEG, PNG, or WebP in the browser.", ["compress photo", "image optimizer"], ["compress photo", "compress image"], { featured: true, quickAction: true, icon: "image", related: ["image-resizer", "image-converter"] }),
  tool("image", "image-resizer", "Image Resizer", "Resize an image by pixels, percent, or preset.", ["resize photo"], ["resize image"], { icon: "image", related: ["image-compressor", "image-transform"] }),
  tool("image", "image-converter", "Image Converter", "Convert between PNG, JPEG, and WebP.", ["png to webp"], ["convert image"], { icon: "image", related: ["image-compressor"] }),
  tool("image", "image-transform", "Crop, Rotate, and Flip", "Crop an image and rotate or flip it.", ["rotate image"], ["crop image", "flip image"], { icon: "image", related: ["image-resizer"] }),
  tool("image", "image-inspector", "Image Inspector", "Read dimensions, aspect ratio, and file size.", ["image size"], ["image dimensions"], { icon: "image", related: ["image-metadata"] }),
  tool("image", "image-metadata", "Image Metadata", "View EXIF data and download a copy without it.", ["exif remover"], ["exif", "remove metadata"], { icon: "image", related: ["image-inspector"] }),
  tool("image", "image-data-url", "Image to Data URL", "Turn an image into a data URL.", ["image base64"], ["image to base64"], { icon: "image", related: ["data-url-codec"] }),
  tool("image", "image-colors", "Image Colors", "Extract a small palette from an image.", ["dominant colors"], ["extract colors"], { icon: "palette", related: ["color-converter"] }),
  tool("text", "text-counter", "Text Counter", "Count words, characters, lines, and reading time.", ["word count"], ["word counter", "character count"], { icon: "type", related: ["case-converter", "utf8-byte-counter"] }),
  tool("text", "case-converter", "Case Converter", "Convert case and identifier style.", ["camel case", "kebab case"], ["title case", "snake case"], { icon: "type", related: ["slug-generator"] }),
  tool("text", "line-tools", "Line Tools", "Sort, dedupe, trim, and renumber lines.", ["sort lines"], ["remove duplicate lines"], { icon: "type", related: ["text-diff"] }),
  tool("text", "text-diff", "Text Diff", "Compare two pieces of text.", ["diff text"], ["text diff", "compare text"], { icon: "diff", related: ["json-diff", "env-diff"] }),
  tool("text", "find-replace", "Find and Replace", "Replace literal text or a regular expression.", ["replace text"], ["find and replace"], { icon: "type", related: ["regex-tester"] }),
  tool("text", "slug-generator", "Slug Generator", "Turn a title into a URL slug.", ["url slug"], ["slug"], { icon: "type", related: ["case-converter", "url-parser"] }),
  tool("text", "lorem-ipsum", "Lorem Ipsum", "Generate placeholder paragraphs.", ["dummy text"], ["lorem ipsum"], { icon: "type", related: ["placeholder-image"] }),
  tool("text", "markdown-preview", "Markdown Preview", "Preview a safe subset of Markdown.", ["md preview"], ["markdown preview"], { icon: "fileText", related: ["markdown-table"] }),
  tool("text", "markdown-table", "Markdown Table", "Build a Markdown table.", ["md table"], ["markdown table"], { icon: "file", related: ["markdown-preview", "csv-json"] }),
  tool("code", "code-formatter", "Code Formatter", "Format JavaScript, TypeScript, HTML, CSS, Markdown, and JSON.", ["prettier"], ["format javascript", "format css"], { icon: "code", related: ["sql-formatter"] }),
  tool("code", "sql-formatter", "SQL Formatter", "Format a SQL statement.", ["format sql"], ["sql formatter"], { icon: "code", related: ["code-formatter"] }),
  tool("code", "regex-tester", "Regex Tester", "Test a regular expression and highlight matches.", ["regexp"], ["regex", "regular expression"], { icon: "code", related: ["find-replace"] }),
  tool("code", "hash-generator", "Hash Generator", "Calculate SHA-1, SHA-256, SHA-384, or SHA-512.", ["sha256"], ["hash", "checksum"], { icon: "hash", related: ["jwt-inspector"] }),
  tool("code", "chmod-calculator", "chmod Calculator", "Convert permission bits to octal and symbolic form.", ["file permissions"], ["chmod"], { icon: "lock", related: ["gitignore-generator"] }),
  tool("code", "gitignore-generator", "gitignore Generator", "Start a .gitignore from common groups.", [".gitignore"], ["gitignore"], { icon: "file", related: ["env-template"] }),
  tool("code", "robots-generator", "robots.txt Generator", "Draft a robots.txt file.", ["robots"], ["robots.txt"], { icon: "globe", related: ["sitemap-generator"] }),
  tool("code", "sitemap-generator", "Sitemap Generator", "Draft a sitemap.xml from URLs you enter.", ["sitemap"], ["sitemap.xml"], { icon: "globe", related: ["robots-generator"] }),
  tool("code", "docker-compose-generator", "Docker Compose Starter", "Create a small Compose file.", ["compose"], ["docker compose"], { icon: "file", related: ["nginx-generator"] }),
  tool("code", "nginx-generator", "Nginx Starter", "Create a basic Nginx server block.", ["nginx.conf"], ["nginx"], { icon: "file", related: ["docker-compose-generator"] }),
  tool("code", "env-template", "Env Template", "Create an .env template from key names.", ["dotenv"], ["env template"], { icon: "file", related: ["env-diff"] }),
  tool("code", "readme-generator", "README Template", "Draft a short README.", ["readme"], ["readme template"], { icon: "fileText", related: ["license-helper"] }),
  tool("code", "license-helper", "License Helper", "Fill in a standard open-source license.", ["mit license"], ["license"], { icon: "fileText", related: ["readme-generator"] }),
  tool("code", "html-boilerplate", "HTML Boilerplate", "Create a minimal HTML document.", ["html starter"], ["html boilerplate"], { icon: "code", related: ["meta-tags"] }),
  tool("time", "timestamp-converter", "Timestamp Converter", "Convert Unix time and readable dates.", ["epoch converter", "unix timestamp"], ["convert epoch", "unix timestamp"], { featured: true, icon: "clock", related: ["date-calculator", "cron-helper"] }),
  tool("time", "date-calculator", "Date Calculator", "Add time or measure the difference between dates.", ["date diff"], ["date difference", "add days"], { icon: "clock", related: ["timestamp-converter", "duration-converter"] }),
  tool("time", "cron-helper", "Cron Helper", "Explain a cron expression and list upcoming UTC runs.", ["crontab"], ["cron", "cron expression"], { icon: "clock", related: ["timestamp-converter"] }),
  tool("time", "duration-converter", "Duration Converter", "Convert milliseconds, seconds, minutes, hours, and days.", ["time converter"], ["duration"], { icon: "clock", related: ["unit-converter"] }),
  tool("math", "unit-converter", "Unit Converter", "Convert length, mass, temperature, data size, and more.", ["metric converter"], ["unit converter", "celsius to fahrenheit", "kb to bytes"], { icon: "ruler", related: ["percentage-calculator", "number-base"] }),
  tool("math", "percentage-calculator", "Percentage Calculator", "Calculate part, change, discount, and GST.", ["percent"], ["percentage", "discount", "gst"], { icon: "ruler", related: ["unit-converter"] }),
  tool("math", "number-base", "Number Base", "Convert binary, octal, decimal, and hexadecimal.", ["hex converter"], ["binary to decimal", "number base"], { icon: "hash", related: ["hex-codec"] }),
  tool("math", "roman-numerals", "Roman Numerals", "Convert integers and Roman numerals.", ["roman"], ["roman numeral"], { icon: "type", related: ["number-base"] }),
  tool("web", "url-parser", "URL Parser", "Break a URL into its parts.", ["parse url"], ["url parser"], { icon: "globe", related: ["url-builder", "query-string"] }),
  tool("web", "url-builder", "URL Builder", "Assemble a URL from its parts.", ["build url"], ["url builder"], { icon: "globe", related: ["url-parser", "utm-builder"] }),
  tool("web", "utm-builder", "UTM Builder", "Add campaign parameters to a link.", ["utm link"], ["utm"], { icon: "globe", related: ["url-builder"] }),
  tool("web", "http-status", "HTTP Status Codes", "Look up common HTTP status codes.", ["status code"], ["http status", "404"], { icon: "globe", related: ["curl-builder"] }),
  tool("web", "curl-builder", "cURL Builder", "Build a curl command, or sketch a fetch call from a simple curl.", ["curl to fetch"], ["curl"], { icon: "code", related: ["url-builder"] }),
  tool("web", "jwt-inspector", "JWT Inspector", "Decode a JWT locally. Decoding is not verification.", ["jwt decode"], ["jwt", "json web token"], { icon: "fingerprint", related: ["base64url-codec", "hash-generator"] }),
  tool("web", "cidr-calculator", "CIDR Calculator", "Calculate an IPv4 network, mask, and host range.", ["subnet"], ["cidr", "subnet mask"], { icon: "globe", related: ["number-base"] }),
  tool("web", "meta-tags", "Meta Tags", "Draft title, description, canonical, and social tags.", ["open graph"], ["meta tags", "open graph"], { icon: "globe", related: ["html-boilerplate"] }),
  tool("web", "user-agent", "User-Agent Parser", "Read common browser and OS tokens from a user-agent.", ["ua parser"], ["user agent"], { icon: "globe", related: ["http-status"] }),
  tool("documents", "pdf-tools", "PDF Tools", "Merge, split, rotate, watermark, and inspect PDFs locally.", ["merge pdf", "split pdf"], ["merge pdf", "split pdf", "rotate pdf"], { icon: "fileText", related: ["image-converter"] }),
  tool("generators", "qr-code", "QR Code", "Create a QR code and download SVG or PNG.", ["qrcode"], ["qr code"], { featured: true, icon: "qr", related: ["placeholder-image"] }),
  tool("generators", "placeholder-image", "Placeholder Image", "Generate a simple SVG placeholder.", ["dummy image"], ["placeholder image"], { icon: "image", related: ["lorem-ipsum", "image-resizer"] }),
];

function tool(
  category: CategoryId,
  slug: string,
  name: string,
  description: string,
  aliases: string[],
  keywords: string[],
  extra: { icon: ToolIconName; related: string[]; featured?: boolean; quickAction?: boolean },
): Draft {
  return {
    slug,
    name,
    description,
    category,
    tags: [category, ...aliases],
    aliases,
    keywords,
    priority: category === "secrets" || category === "encoding" || category === "color" || slug === "json-formatter" ? "P0" : "P1",
    related: extra.related,
    featured: extra.featured,
    quickAction: extra.quickAction,
    icon: extra.icon,
    limitations: category === "color" ? ["Wide-gamut colors are mapped into sRGB for HEX and RGB. CMYK is an unprofiled approximation."] : undefined,
  };
}

export const tools: ToolDefinition[] = drafts.map((draft) => ({
  ...draft,
  id: draft.slug,
  status: "ready",
  supportsLocalProcessing: true,
}));

const bySlug = new Map(tools.map((item) => [item.slug, item]));

export function getTool(slug: string) {
  return bySlug.get(slug);
}

export function toolsInCategory(category: CategoryId) {
  return tools.filter((item) => item.category === category);
}

export const toolIcons = Object.fromEntries(drafts.map((item) => [item.slug, item.icon])) as Record<string, ToolIconName>;
