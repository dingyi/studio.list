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

test("uses the centered command-search navigation", async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name === "mobile");
  await openReadyPage(page);

  const search = page.getByRole("button", { name: "Search agencies" });
  await expect(search).toHaveCSS("width", "256px");
  await expect(page.locator(".site-nav")).toHaveCSS("min-height", "56px");
  await search.click();
  const dialogPosition = await page.getByRole("dialog").evaluate((dialog) => {
    const rect = dialog.getBoundingClientRect();
    return { height: Math.round(rect.height), y: Math.round(rect.y) };
  });
  expect(dialogPosition.y).toBe(6);
  expect(dialogPosition.height).toBe(44);
  await expect(page.locator(".search-dialog__body")).toHaveCount(0);
});

test("presents the hero newsletter field without sending data", async ({
  page,
}) => {
  await openReadyPage(page);
  await expect(page.getByText("verified agencies")).toHaveCount(0);
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

test("uses the external-caption course card anatomy", async ({ page }) => {
  await openReadyPage(page);
  await expect(page.locator('[data-directory-ready="true"]')).toBeVisible();

  const firstCard = page.locator(".agency-card").first();
  const media = firstCard.locator(".agency-card__media");
  const title = firstCard.locator("h2");
  await expect(firstCard).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
  await expect(firstCard).toHaveCSS("border-radius", "0px");
  await expect(media).toHaveCSS("margin", "0px");
  await expect(media).toHaveCSS("border-radius", "15px");
  await expect(title).toHaveCSS("font-size", "14px");
  await expect(title).toHaveCSS("font-weight", "600");
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

test("presents the About page as a narrow editorial index", async ({ page }) => {
  await openReadyPage(page, "/about/");

  await expect(page.locator(".about-mosaic")).toHaveCount(0);
  await expect(
    page.getByRole("heading", { name: "What is studio.list?" }),
  ).toBeVisible();
  await expect(page.locator(".about-content section")).toHaveCount(5);
  await expect(page.getByRole("heading", { name: "Connect" })).toHaveCount(0);
});

test("keeps About in place when opening its compact search", async ({ page }) => {
  await openReadyPage(page, "/about/");

  await page.getByRole("button", { name: "Search agencies" }).click();

  await expect(page).toHaveURL(/\/about\/$/);
  await expect(
    page.getByRole("dialog", { name: "Search agencies" }),
  ).toBeVisible();
  await expect(
    page.getByRole("textbox", { name: "Search agencies" }),
  ).toBeVisible();
  await expect(page.locator(".search-dialog__body")).toHaveCount(0);
  await page.getByRole("button", { name: "Close search" }).click();
  await expect(page.getByRole("dialog", { name: "Search agencies" })).toBeHidden();
  await expect(page).toHaveURL(/\/about\/$/);
});
