import { Actor } from "apify";
import playwright from "playwright";

await Actor.init();

try {
  const input = await Actor.getInput();
  const { url } = input;

  const browser = await playwright.chromium.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const context = await browser.newContext({
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36",
  });

  const page = await context.newPage();

  console.log(`Opening URL: ${url}`);

  await page.goto(url, {
    waitUntil: "domcontentloaded",
    timeout: 60000,
  });

  // DEBUG screenshot
  await page.screenshot({ path: "/tmp/debug.png" });

  // Scroll to load jobs
  for (let i = 0; i < 3; i++) {
    await page.mouse.wheel(0, 2000);
    await page.waitForTimeout(2000);
  }

  const jobs = await page
    .$$eval(".base-card", (cards) =>
      cards.map((card) => ({
        title:
          card.querySelector(".base-search-card__title")?.innerText?.trim() ||
          null,
        company:
          card
            .querySelector(".base-search-card__subtitle")
            ?.innerText?.trim() || null,
        location:
          card.querySelector(".job-search-card__location")?.innerText?.trim() ||
          null,
        link: card.querySelector("a")?.href || null,
      })),
    )
    .catch(() => []);

  console.log(`Jobs found: ${jobs.length}`);

  if (jobs.length === 0) {
    console.log("⚠️ No jobs found — likely blocked by LinkedIn");
  }

  for (const job of jobs) {
    await Actor.pushData(job);
  }

  await browser.close();
} catch (err) {
  console.error("ERROR:", err.message);
  console.error(err.stack);
}

await Actor.exit();
