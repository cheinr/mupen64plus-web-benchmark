const puppeteer = require('puppeteer');


(async () => {
  const browser = await puppeteer.launch({headless: false });
  const page = await browser.newPage();

  await page.goto('http://localhost:1337');


  const elementHandle = await page.$("input[type=file]");
  await elementHandle.uploadFile('./m64p_test_rom.v64');

  await page.waitForSelector('#done', { timeout: 60000 });

  const stats = await page.evaluate('stats');

  console.log("| VI Count | VIs / sec. | Average VI Time Millis | Total Time |");

  console.log(`| ${stats.viCount} | ${(stats.viCount / (stats.totalRunTime / 1000)).toFixed(3)} | ${(stats.totalRunTime / stats.viCount).toFixed(3)} | ${(stats.totalRunTime / 1000).toFixed(3)} |`);
  
  await browser.close();
})();
