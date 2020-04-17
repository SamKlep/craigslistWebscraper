const puppeteer = require("puppeteer");
const cheerio = require("cheerio");

const scrapingResults = [
    {
        title: "In-house Shopify Jr Web Developer & Customer Support (I-45 N. at West Rd.)",
        datePosted: new Date("2020-04-13 12:00:00"),
        neighborhood: "(I-45 N. at West Rd.)",
        url: "https://houston.craigslist.org/web/d/houston-in-house-shopify-jr-web/                 7107727829.html",
        jobDescription: "We are looking for a Jr. Web Developer for Shopify, who is motivated to    combine the art of design with the art of programming. Responsibilities will include      translation of the UI/UX design wireframes to actual code that will produce visual        elements of the application.",
        compensation: "$15 Per hour / 32 hrs a week"
    }
]

async function main() {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    await page.goto(
        "https://houston.craigslist.org/d/web-html-info-design/search/web"
    );
    const html = await page.content();
    const $ = cheerio.load(html);
    const results = $(".result-title").map((index, element) => {
        const title = $(element).text();
        const url = $(element).attr("href");
        return { title, url };
    })
    .get();
    console.log(results);
}

main();

