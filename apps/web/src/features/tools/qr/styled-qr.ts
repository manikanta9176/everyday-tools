import QRCode from "qrcode";

const CELL = 10;

type Level = "L" | "M" | "Q" | "H";

type Options = {
  dark?: string;
  light?: string;
  errorCorrectionLevel?: Level;
  margin?: number;
};

export async function styledQrSvg(text: string, options: Options = {}) {
  const value = text.trim();
  if (!value) throw new Error("Enter text to encode.");
  if (value.length > 2000) throw new Error("Keep QR text under 2,000 characters.");

  const dark = hexColor(options.dark, "#141311");
  const light = hexColor(options.light, "#fffdf8");
  const margin = options.margin ?? 2;
  const qr = QRCode.create(value, { errorCorrectionLevel: options.errorCorrectionLevel ?? "M" });
  const size = qr.modules.size;
  const skip = Array.from({ length: size }, () => Array.from({ length: size }, () => false));
  const darkAt = (row: number, col: number) => {
    if (row < 0 || col < 0 || row >= size || col >= size || skip[row]?.[col]) return false;
    return Boolean(qr.modules.get(row, col));
  };
  const parts: string[] = [];

  for (const [row, col] of [
    [0, 0],
    [0, size - 7],
    [size - 7, 0],
  ]) {
    cover(skip, row, col, 7);
    parts.push(finder(col, row, margin, dark, light));
  }

  for (let row = 2; row < size - 2; row += 1) {
    for (let col = 2; col < size - 2; col += 1) {
      if (skip[row]?.[col] || !isAlignment(qr.modules, row, col)) continue;
      cover(skip, row - 2, col - 2, 5);
      parts.push(alignment(col - 2, row - 2, margin, dark, light));
    }
  }

  for (let row = 0; row < size; row += 1) {
    for (let col = 0; col < size; col += 1) {
      if (!darkAt(row, col)) continue;
      parts.push(mark(col, row, margin, dark, darkAt));
    }
  }

  const span = (size + margin * 2) * CELL;
  return [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${span} ${span}" width="100%" style="display:block">`,
    `<rect width="${span}" height="${span}" fill="${light}"/>`,
    ...parts,
    "</svg>",
  ].join("");
}

export function styledQrDataUrl(svg: string) {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

function finder(col: number, row: number, margin: number, dark: string, light: string) {
  const x = (col + margin) * CELL;
  const y = (row + margin) * CELL;
  return [
    `<rect x="${x}" y="${y}" width="${CELL * 7}" height="${CELL * 7}" rx="${CELL * 1.2}" fill="${dark}"/>`,
    `<rect x="${x + CELL}" y="${y + CELL}" width="${CELL * 5}" height="${CELL * 5}" rx="${CELL * 1.4}" fill="${light}"/>`,
    `<circle cx="${x + CELL * 3.5}" cy="${y + CELL * 3.5}" r="${CELL * 1.5}" fill="${dark}"/>`,
  ].join("");
}

function alignment(col: number, row: number, margin: number, dark: string, light: string) {
  const x = (col + margin) * CELL;
  const y = (row + margin) * CELL;
  return [
    `<rect x="${x}" y="${y}" width="${CELL * 5}" height="${CELL * 5}" rx="${CELL * 1.4}" fill="${dark}"/>`,
    `<rect x="${x + CELL}" y="${y + CELL}" width="${CELL * 3}" height="${CELL * 3}" rx="${CELL}" fill="${light}"/>`,
    `<circle cx="${x + CELL * 2.5}" cy="${y + CELL * 2.5}" r="${CELL * 0.7}" fill="${dark}"/>`,
  ].join("");
}

function mark(col: number, row: number, margin: number, dark: string, darkAt: (row: number, col: number) => boolean) {
  const x = (col + margin) * CELL;
  const y = (row + margin) * CELL;
  const radius = CELL / 2;
  const parts = [`<circle cx="${x + radius}" cy="${y + radius}" r="${radius}" fill="${dark}"/>`];
  if (darkAt(row, col + 1)) parts.push(`<rect x="${x + radius}" y="${y}" width="${CELL}" height="${CELL}" fill="${dark}"/>`);
  if (darkAt(row + 1, col)) parts.push(`<rect x="${x}" y="${y + radius}" width="${CELL}" height="${CELL}" fill="${dark}"/>`);
  return parts.join("");
}

function cover(skip: boolean[][], row: number, col: number, length: number) {
  for (let y = row; y < row + length; y += 1) {
    for (let x = col; x < col + length; x += 1) {
      const line = skip[y];
      if (line && x >= 0 && x < line.length) line[x] = true;
    }
  }
}

function isAlignment(modules: { get(row: number, col: number): number }, row: number, col: number) {
  for (let y = -2; y <= 2; y += 1) {
    for (let x = -2; x <= 2; x += 1) {
      const edge = Math.abs(x) === 2 || Math.abs(y) === 2;
      const center = x === 0 && y === 0;
      if (Boolean(modules.get(row + y, col + x)) !== (edge || center)) return false;
    }
  }
  return true;
}

function hexColor(value: string | undefined, fallback: string) {
  if (!value) return fallback;
  const match = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.exec(value.trim());
  if (!match?.[1]) return fallback;
  if (match[1].length === 3) {
    const [red, green, blue] = match[1];
    return `#${red}${red}${green}${green}${blue}${blue}`.toLowerCase();
  }
  return `#${match[1].toLowerCase()}`;
}
