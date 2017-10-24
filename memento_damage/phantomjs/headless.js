const puppeteer = require('puppeteer');
const fs = require('fs');

(async() => {

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

try{
  // timeout at 5 minutes (5 * 60 * 1000ms), network idle at 3 seconds
  await page.goto('http://web.archive.org/web/20170702110952/yahoo.com', {waitUntil: 'networkidle', timeout: 300000, networkIdleTimeout: 3000});

  // // scroll page to load images loaded by javascript
  // page.evaluate(_ => {
  //   window.scrollBy(0, window.innerHeight);
  // });

  await page.screenshot({ path: './thumbnail.png' });
  await page.screenshot({ path: './fullpage.png', fullPage: true });
  const cont = await page.content();

  fs.writeFile("./content.html", cont, function(err) {
    if(err){
      return console.log(err);
    }
    console.log("The file was saved!");
  });
}catch(e){
  console.log("Failed with error:", e);
}

browser.close();
})();
