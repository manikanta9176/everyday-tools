import { describe, expect, it } from "vitest";
import { cameraErrorMessage } from "./camera";

describe("camera errors", () => {
  it("explains a denied permission", () => {
    expect(cameraErrorMessage(new DOMException("nope", "NotAllowedError"))).toMatch(/Allow the camera/);
  });

  it("explains a missing camera", () => {
    expect(cameraErrorMessage(new DOMException("none", "NotFoundError"))).toMatch(/No camera/);
  });
});
