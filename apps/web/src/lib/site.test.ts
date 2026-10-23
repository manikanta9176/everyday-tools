import { describe, expect, it } from "vitest";
import { SITE, siteUrl } from "./site";

describe("site", () => {
  it("uses the product name and tagline", () => {
    expect(SITE.name).toBe("Tools");
    expect(SITE.tagline).toBe("Small tools. Less busywork.");
    expect(SITE.url).toBe("https://tools.manikanta.net");
  });

  it("uses tools.manikanta.net when no public site URL is set", () => {
    expect(siteUrl().origin).toBe("https://tools.manikanta.net");
  });
});
