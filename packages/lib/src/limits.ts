export const LIMITS = {
  text: 1_000_000,
  json: 1_500_000,
  fileBytes: 25 * 1024 * 1024,
  secretBytes: 1024,
  bulk: 50,
  qrText: 2_000,
  imagePixels: 40_000_000,
} as const;

export function assertTextLimit(value: string, label = "Input") {
  if (value.length > LIMITS.text) {
    throw new Error(`${label} is longer than ${LIMITS.text.toLocaleString()} characters.`);
  }
}
