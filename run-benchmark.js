const puppeteer = require('puppeteer');
const yargs = require('yargs');
const fs = require('fs');
const path = require('path');


const runBenchmark = async (romPath) => {
  const browser = await puppeteer.launch({headless: false });
  const page = await browser.newPage();

  await page.goto('http://localhost:1337');

  const elementHandle = await page.$("input[type=file]");
  await elementHandle.uploadFile(romPath);

  await page.waitForSelector('#done', { timeout: 60000 });

  const stats = await page.evaluate('stats');

  stats.rom = path.basename(romPath);
  
  await browser.close();

  return stats;
};

(async () => {

  const argv = yargs.command('run-benchmark', 'Runs a benchmark for mupen64plus-web').option('romDir', {
    description: 'directory to search for roms in',
    type: 'string'
  }).argv;

  let benchmarks = [];

  if (argv.romDir) {
    console.log('romDir: %o', argv.romDir);

    const roms = fs.readdirSync(argv.romDir).filter(file => {
      return file.match(/\..64/g);
    }).map((romName) => {
      return path.join(argv.romDir, romName);
    });

    console.log('found roms: %o', roms);

    for (let rom of roms) {
      benchmarks.push(await runBenchmark(rom));
    }
  } else {
    benchmarks.push(await runBenchmark('./m64p_test_rom.v64'));
  }

  console.log("| ROM Name | VI Count | VIs / sec. | Average VI Time Millis | VI Time Millis Standard Deviation | Total Time |");

  benchmarks.forEach((stats) => {

    let csv = "vi#,time,numberOfRecompiles\n";

    stats.viStats.forEach((viStat, index) => {
      csv += `${index},${viStat.time},${viStat.numberOfRecompiles}\n`;
    });

    const viTimeAverage = stats.totalViRunTime / stats.viCount;

    let viSquaredTimeDifferencesSum = 0;
    stats.viStats.forEach((viStat) => {
      const difference = viStat.time - viTimeAverage;
      viSquaredTimeDifferencesSum = difference * difference;
    });

    const viTimeVariance = viSquaredTimeDifferencesSum / (stats.viCount - 1);
    const viTimeStandardDeviation = Math.sqrt(viTimeVariance);

    fs.writeFileSync(`./${stats.rom}-vi-stats.csv`, csv);

    console.log(`| ${stats.rom} | ${stats.viCount} | ${(stats.viCount / (stats.totalRunTime / 1000)).toFixed(3)} | ${viTimeAverage.toFixed(3)} | ${viTimeStandardDeviation.toFixed(6)} | ${(stats.totalRunTime / 1000).toFixed(3)} |`);
  });


  let totalViRunTimeForAllROMS = 0;
  let totalNumberOfVisForAllROMS = 0;
  benchmarks.forEach((stats) => {
    totalViRunTimeForAllROMS += stats.totalViRunTime;
    totalNumberOfVisForAllROMS += stats.viCount;
  });
  
  const allROMSAverageViTimeMillis = totalViRunTimeForAllROMS / totalNumberOfVisForAllROMS;

  let totalViSquaredTimeDifferencesSumForAllROMS = 0;
  benchmarks.forEach((stats) => {
    const difference = stats.viStats.forEach((viStat) => {
      const difference = viStat.time - allROMSAverageViTimeMillis;
      totalViSquaredTimeDifferencesSumForAllROMS = difference * difference;      
    });
  });

  const totalViTimeVarianceForAllROMS = totalViSquaredTimeDifferencesSumForAllROMS / (totalNumberOfVisForAllROMS - 1);
  const totalViTimeStandardDeviationForAllROMS = Math.sqrt(totalViTimeVarianceForAllROMS);

  
  console.log("Total Mean VI Time Millis: %d; σ=%d", allROMSAverageViTimeMillis.toFixed(6), totalViTimeStandardDeviationForAllROMS.toFixed(6));
})();

