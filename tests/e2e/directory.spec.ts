import { expect, test, type Page } from "@playwright/test";

async function openReadyPage(page: Page, path = "/") {
  await page.goto(path);
  await expect(page.locator('[data-header-ready="true"]')).toBeVisible();
}

test("searches agencies and retains the query in the URL", async ({ page }) => {
  await openReadyPage(page);
  await expect(page.locator('[data-directory-ready="true"]')).toBeVisible();
  await page.getByRole("button", { name: "Search agencies" }).click();
  await page.getByRole("textbox", { name: "Search agencies" }).fill("Walsh");

  await expect(page.locator(".agency-card")).toHaveCount(1);
  await expect(page).toHaveURL(/q=Walsh/);
});

test("presents the hero newsletter field without sending data", async ({
  page,
}) => {
  await openReadyPage(page);
  await page
    .getByRole("textbox", { name: "Newsletter email address" })
    .fill("reader@example.com");
  await page
    .getByRole("button", { name: "Subscribe to the studio.list newsletter" })
    .click();

  await expect(
    page.getByRole("heading", { name: "Subscriptions are opening soon." }),
  ).toBeVisible();
});

test("switches layouts and opens an agency detail page", async ({ page }) => {
  await openReadyPage(page);
  await expect(page.locator('[data-directory-ready="true"]')).toBeVisible();
  await page.getByRole("button", { name: "List view" }).click();
  await expect(page.locator(".agency-grid--list")).toBeVisible();

  const firstAgency = page.locator(".agency-card__main").first();
  await firstAgency.click();
  await expect(
    page.getByRole("link", { name: /Visit official website/ }),
  ).toBeVisible();
});

test("exposes the mobile navigation and direct website action", async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== "mobile");
  await openReadyPage(page);
  await expect(page.locator('[data-directory-ready="true"]')).toBeVisible();
  await page.getByRole("button", { name: "Open menu" }).click();
  await expect(
    page.getByRole("navigation", { name: "Mobile navigation" }),
  ).toBeVisible();
  await expect(page.locator(".agency-card__external").first()).toBeVisible();
});

test("shows the submission notice from the footer", async ({ page }) => {
  await openReadyPage(page, "/about/");
  await page
    .locator(".site-footer")
    .getByRole("button", { name: "Submit" })
    .click();
  await expect(
    page.getByRole("heading", { name: "Submissions are opening soon." }),
  ).toBeVisible();
});
