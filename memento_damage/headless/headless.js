// Libraries
const puppeteer = require('puppeteer');
const fs = require('fs');
const crypto = require('crypto');

// if (process.argv.length < 3) {
//     console.error('Usage: node headless.js <URI> <output_dir> [redirect] [viewport_w x viewport_h] [log_level] [timeout]');
//     process.exit(1);
// }

// url = system.args[1];
// outputDir = system.args[2];
url = 'http://web.archive.org/web/20040208171032/http://www.deviantart.com:80/';
outputDir = './test';
// hashedUrl = crypto.createHash('md5').update(url).digest("hex");

// REMOVE AFTER TESTING
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
}

async function headless(url) {
    const browser = await puppeteer.launch({
        ignoreHTTPSErrors: true,
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

        // Metrics
        const metrics = await page.getMetrics();
        console.log(metrics);

        // get all resources ~ does not include response codes
        const urls = await page.evaluate(() => {
            return performance.getEntries();
        });
        console.log(urls);

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

console.log("This executes first");
