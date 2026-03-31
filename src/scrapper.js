import playwright from "playwright";
import { scrapeJobDetail } from "./detailScraper.js";
import { randomDelay } from "./utils.js";
import { Actor } from "apify";

export const scrapeJobs = async (input) => {
  const { searchUrls, maxJobs = 100, scrapeJobDetails = true } = input;

  const browser = await playwright.chromium.launch({ headless: true });
  const page = await browser.newPage();

  let results = [];
  let visited = new Set();

  for (const baseUrl of searchUrls) {
    let start = 0;

    while (results.length < maxJobs) {
      const url = `${baseUrl}&start=${start}`;
      await page.goto(url);

      await randomDelay(page);

      const jobs = await page.$$eval(".base-card", (cards) =>
        cards.map((card) => ({
          title: card.querySelector(".base-search-card__title")?.innerText,
          company: card.querySelector(".base-search-card__subtitle")?.innerText,
          location: card.querySelector(".job-search-card__location")?.innerText,
          link: card.querySelector("a")?.href,
        })),
      );

      if (!jobs.length) break;

      for (const job of jobs) {
        if (!job.link || visited.has(job.link)) continue;

        visited.add(job.link);

        let details = {};
        if (scrapeJobDetails) {
          details = await scrapeJobDetail(page, job.link);
        }

        const finalData = { ...job, ...details };

        results.push(finalData);
        await Actor.pushData(finalData);

        if (results.length >= maxJobs) break;
      }

      start += 25;
    }
  }

  await browser.close();
};
