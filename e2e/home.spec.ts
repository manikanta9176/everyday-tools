import { expect, test } from "@playwright/test";

test("homepage shows the product message", async ({ page }) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Small tools. Less busywork." }),
  ).toBeVisible();
});
