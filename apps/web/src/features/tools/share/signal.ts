export const MAX_QR_TEXT = 1800;

export async function packSignal(sdp: string): Promise<string> {
  const bytes = new TextEncoder().encode(sdp);
  const compressed = await gzip(bytes);
  return `1${toBase64Url(compressed)}`;
}

export async function unpackSignal(packed: string): Promise<string> {
  if (!packed.startsWith("1")) throw new Error("That code is not a transfer code.");
  const bytes = fromBase64Url(packed.slice(1));
  const plain = await gunzip(bytes);
  return new TextDecoder().decode(plain);
}

export function fitsInQr(packed: string) {
  return packed.length <= MAX_QR_TEXT;
}

function copyBytes(bytes: Uint8Array) {
  const copy = new ArrayBuffer(bytes.byteLength);
  new Uint8Array(copy).set(bytes);
  return copy;
}

async function gzip(bytes: Uint8Array) {
  const stream = new Blob([copyBytes(bytes)]).stream().pipeThrough(new CompressionStream("gzip"));
  return new Uint8Array(await new Response(stream).arrayBuffer());
}

async function gunzip(bytes: Uint8Array) {
  const stream = new Blob([copyBytes(bytes)]).stream().pipeThrough(new DecompressionStream("gzip"));
  return new Uint8Array(await new Response(stream).arrayBuffer());
}

function toBase64Url(bytes: Uint8Array) {
  let text = "";
  for (const byte of bytes) text += String.fromCharCode(byte);
  return btoa(text).replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
}

function fromBase64Url(value: string) {
  const padded = value.replaceAll("-", "+").replaceAll("_", "/") + "=".repeat((4 - (value.length % 4)) % 4);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
  return bytes;
}
