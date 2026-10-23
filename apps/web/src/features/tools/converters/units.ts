export type Unit = {
  id: string;
  label: string;
  toBase: (value: number) => number;
  fromBase: (value: number) => number;
};

function factor(id: string, label: string, multiplier: number): Unit {
  return {
    id,
    label,
    toBase: (value) => value * multiplier,
    fromBase: (value) => value / multiplier,
  };
}

export const unitCategories = {
  length: {
    label: "Length",
    units: [factor("mm", "Millimetres", 0.001), factor("cm", "Centimetres", 0.01), factor("m", "Metres", 1), factor("km", "Kilometres", 1000), factor("in", "Inches", 0.0254), factor("ft", "Feet", 0.3048), factor("yd", "Yards", 0.9144), factor("mi", "Miles", 1609.344)],
  },
  mass: {
    label: "Weight / mass",
    units: [factor("mg", "Milligrams", 0.000001), factor("g", "Grams", 0.001), factor("kg", "Kilograms", 1), factor("t", "Metric tons", 1000), factor("oz", "Ounces", 0.028349523125), factor("lb", "Pounds", 0.45359237)],
  },
  temperature: {
    label: "Temperature",
    units: [
      { id: "c", label: "Celsius", toBase: (value: number) => value, fromBase: (value: number) => value },
      { id: "f", label: "Fahrenheit", toBase: (value: number) => (value - 32) * (5 / 9), fromBase: (value: number) => value * (9 / 5) + 32 },
      { id: "k", label: "Kelvin", toBase: (value: number) => value - 273.15, fromBase: (value: number) => value + 273.15 },
    ],
  },
  area: {
    label: "Area",
    units: [factor("cm2", "Square centimetres", 0.0001), factor("m2", "Square metres", 1), factor("ha", "Hectares", 10000), factor("km2", "Square kilometres", 1_000_000), factor("ft2", "Square feet", 0.09290304), factor("acre", "Acres", 4046.8564224)],
  },
  volume: {
    label: "Volume",
    units: [factor("ml", "Millilitres", 0.001), factor("l", "Litres", 1), factor("m3", "Cubic metres", 1000), factor("tsp", "Teaspoons", 0.00492892159375), factor("tbsp", "Tablespoons", 0.01478676478125), factor("cup", "Cups", 0.2365882365), factor("floz", "Fluid ounces", 0.0295735295625), factor("gal", "US gallons", 3.785411784)],
  },
  time: {
    label: "Time",
    units: [factor("ms", "Milliseconds", 0.001), factor("s", "Seconds", 1), factor("min", "Minutes", 60), factor("h", "Hours", 3600), factor("d", "Days", 86400), factor("wk", "Weeks", 604800)],
  },
  speed: {
    label: "Speed",
    units: [factor("mps", "Metres per second", 1), factor("kph", "Kilometres per hour", 1 / 3.6), factor("mph", "Miles per hour", 0.44704), factor("kn", "Knots", 0.514444)],
  },
  pressure: {
    label: "Pressure",
    units: [factor("pa", "Pascals", 1), factor("kpa", "Kilopascals", 1000), factor("bar", "Bar", 100000), factor("psi", "PSI", 6894.757293168), factor("atm", "Atmospheres", 101325)],
  },
  energy: {
    label: "Energy",
    units: [factor("j", "Joules", 1), factor("kj", "Kilojoules", 1000), factor("cal", "Calories", 4.184), factor("kcal", "Kilocalories", 4184), factor("wh", "Watt hours", 3600), factor("kwh", "Kilowatt hours", 3_600_000)],
  },
  power: {
    label: "Power",
    units: [factor("w", "Watts", 1), factor("kw", "Kilowatts", 1000), factor("hp", "Horsepower", 745.6998715822702)],
  },
  angle: {
    label: "Angle",
    units: [factor("deg", "Degrees", 1), factor("rad", "Radians", 180 / Math.PI), factor("grad", "Gradians", 0.9)],
  },
  data: {
    label: "Data storage",
    units: [
      factor("B", "Bytes", 1),
      factor("KB", "Kilobytes (1000)", 1000),
      factor("MB", "Megabytes (1000)", 1000 ** 2),
      factor("GB", "Gigabytes (1000)", 1000 ** 3),
      factor("TB", "Terabytes (1000)", 1000 ** 4),
      factor("KiB", "Kibibytes (1024)", 1024),
      factor("MiB", "Mebibytes (1024)", 1024 ** 2),
      factor("GiB", "Gibibytes (1024)", 1024 ** 3),
      factor("TiB", "Tebibytes (1024)", 1024 ** 4),
    ],
  },
  transfer: {
    label: "Transfer speed",
    units: [factor("bps", "Bits per second", 1), factor("kbps", "Kilobits per second", 1000), factor("mbps", "Megabits per second", 1000 ** 2), factor("Bps", "Bytes per second", 8), factor("MBps", "Megabytes per second", 8 * 1000 ** 2)],
  },
} as const;

export type UnitCategory = keyof typeof unitCategories;

export function convertUnit(category: UnitCategory, from: string, to: string, value: number) {
  if (!Number.isFinite(value)) throw new Error("Enter a finite number.");
  const units = unitCategories[category].units as readonly Unit[];
  const source = units.find((unit) => unit.id === from);
  const target = units.find((unit) => unit.id === to);
  if (!source || !target) throw new Error("Choose units from the same category.");
  return target.fromBase(source.toBase(value));
}

export function percentageOf(part: number, total: number) {
  if (total === 0) throw new Error("The total cannot be zero.");
  return (part / total) * 100;
}

export function percentageChange(from: number, to: number) {
  if (from === 0) throw new Error("The starting value cannot be zero.");
  const change = ((to - from) / Math.abs(from)) * 100;
  return { change, direction: change > 0 ? "increase" : change < 0 ? "decrease" : "same" };
}

export function discount(price: number, percent: number) {
  if (price < 0 || percent < 0 || percent > 100) throw new Error("Use a positive price and a discount from 0 to 100.");
  const saved = price * (percent / 100);
  return { saved, total: price - saved };
}

export function gst(amount: number, rate: number, mode: "add" | "extract") {
  if (amount < 0 || rate < 0) throw new Error("Amount and rate need to be zero or positive.");
  if (mode === "add") {
    const tax = amount * (rate / 100);
    return { net: amount, tax, gross: amount + tax };
  }
  const gross = amount;
  const net = amount / (1 + rate / 100);
  return { net, tax: gross - net, gross };
}

export function ratio(a: number, b: number) {
  if (b === 0) throw new Error("The second value cannot be zero.");
  return a / b;
}

export function average(values: number[]) {
  if (!values.length) throw new Error("Enter at least one number.");
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

export function randomInteger(min: number, max: number) {
  if (!Number.isInteger(min) || !Number.isInteger(max) || max < min || max - min > 1_000_000_000) {
    throw new Error("Use integers, with the maximum at least the minimum.");
  }
  const span = max - min + 1;
  const limit = Math.floor(0x100000000 / span) * span;
  const buffer = new Uint32Array(1);
  let roll = 0;
  do {
    crypto.getRandomValues(buffer);
    roll = buffer[0]!;
  } while (roll >= limit);
  return min + (roll % span);
}

export function convertBase(value: string, from: 2 | 8 | 10 | 16, to: 2 | 8 | 10 | 16) {
  const trimmed = value.trim().toLowerCase();
  if (!trimmed || !/^[0-9a-f]+$/.test(trimmed)) throw new Error("Enter a whole number in the selected base.");
  if ([...trimmed].some((digit) => Number.parseInt(digit, from) >= from)) {
    throw new Error(`“${trimmed}” contains a digit that does not belong in base ${from}.`);
  }
  const parsed = BigInt(from === 10 ? trimmed : `0${from === 16 ? "x" : from === 8 ? "o" : "b"}${trimmed}`);
  return parsed.toString(to);
}

const ROMAN: [number, string][] = [
  [1000, "M"],
  [900, "CM"],
  [500, "D"],
  [400, "CD"],
  [100, "C"],
  [90, "XC"],
  [50, "L"],
  [40, "XL"],
  [10, "X"],
  [9, "IX"],
  [5, "V"],
  [4, "IV"],
  [1, "I"],
];

export function toRoman(value: number) {
  if (!Number.isInteger(value) || value < 1 || value > 3999) throw new Error("Roman numerals here cover integers from 1 to 3999.");
  let remaining = value;
  let output = "";
  for (const [amount, glyph] of ROMAN) {
    while (remaining >= amount) {
      output += glyph;
      remaining -= amount;
    }
  }
  return output;
}

export function fromRoman(value: string) {
  const input = value.trim().toUpperCase();
  if (!/^[IVXLCDM]+$/.test(input)) throw new Error("Use the letters I, V, X, L, C, D, and M.");
  let total = 0;
  for (let i = 0; i < input.length; i += 1) {
    const current = ROMAN.find(([, glyph]) => glyph === input[i])?.[0] ?? 0;
    const next = ROMAN.find(([, glyph]) => glyph === input[i + 1])?.[0] ?? 0;
    total += current < next ? -current : current;
  }
  if (toRoman(total) !== input) throw new Error("That is not a standard Roman numeral.");
  return total;
}

export function roundTo(value: number, digits: number) {
  if (!Number.isInteger(digits) || digits < 0 || digits > 12) throw new Error("Use 0 to 12 decimal places.");
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}
