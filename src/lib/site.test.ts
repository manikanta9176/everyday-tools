import { describe, expect, it } from "vitest";
import { SITE, siteUrl } from "./site";

describe("site", () => {
  it("uses the product name and tagline", () => {
    expect(SITE.name).toBe("Everyday Tools");
    expect(SITE.tagline).toBe("Small tools. Less busywork.");
  });

  it("ignores an empty public site URL", () => {
    expect(siteUrl()).toBeUndefined();
  });
});
