const puppeteer = require("puppeteer");
const fs = require("fs");
const JSSoup = require("jssoup").default;

const BASE_PATH = process.argv[2] || "http://www.next.smallsforsmalls.com";
const SAVE_DIRECTORY =
  process.argv[3] || "/Users/lele/Desktop/get-html/statics";

const pages = ["/", "/get-started", "/examples", "/shopping", "/404"];

(async () => {
  const browser = await puppeteer.launch();
  const browserPage = await browser.newPage();

  // --------------------------------------------------------------------
  // -- Download static files (js, css, media) --------------------------
  // --------------------------------------------------------------------
  await browserPage.on("response", async (response) => {
    const url = response.url();
    if (response.status() === 200 && url.includes("static")) {
      const filePath = url.replace(BASE_PATH, "");
      const savePath = `${SAVE_DIRECTORY}${filePath}`;

      const data = await response.text();

      fs.writeFile(savePath, data, function (err) {
        if (err) {
          console.log("❌  Error processing static: ", filePath);
          console.log(err);
        }
        console.log(`💾 File saved at: ${savePath}`);
      });
    }
  });

  try {
    for (let i = 0; i < pages.length; i++) {
      const page = pages[i];
      const pageURL = `${BASE_PATH}${page}`;
      console.log(`======= Processing URL: ${pageURL} ==================`);

      await browserPage.goto(pageURL);
      await browserPage.waitForSelector("#start");

      var html = await browserPage.content();
      var soup = new JSSoup(html);

      let imgs = soup.findAll("img");
      let links = soup.findAll("link");
      let mediaSources = soup.findAll("source");

      // --------------------------------------------------------------------
      // -- Format imgs to pull imgs ----------------------------------------
      // --------------------------------------------------------------------
      if (imgs.length) {
        console.log("🔎 Found Images");
        imgs = imgs.map((img) => {
          const { src } = img.attrs;
          if (src.startsWith("/static/")) {
            img.attrs.src = `.${img.attrs.src}`;
          } else {
            img.attrs.src = `https:${img.attrs.src}`;
          }
          console.log("🖼  Image fixed - ", img.attrs.src);
        });
      }

      // --------------------------------------------------------------------
      // -- Format source media to pull sources  ----------------------------
      // --------------------------------------------------------------------
      if (mediaSources.length) {
        console.log("🔎 Found Media Sources");
        mediaSources.map((m) => {
          m.attrs.srcset = `https:${m.attrs.srcset}`;
          console.log("✅  Media source path fixed - ", m.attrs.srcset);
        });
      }

      // --------------------------------------------------------------------
      // -- Fix /static/ to ./static ----------------------------------------
      // --------------------------------------------------------------------
      if (links.length) {
        console.log("🔎 Found Static Links");
        links.map((l) => {
          l.attrs.href = `.${l.attrs.href}`;
          console.log("✅  Static path fixed - ", l.attrs.href);
        });
      }

      // --------------------------------------------------------------------
      // -- Save HTML to file -----------------------------------------------
      // --------------------------------------------------------------------
      html = soup.prettify();
      const fileName = page === "/" ? "/index" : page;
      const savePath = `${SAVE_DIRECTORY}${fileName}.html`;
      fs.writeFile(savePath, html, function (err) {
        if (err) {
          console.log(`❌  Error saving HTML: ${savePath}`);
          return console.log(err);
        }
        console.log(`======= 🎉 HTML File saved at: ${savePath} =====`);
      });
    }
  } catch (error) {
    console.log("❌  Error catched ");
    console.log(error.message);
  } finally {
    browser.close();
  }
})();
