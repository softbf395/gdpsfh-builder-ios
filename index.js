const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const downloadPath = path.join(__dirname, 'gdpsfh-ipa.ipa');  // Save as .ipa

(async () => {
  const browser = await puppeteer.launch({
    headless: false,  // Run in non-headless mode to interact with browser (needed for auto-download)
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-extensions',
      '--disable-gpu',
      '--disable-software-rasterizer',
    ],
  });

  const page = await browser.newPage();

  // Set the download behavior to save the file directly
  const downloadFolder = path.join(__dirname, 'downloads');
  if (!fs.existsSync(downloadFolder)) {
    fs.mkdirSync(downloadFolder);
  }

  await page._client.send('Page.setDownloadBehavior', {
    behavior: 'allow',
    downloadPath: downloadFolder,  // Save to the 'downloads' folder
  });

  // Navigate to the IPA maker URL
  await page.goto(process.env.IPA_MAKER_URL);

  // Wait for the file to start downloading (Assumes the file automatically starts downloading)
  await page.waitForTimeout(10000);  // Adjust wait time if needed

  // Move the file after download completes
  const downloadedFile = path.join(downloadFolder, 'gdpsfh-ipa.ipa');

  if (fs.existsSync(downloadedFile)) {
    fs.renameSync(downloadedFile, downloadPath);  // Move to the desired location
    console.log('IPA downloaded successfully as gdpsfh-ipa.ipa');
  } else {
    console.error('Failed to download the IPA file.');
    process.exit(1);
  }

  await browser.close();
})();

