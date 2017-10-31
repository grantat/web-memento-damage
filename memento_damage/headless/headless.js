// v0.12.0 puppeteer
const puppeteer = require('puppeteer');
const fs = require('fs');
const crypto = require('crypto');

// if (process.argv.length < 3) {
//     console.error('Usage: node headless.js <URI> <output_dir> [redirect] [viewport_w x viewport_h] [log_level] [timeout]');
//     process.exit(1);
// }

// url = system.args[1];
var outputDir = process.argv[2] || './test';
url = 'http://web.archive.org/web/20040208171032/http://www.deviantart.com:80/';
// url = 'https://f-measure.blogspot.com';
var hashedUrl = crypto.createHash('md5').update(url).digest("hex");
var networkResources = {};
var reverseRedirectMapping = {};
var redirectMapping = {};
var Log = {'DEBUG': 10, 'INFO': 20};
var starttime = Date.now();

// REMOVE AFTER TESTING
console.log("Testing", url);
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
}

async function headless(url) {
    const browser = await puppeteer.launch({
        ignoreHTTPSErrors: true,
        // headless: false,
    });
    const page = await browser.newPage();

    page.emulate({
        viewport: {
            width: 1024,
            height: 768,
        },
        userAgent: "memento-damage research ODU <@WebSciDL>",
    });

    try {
        // track failed responses ~ Security blocks, etc.
        page.on('requestfailed', request => {
          if(request.response()){
              console.log(request.url, request.response().status);
          }else{
              console.log(request.url, request.response());
          }
        });

        page.on('response', response => {
          console.log(response.url, response.status, response.headers);
        });

        // stack trace
        await page.tracing.start({
            path: outputDir + '/trace.json',
        });
        // timeout at 5 minutes (5 * 60 * 1000ms), network idle at 3 seconds
        await page.goto(url, {
            waitUntil: 'networkidle',
            timeout: 300000,
            networkIdleTimeout: 3000,
        });
        await page.tracing.stop();

        // Take screenshots
        await page.screenshot({
            path: outputDir + '/thumbnail.png'
        });
        await page.screenshot({
            path: outputDir + '/fullpage.png',
            fullPage: true
        });

        // Get page content (html, xml, etc)
        const cont = await page.content();
        await fs.writeFile(outputDir + "/content.html", cont, function(err) {
            if (err) {
                return console.log(err);
            }
            console.log("The file was saved!");
        });

    } catch (e) {
        console.log("Failed with error:", e);
        process.exit(1);
    }

    browser.close();
}

// Execute
headless(url).then(v => {
    // Once all the async parts finish this prints.
    console.log("Finished Headless");
});
