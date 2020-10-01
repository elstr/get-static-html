// Terminar de probar con array de urls
// si img url es static la estoy cagando en el src  [X]
/* <img src="http:/static/media/arrow-up.ae38dd10.svg" alt="Back to top" / */

const puppeteer = require("puppeteer");
const fs = require("fs");
const JSSoup = require("jssoup").default;

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  const pageURL = process.argv[2] || "http://localhost:3000";
  const saveDirectory =
    process.argv[3] || "/Users/lele/Desktop/get-html/statics";
  const fileName = "home.html";
  console.log("Processing URL: ", pageURL);

  try {
    await page.goto(pageURL);
    await page.waitForSelector("#start");

    var html = await page.content();
    var soup = new JSSoup(html);
    var imgs = soup.findAll("img");

    imgs = imgs.map((img) => {
      if (!img.src.contains("static/")) {
        img.attrs.src = `http:${img.attrs.src}`;
      }
    });

    html = soup.prettify();

    console.log(html);

    fs.writeFile(`${saveDirectory}/${fileName}`, html, function (err) {
      if (err) {
        return console.log(err);
      }
      console.log(`File saved`);
    });

    await page.screenshot({ path: `example-index.png` });
  } catch (error) {
    console.log(error.message);
  }

  browser.close();
})();
