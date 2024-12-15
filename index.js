const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const downloadPath = path.join(__dirname, 'gdpsfh-ipa.ipa');

async function downloadIPA(url) {
  const browser = await puppeteer.launch({
    headless: false,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-extensions',
      '--disable-gpu',
      '--disable-software-rasterizer',
    ],
  });

  const page = await browser.newPage();

  const downloadFolder = path.join(__dirname, 'downloads');
  if (!fs.existsSync(downloadFolder)) {
    fs.mkdirSync(downloadFolder);
  }

  const downloadedFilename = await page.evaluate(() => {
    return new Promise(resolve => {
      const listener = event => {
        if (event.type === 'DownloadWillBegin') {
          resolve(event.suggestedFilename);
        }
      };
      window.addEventListener('download', listener);
      const link = document.createElement('a');
      link.href = 'your_download_url'; // Replace with the actual download URL
      link.download = 'gdpsfh-ipa.ipa';
      link.click();
    });
  });

  // Wait for the download to complete (adjust the timeout as needed)
  await page.waitForTimeout(10000);

  const downloadedFile = path.join(downloadFolder, downloadedFilename);

  if (fs.existsSync(downloadedFile)) {
    fs.renameSync(downloadedFile, downloadPath);
    console.log('IPA downloaded successfully as gdpsfh-ipa.ipa');
  } else {
    console.error('Failed to download the IPA file.');
  }

  await browser.close();
}

// Replace 'https://your-ipa-maker-url' with the actual URL
downloadIPA('${{ inputs.ipa_maker_url }}')
  .catch(error => {
    console.error('Error:', error);
  });

