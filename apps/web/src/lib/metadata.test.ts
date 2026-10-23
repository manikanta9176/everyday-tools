import { describe, expect, it } from "vitest";
import { absoluteUrl, pageMetadata } from "./metadata";

describe("page metadata", () => {
  it("builds an absolute canonical URL for a tool", () => {
    expect(absoluteUrl("/tools/json-formatter")).toBe(
      "https://tools.manikanta.net/tools/json-formatter",
    );
    const metadata = pageMetadata({
      title: "JSON Formatter",
      description: "Format JSON.",
      path: "/tools/json-formatter",
    });
    expect(metadata.alternates).toEqual({ canonical: "/tools/json-formatter" });
    expect(metadata.openGraph).toMatchObject({
      type: "website",
      url: "https://tools.manikanta.net/tools/json-formatter",
      siteName: "Tools",
      title: "JSON Formatter",
    });
    expect(metadata.twitter).toMatchObject({ card: "summary_large_image" });
  });
});
