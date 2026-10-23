export async function copyText(value: string) {
  if (!value) {
    throw new Error("There is nothing to copy yet.");
  }
  await navigator.clipboard.writeText(value);
}
