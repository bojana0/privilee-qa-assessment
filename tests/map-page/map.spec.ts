import { test, expect } from "@playwright/test";

test.describe("Privilee Map Page", () => {
  test("should load page with all core UI elements visible", async ({
    page,
  }) => {
    await page.goto("/map");

    const header = page.locator("header").first();
    await expect(header).toBeVisible();

    const mapCanvas = page.locator(".mapboxgl-map, .mapboxgl-canvas");
    await expect(mapCanvas.first()).toBeVisible({ timeout: 15000 });

    const filters = page.getByRole("button", { name: /pool|fitness|family|dining|waterpark/i });
    expect(await filters.count()).toBeGreaterThanOrEqual(1);

    const joinCTA = page.getByRole("link", { name: /join/i }).first();
    await expect(joinCTA).toBeVisible();
  });

  test("should toggle category filters and update venue display", async ({
    page,
  }) => {
    await page.goto("/map");
    await page.waitForLoadState("networkidle");

    const categories = [
      "Pool & beach",
      "Fitness",
      "Family activities",
      "Dining",
      "Waterparks",
    ];

    for (const category of categories) {
      const filterBtn = page.getByRole("button", { name: category });
      await expect(filterBtn).toBeVisible({ timeout: 10000 });
    }

    const venueHeading = page.locator("h2, h3, [class*='count'], [class*='heading']")
      .filter({ hasText: /\d+.*venue/i })
      .first();

    const poolFilter = page.getByRole("button", { name: "Pool & beach" });
    await poolFilter.click();
    await page.waitForTimeout(1000);

    const initialText = await venueHeading.textContent();

    const fitnessFilter = page.getByRole("button", { name: "Fitness" });
    await fitnessFilter.click();
    await page.waitForTimeout(1000);

    const updatedText = await venueHeading.textContent();
    expect(updatedText).not.toEqual(initialText);
  });

  test("should render interactive Mapbox map", async ({ page }) => {
    await page.goto("/map");

    const mapContainer = page.locator(".mapboxgl-map");
    await expect(mapContainer).toBeVisible({ timeout: 15000 });

    const canvas = page.locator(".mapboxgl-canvas");
    await expect(canvas).toBeAttached();

    const zoomIn = page.locator(".mapboxgl-ctrl-zoom-in");
    const zoomOut = page.locator(".mapboxgl-ctrl-zoom-out");

    if ((await zoomIn.count()) > 0) {
      await zoomIn.click();
      await page.waitForTimeout(500);
      await zoomOut.click();
    } else {
      const box = await canvas.boundingBox();
      expect(box).not.toBeNull();
      expect(box!.width).toBeGreaterThan(0);
      expect(box!.height).toBeGreaterThan(0);
    }
  });

  test("should load within acceptable performance thresholds", async ({
    page,
  }) => {
    const startTime = Date.now();

    await page.goto("/map", { waitUntil: "domcontentloaded" });
    const domLoadTime = Date.now() - startTime;

    expect(domLoadTime).toBeLessThan(8000);

    const mapCanvas = page.locator(".mapboxgl-canvas");
    await expect(mapCanvas).toBeAttached({ timeout: 15000 });
    const mapRenderTime = Date.now() - startTime;

    expect(mapRenderTime).toBeLessThan(15000);

    const performanceMetrics = await page.evaluate(() => {
      const navigation = performance.getEntriesByType(
        "navigation"
      )[0] as PerformanceNavigationTiming;
      return {
        domContentLoaded:
          navigation.domContentLoadedEventEnd - navigation.startTime,
        loadComplete: navigation.loadEventEnd - navigation.startTime,
        ttfb: navigation.responseStart - navigation.requestStart,
      };
    });

    expect(performanceMetrics.ttfb).toBeLessThan(2000);
  });

  test("should display venue data after loading", async ({ page }) => {
    await page.goto("/map");
    await page.waitForLoadState("networkidle");

    const loadingText = page.getByText("Loading venues...");
    if ((await loadingText.count()) > 0) {
      await expect(loadingText).toBeHidden({ timeout: 15000 });
    }

    const showVenuesBtn = page.getByRole("button", {
      name: /show.*venue/i,
    });

    if ((await showVenuesBtn.count()) > 0) {
      const btnText = await showVenuesBtn.textContent();
      const match = btnText?.match(/(\d+)/);
      if (match) {
        const venueCount = parseInt(match[1], 10);
        expect(venueCount).toBeGreaterThan(0);
      }
    }

    const images = page.locator("img[src*='prismic'], img[src*='venue'], img[alt]");
    const imageCount = await images.count();
    expect(imageCount).toBeGreaterThan(0);
  });

  test("should have correct navigation links in header", async ({ page }) => {
    await page.goto("/map");

    const expectedNavItems = [
      { name: /pool.*beach/i },
      { name: /gym|fitness/i },
      { name: /family/i },
      { name: /dining/i },
    ];

    for (const navItem of expectedNavItems) {
      const link = page.getByRole("link", { name: navItem.name }).first();
      await expect(link).toBeAttached();

      const href = await link.getAttribute("href");
      expect(href).toBeTruthy();
      expect(href).toMatch(/^\//);
    }

    const joinLink = page.getByRole("link", { name: /join now/i }).first();
    await expect(joinLink).toBeVisible();
    const joinHref = await joinLink.getAttribute("href");
    expect(joinHref).toBeTruthy();
  });

  test("should display correctly on mobile viewport", async ({ browser }) => {
    const context = await browser.newContext({
      viewport: { width: 375, height: 812 },
      userAgent:
        "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1",
    });
    const page = await context.newPage();

    await page.goto("/map");
    await page.waitForLoadState("networkidle");

    const menuToggle = page.locator(
      'button[aria-label*="menu" i], button[aria-label*="nav" i], [class*="hamburger" i], [class*="menu-toggle" i], [class*="MenuToggle"], header button'
    );
    const menuVisible = (await menuToggle.count()) > 0;
    expect(menuVisible).toBeTruthy();

    const mapCanvas = page.locator(".mapboxgl-map, .mapboxgl-canvas");
    await expect(mapCanvas.first()).toBeVisible({ timeout: 15000 });

    const hasHorizontalOverflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth;
    });
    expect(hasHorizontalOverflow).toBeFalsy();

    await context.close();
  });
});
