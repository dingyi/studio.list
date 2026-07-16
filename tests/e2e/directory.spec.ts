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
  const searchDialog = page.getByRole("dialog", { name: "Search agencies" });
  await expect(searchDialog.locator(".search-result")).toHaveCount(1);
  await expect(searchDialog.locator(".search-result")).toContainText("&Walsh");
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
  await expect(page.locator(".search-results")).toHaveCount(0);
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

test("uses the external-caption course card anatomy", async ({
  page,
}, testInfo) => {
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
  const firstFlag = firstCard.locator(".country-flag").first();
  await expect(firstFlag).toBeVisible();
  await expect(firstFlag).toHaveAttribute("src", /\/flags\/[a-z]{2}\.svg$/);
  const gridColumns = await page.locator(".agency-grid--card").evaluate(
    (grid) => getComputedStyle(grid).gridTemplateColumns.split(" ").length,
  );
  expect(gridColumns).toBe(testInfo.project.name === "mobile" ? 1 : 4);
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

test("returns from a detail page to the originating card", async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name === "mobile");
  await openReadyPage(page);
  await expect(page.locator('[data-directory-ready="true"]')).toBeVisible();

  const originCard = page.locator(".agency-card__main").nth(12);
  await originCard.scrollIntoViewIfNeeded();
  await page.evaluate(() => window.scrollBy(0, -80));
  const originHref = await originCard.getAttribute("href");
  await originCard.click();
  await expect(page).toHaveURL(new RegExp(`${originHref}$`));

  await page.getByRole("link", { name: "Close agency detail" }).click();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.locator('[data-directory-ready="true"]')).toBeVisible();
  await expect(originCard).toBeFocused();
  const returnedScroll = await page.evaluate(() => window.scrollY);
  const recordedScroll = await page.evaluate(
    () => window.history.state.studioListReturn.scrollY,
  );
  expect(Math.abs(returnedScroll - recordedScroll)).toBeLessThan(2);
});

test("uses the centered profile layout on agency detail pages", async ({
  page,
}, testInfo) => {
  await openReadyPage(page, "/agencies/dine/");

  const detail = page.locator(".agency-detail");
  await expect(detail.locator(".detail-utility")).toBeVisible();
  await expect(detail.locator(".detail-logo")).toBeVisible();
  await expect(detail.locator(".detail-media")).toBeVisible();
  await expect(detail.locator(".detail-fact")).toHaveCount(3);
  await expect(detail.locator(".detail-fact .country-flag")).toBeVisible();
  await expect(detail.locator(".detail-fact").first()).toHaveCSS("align-items", "center");
  await expect(detail.locator(".detail-chip")).toHaveCount(0);
  await expect(detail.locator(".detail-adjacent")).toHaveCount(0);
  const similarHeading = detail.getByRole("heading", {
    name: "Explore similar agencies to Dine",
  });
  await expect(similarHeading).toBeVisible();
  await expect(similarHeading).toHaveCSS("font-size", "14px");
  const similarSection = detail.locator(".similar-agencies");
  await expect(similarSection).toHaveCSS("border-top-width", "0px");
  await expect(similarSection.locator(".agency-card")).toHaveCount(4);

  const website = detail.locator(".detail-website");
  const websiteIcon = website.locator("svg");
  await expect(websiteIcon).toHaveCSS("opacity", "0");
  await expect(websiteIcon).toHaveCSS("width", "0px");
  if (testInfo.project.name !== "mobile") {
    await website.hover();
    await expect(websiteIcon).toHaveCSS("opacity", "1");
    await expect(websiteIcon).toHaveCSS("width", "14px");
  }

  const logoBox = await detail.locator(".detail-logo").boundingBox();
  const utilityBox = await detail.locator(".detail-utility").boundingBox();
  const mediaBox = await detail.locator(".detail-media").boundingBox();
  const factsBox = await detail.locator(".detail-facts").boundingBox();
  expect(logoBox).not.toBeNull();
  expect(utilityBox).not.toBeNull();
  expect(mediaBox).not.toBeNull();
  expect(factsBox).not.toBeNull();
  expect(logoBox!.width).toBe(32);
  expect(logoBox!.height).toBe(32);
  await expect(detail.locator(".detail-logo")).toHaveCSS("border-top-width", "0px");
  await expect(detail.locator(".detail-logo")).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
  expect(logoBox!.y).toBeLessThan(mediaBox!.y);
  expect(Math.abs(logoBox!.x + logoBox!.width / 2 - (utilityBox!.x + utilityBox!.width / 2))).toBeLessThan(1);
  expect(Math.abs(utilityBox!.width - mediaBox!.width)).toBeLessThan(1);
  expect(Math.abs(mediaBox!.width - factsBox!.width)).toBeLessThan(1);
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
  await expect(page.locator(".site-footer .footer-top")).toHaveCount(0);
  await expect(page.locator(".footer-nav").getByRole("link")).toHaveCount(2);
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
  await expect(page.locator(".search-results")).toHaveCount(0);
  await page.getByRole("button", { name: "Close search" }).click();
  await expect(page.getByRole("dialog", { name: "Search agencies" })).toBeHidden();
  await expect(page).toHaveURL(/\/about\/$/);
});

test("shows matching Agencies inside the About search panel", async ({ page }) => {
  await openReadyPage(page, "/about/");
  await page.getByRole("button", { name: "Search agencies" }).click();
  await page.getByRole("textbox", { name: "Search agencies" }).fill("Walsh");

  const dialog = page.getByRole("dialog", { name: "Search agencies" });
  const result = dialog.locator(".search-result");
  await expect(result).toHaveCount(1);
  await expect(result).toContainText("&Walsh");
  await expect(result).toContainText("/agencies/and-walsh");
  await expect(page).toHaveURL(/\/about\/$/);
  await dialog.getByRole("button", { name: "Clear search" }).click();
  await expect(dialog.locator(".search-results")).toHaveCount(0);
});
