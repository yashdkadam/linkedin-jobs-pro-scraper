export const randomDelay = async (page) => {
  await page.waitForTimeout(2000 + Math.random() * 3000);
};
