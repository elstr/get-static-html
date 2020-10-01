// Terminar de probar con array de urls
// si img url es static la estoy cagando en el src  [X]
/* <img src="http:/static/media/arrow-up.ae38dd10.svg" alt="Back to top" / */

const puppeteer = require("puppeteer");
const fs = require("fs");
const JSSoup = require("jssoup").default;

const BASE_PATH = process.argv[2] || "http://localhost:3000";
const SAVE_DIRECTORY =
  process.argv[3] || "/Users/lele/Desktop/get-html/statics";

const pages = ["/", "/examples", "/get-started", "/shopping"];

(async () => {
  const browser = await puppeteer.launch();
  const browserPage = await browser.newPage();
  try {
    for (let i = 0; i < pages.length; i++) {
      const page = pages[i];
      const pageURL = `${BASE_PATH}${page}`;
      console.log("Processing URL: ", pageURL);

      await browserPage.goto(pageURL);
      await browserPage.waitForSelector("#start");

      var html = await browserPage.content();
      var soup = new JSSoup(html);

      // Format imgs --------------
      var imgs = soup.findAll("img");
      imgs = imgs.map((img) => {
        const { src } = img.attrs;
        if (!src.includes("static/") && !src.includes("http")) {
          img.attrs.src = `http:${img.attrs.src}`;
        }
      });

      html = soup.prettify();

      // Save file --------------
      const fileName = page === "/" ? "/index" : page;
      fs.writeFile(`${SAVE_DIRECTORY}${fileName}.html`, html, function (err) {
        if (err) {
          return console.log(err);
        }
        console.log(`File saved`);
      });

      await browserPage.screenshot({ path: `example-index.png` });
    }
  } catch (error) {
    console.log(error.message);
  } finally {
    browser.close();
  }
})();
