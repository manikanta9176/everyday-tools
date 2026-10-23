import { expect, test } from "@playwright/test";

test("search opens the token generator", async ({ page }) => {
  await page.goto("/");
  await page.locator("[data-ready='true']").click();
  const dialog = page.getByRole("dialog");
  await dialog.locator("input").fill("generate secret");
  await dialog.getByText("Random Secret Generator", { exact: true }).click();
  await expect(page).toHaveURL(/\/tools\/random-secret-generator$/);
  await page.getByRole("button", { name: "Generate locally" }).click();
  await expect(page.locator("pre").first()).toContainText(/[A-Za-z0-9+/_-]{16,}={0,2}/);
});

test("json formatter rejects invalid json and formats valid json", async ({ page }) => {
  await page.goto("/tools/json-formatter");
  await page.locator("[data-ready='true']").waitFor();
  const input = page.getByRole("textbox", { name: "JSON" });
  await input.fill("{");
  await page.getByRole("button", { name: "Format", exact: true }).click();
  await expect(page.getByText(/Expected property name/)).toBeVisible();
  await input.fill('{"b":1,"a":2}');
  await page.getByRole("button", { name: "Format", exact: true }).click();
  await expect(page.locator("pre").last()).toContainText('"a": 2');
});

test("color converter shows rgb for a known hex color", async ({ page }) => {
  await page.goto("/tools/color-converter");
  await expect(page.getByText("rgb(139, 92, 246)")).toBeVisible();
});

test("token input is not sent over the network", async ({ page }) => {
  const external: string[] = [];
  page.on("request", (request) => {
    const url = request.url();
    if (!url.startsWith("http://127.0.0.1:3210") && !url.startsWith("http://localhost:3210")) {
      external.push(url);
    }
  });
  await page.goto("/tools/random-secret-generator");
  await page.locator("[data-ready='true']").waitFor();
  await page.getByRole("button", { name: "Generate locally" }).click();
  await page.waitForTimeout(300);
  expect(external).toEqual([]);
});
