export function uuidV4() {
  return crypto.randomUUID();
}

function formatUuid(bytes: Uint8Array) {
  const hex = [...bytes].map((byte) => byte.toString(16).padStart(2, "0")).join("");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

export function uuidV7(timestamp = Date.now()) {
  if (!Number.isInteger(timestamp) || timestamp < 0 || timestamp > 2 ** 48 - 1) {
    throw new Error("UUID v7 needs a millisecond timestamp that fits in 48 bits.");
  }
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  const time = BigInt(timestamp);
  const byte = BigInt(255);
  bytes[0] = Number((time >> BigInt(40)) & byte);
  bytes[1] = Number((time >> BigInt(32)) & byte);
  bytes[2] = Number((time >> BigInt(24)) & byte);
  bytes[3] = Number((time >> BigInt(16)) & byte);
  bytes[4] = Number((time >> BigInt(8)) & byte);
  bytes[5] = Number(time & byte);
  bytes[6] = (bytes[6]! & 0x0f) | 0x70;
  bytes[8] = (bytes[8]! & 0x3f) | 0x80;
  return formatUuid(bytes);
}

export function generateUuids(version: "v4" | "v7", count: number) {
  if (!Number.isInteger(count) || count < 1 || count > 50) {
    throw new Error("Generate between 1 and 50 UUIDs at a time.");
  }
  return Array.from({ length: count }, () => (version === "v7" ? uuidV7() : uuidV4()));
}
