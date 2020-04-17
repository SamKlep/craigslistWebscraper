const puppeteer = require("puppeteer");
const cheerio = require("cheerio");
const mongoose = require("mongoose");
const Listing = require("./model/Listing");
//craigslistuser:Bubba23!
const scrapingResults = [
    {
        title: "In-house Shopify Jr Web Developer & Customer Support (I-45 N. at West Rd.)",
        datePosted: new Date("2020-04-13 12:00:00"),
        neighborhood: "(I-45 N. at West Rd.)",
        url: "https://houston.craigslist.org/web/d/houston-in-house-shopify-jr-web/                 7107727829.html",
        jobDescription: "We are looking for a Jr. Web Developer for Shopify, who is motivated to    combine the art of design with the art of programming. Responsibilities will include      translation of the UI/UX design wireframes to actual code that will produce visual        elements of the application.",
        compensation: "$15 Per hour / 32 hrs a week"
    }
];

async function connectToMongoDb() {
    await mongoose.connect(
        "mongodb+srv://dev1:Bubba23!@cluster0-rssvn.mongodb.net/test?retryWrites=true&w=majority",
        { useNewUrlParser: true },
    );
    console.log("connected to mongodb");
}

async function scrapeListings(page) {
    
    await page.goto(
        "https://houston.craigslist.org/search/jjj?query=web"
    );
    const html = await page.content();
    const $ = cheerio.load(html);
    const listings = $(".result-info")
        .map((index, element) => {
            const titleElement = $(element).find(".result-title");
            const timeElement = $(element).find(".result-date");
            const title = $(titleElement).text();
            const url = $(titleElement).attr("href");
            const datePosted = new Date($(timeElement).attr("datetime"));
            return { title, url, datePosted };
        })
        .get();
        return listings;
}

async function scrapeJobDescriptions(listings, page) {
    for (var i =0; i < listings.length; i++) {
        await page.goto(listings[i].url);
        const html = await page.content();
        const $ = cheerio.load(html);
        const jobDescription = $("#postingbody").text();
        const compensation = $("p.attrgroup > span:nth-child(1) > b").text();
        listings[i].jobDescription = jobDescription;
        listings[i].compensation = compensation;
        console.log(listings[i].jobDescription);
        console.log(listings[i].compensation);
        const listingModel = new Listing(listings[i]);
        await listingModel.save();
        await sleep(1000); // 1 second sleep
    }
}

async function sleep(miliseconds) {
    return new Promise(resolve => setTimeout(resolve, miliseconds));
}

async function main() {
    await connectToMongoDb();
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    const listings = await scrapeListings(page);
    const listingsWithJobDescriptions = await scrapeJobDescriptions(listings, page);
    console.log(listings);
}

main();

