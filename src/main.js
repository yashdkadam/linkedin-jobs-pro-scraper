import { Actor } from "apify";
import { scrapeJobs } from "./scraper.js";

await Actor.init();

const input = await Actor.getInput();

await scrapeJobs(input);

await Actor.exit();
