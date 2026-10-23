import Color from "colorjs.io";

export type ColorValue = {
  id: string;
  label: string;
  value: string;
  note?: string;
};

export type ColorSnapshot = {
  hex: string;
  alpha: number;
  outOfSrgbGamut: boolean;
  values: ColorValue[];
};

function round(value: number, precision: number) {
  const factor = 10 ** precision;
  return Math.round(value * factor) / factor;
}

function channelByte(value: number) {
  return Math.round(Math.min(1, Math.max(0, value)) * 255);
}

function hexByte(value: number) {
  return value.toString(16).padStart(2, "0");
}

export function parseColor(input: string) {
  const trimmed = input.trim();
  if (!trimmed) throw new Error("Enter a color such as #8B5CF6, rgb(139 92 246), or oklch(60% 0.2 292).");
  try {
    return new Color(trimmed);
  } catch {
    throw new Error(`“${trimmed}” is not a color this converter understands.`);
  }
}

export function convertColor(input: string, precision = 3): ColorSnapshot {
  const color = parseColor(input);
  const srgb = color.to("srgb");
  const mapped = srgb.clone().toGamut();
  const outOfSrgbGamut = !color.inGamut("srgb");
  const alpha = round(color.alpha ?? 1, precision);
  const bytes = mapped.coords.map((coord) => channelByte(coord ?? 0));
  const hex = `#${bytes.map(hexByte).join("")}${alpha < 1 ? hexByte(alpha) : ""}`;
  const [r, g, b] = bytes;
  const integer = ((r! << 16) | (g! << 8) | b!) >>> 0;
  const android = ((channelByte(alpha) << 24) | integer) >>> 0;
  const cmyk = approximateCmyk(bytes as number[]);

  const css = (space: string) => {
    try {
      return color.to(space).toString({ precision });
    } catch {
      return "Unavailable";
    }
  };

  const values: ColorValue[] = [
    { id: "hex", label: "HEX", value: hex },
    { id: "rgb", label: "RGB", value: alpha < 1 ? `rgba(${r}, ${g}, ${b}, ${alpha})` : `rgb(${r}, ${g}, ${b})` },
    { id: "hsl", label: "HSL", value: css("hsl") },
    { id: "hsv", label: "HSV / HSB", value: formatHsv(color, precision), note: "HSV and HSB are the same model. This is not a CSS color function." },
    { id: "hwb", label: "HWB", value: css("hwb") },
    { id: "lab", label: "Lab", value: css("lab") },
    { id: "lch", label: "LCH", value: css("lch") },
    { id: "oklab", label: "OKLab", value: css("oklab") },
    { id: "oklch", label: "OKLCH", value: css("oklch") },
    { id: "srgb", label: "color(srgb)", value: mapped.to("srgb").toString({ precision }), note: outOfSrgbGamut ? "Gamut-mapped into sRGB for display." : undefined },
    { id: "p3", label: "Display P3", value: css("p3") },
    { id: "xyz", label: "XYZ D65", value: css("xyz-d65") },
    { id: "cmyk", label: "CMYK", value: cmyk, note: "Unprofiled approximation from sRGB. Not print-accurate." },
    { id: "integer", label: "Integer", value: `0x${integer.toString(16).padStart(6, "0")} (${integer})` },
    { id: "android", label: "Android ARGB", value: `0x${android.toString(16).padStart(8, "0")}` },
    { id: "flutter", label: "Flutter", value: `Color(0x${android.toString(16).padStart(8, "0").toUpperCase()})` },
    {
      id: "swift",
      label: "Swift UIColor",
      value: `UIColor(red: ${round((r ?? 0) / 255, precision)}, green: ${round((g ?? 0) / 255, precision)}, blue: ${round((b ?? 0) / 255, precision)}, alpha: ${alpha})`,
    },
    { id: "css-var", label: "CSS variable", value: `--color: ${hex};` },
    { id: "tailwind", label: "Tailwind arbitrary", value: `bg-[${hex}]` },
  ];

  return { hex, alpha, outOfSrgbGamut, values };
}

function formatHsv(color: Color, precision: number) {
  const hsv = color.to("hsv");
  const [h, s, v] = hsv.coords;
  const alpha = hsv.alpha ?? 1;
  const body = `hsv(${round(h ?? 0, precision)} ${round((s ?? 0), precision)}% ${round(v ?? 0, precision)}%`;
  return alpha < 1 ? `${body} / ${round(alpha, precision)})` : `${body})`;
}

function approximateCmyk([r, g, b]: number[]) {
  const red = r! / 255;
  const green = g! / 255;
  const blue = b! / 255;
  const k = 1 - Math.max(red, green, blue);
  if (k === 1) return "cmyk(0% 0% 0% 100%)";
  const c = (1 - red - k) / (1 - k);
  const m = (1 - green - k) / (1 - k);
  const y = (1 - blue - k) / (1 - k);
  const percent = (value: number) => `${Math.round(value * 100)}%`;
  return `cmyk(${percent(c)} ${percent(m)} ${percent(y)} ${percent(k)})`;
}

export function rotateHue(input: string, degrees: number) {
  const color = parseColor(input).to("hsl");
  color.coords[0] = ((color.coords[0] ?? 0) + degrees + 360) % 360;
  return color.to("srgb").toGamut().toString({ format: "hex" });
}

export function harmonies(input: string) {
  return {
    complementary: [convertColor(input).hex, rotateHue(input, 180)],
    analogous: [rotateHue(input, -30), convertColor(input).hex, rotateHue(input, 30)],
    triadic: [convertColor(input).hex, rotateHue(input, 120), rotateHue(input, 240)],
    tetradic: [convertColor(input).hex, rotateHue(input, 90), rotateHue(input, 180), rotateHue(input, 270)],
  };
}

export function tintsAndShades(input: string) {
  const color = parseColor(input);
  const mix = (target: string, amount: number) =>
    color.mix(target, amount, { space: "srgb" }).toGamut().toString({ format: "hex" });
  return {
    tints: [0.15, 0.3, 0.5, 0.7].map((amount) => mix("white", amount)),
    shades: [0.15, 0.3, 0.5, 0.7].map((amount) => mix("black", amount)),
  };
}

export function gradientCss(stops: string[], angle = 90) {
  const colors = stops.map((stop) => convertColor(stop).hex);
  return `linear-gradient(${angle}deg, ${colors.join(", ")})`;
}

export function cssVariablesToJson(css: string) {
  const entries = [...css.matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)];
  if (!entries.length) throw new Error("No CSS custom properties were found. Use lines like --color: #8B5CF6;");
  return Object.fromEntries(entries.map((entry) => [entry[1], entry[2]!.trim()]));
}

export function jsonToCssVariables(json: string, selector = ":root") {
  const value = JSON.parse(json) as unknown;
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("Use a JSON object of custom property names and values.");
  }
  const lines = Object.entries(value).map(([key, item]) => {
    const name = key.startsWith("--") ? key : `--${key}`;
    return `  ${name}: ${String(item)};`;
  });
  return `${selector} {\n${lines.join("\n")}\n}`;
}

const VISION: Record<string, number[][]> = {
  protanopia: [
    [0.152286, 1.052583, -0.204868],
    [0.114503, 0.786281, 0.099216],
    [-0.003882, -0.048116, 1.051998],
  ],
  deuteranopia: [
    [0.367322, 0.860646, -0.227968],
    [0.280085, 0.672501, 0.047413],
    [-0.01182, 0.04294, 0.968881],
  ],
  tritanopia: [
    [1.255528, -0.076749, -0.178779],
    [-0.078411, 0.930809, 0.147602],
    [0.004733, 0.691367, 0.3039],
  ],
};

export function simulateColorVision(input: string, kind: keyof typeof VISION) {
  const color = parseColor(input).to("srgb").toGamut();
  const [r, g, b] = color.coords.map((coord) => coord ?? 0);
  const matrix = VISION[kind];
  const mixed = matrix.map((row) => row[0]! * r! + row[1]! * g! + row[2]! * b!) as [number, number, number];
  const next = new Color("srgb", mixed, color.alpha).toGamut();
  return next.toString({ format: "hex" });
}
