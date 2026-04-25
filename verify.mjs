import path from "node:path";
import { pathToFileURL } from "node:url";
import { mkdir } from "node:fs/promises";

const outputDir = path.join(process.cwd(), "artifacts");
const screenshotPath = path.join(outputDir, "campus-compass-preview.png");
const pageUrl = pathToFileURL(path.join(process.cwd(), "index.html")).href;
const playwrightEntry = pathToFileURL(
  "C:/Users/Student/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs"
).href;
const { chromium } = await import(playwrightEntry);

await mkdir(outputDir, { recursive: true });

let browser;

try {
  browser = await launchBrowser();
  const page = await browser.newPage({ viewport: { width: 1440, height: 1800 } });

  await page.goto(pageUrl, { waitUntil: "load" });
  await page.waitForTimeout(800);

  const initialCount = await page.locator(".item-card").count();

  await page.getByRole("searchbox").fill("library");
  await page.waitForTimeout(200);
  const searchCount = await page.locator(".item-card").count();

  await page.getByLabel("Category").selectOption("electronics");
  await page.waitForTimeout(200);
  const filteredCount = await page.locator(".item-card").count();

  await page.screenshot({ path: screenshotPath, fullPage: true });

  console.log(
    JSON.stringify(
      {
        status: "ok",
        url: pageUrl,
        screenshotPath,
        initialCount,
        searchCount,
        filteredCount
      },
      null,
      2
    )
  );
} catch (error) {
  console.error(
    JSON.stringify(
      {
        status: "error",
        message: error instanceof Error ? error.message : String(error)
      },
      null,
      2
    )
  );
  process.exitCode = 1;
} finally {
  await browser?.close();
}

async function launchBrowser() {
  const edgePath = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";

  try {
    return await chromium.launch({ executablePath: edgePath, headless: true });
  } catch (error) {
    return chromium.launch({ headless: true });
  }
}
