export const scrapeJobDetail = async (page, url) => {
  try {
    await page.goto(url);

    await page.waitForTimeout(2000);

    const description = await page
      .$eval(".description__text", (el) => el.innerText)
      .catch(() => null);

    const seniority = await page
      .$eval(
        ".description__job-criteria-text:nth-child(1)",
        (el) => el.innerText,
      )
      .catch(() => null);

    return { description, seniority };
  } catch {
    return {};
  }
};
