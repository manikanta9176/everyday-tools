import { describe, expect, it } from "vitest";
import { fileMatchesAccept } from "./file-accept";

describe("file accept rules", () => {
  it("allows any file when the field does not restrict the type", () => {
    expect(fileMatchesAccept({ name: "clip.mp4", type: "video/mp4" }, "*/*")).toBe(true);
  });

  it("keeps image files that match the field and rejects a pdf", () => {
    const accept = "image/jpeg,image/png,.jpg,.png";
    expect(fileMatchesAccept({ name: "photo.JPG", type: "" }, accept)).toBe(true);
    expect(fileMatchesAccept({ name: "notes.pdf", type: "application/pdf" }, accept)).toBe(false);
  });

  it("accepts a pdf or a jpeg for a mixed document field", () => {
    const accept = "application/pdf,image/jpeg";
    expect(fileMatchesAccept({ name: "scan.pdf", type: "application/pdf" }, accept)).toBe(true);
    expect(fileMatchesAccept({ name: "scan.png", type: "image/png" }, accept)).toBe(false);
  });
});
