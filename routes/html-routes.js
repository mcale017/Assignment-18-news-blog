var db = require("../models");
var cheerio = require("cheerio");
var request = require("request");

module.exports = function (app) {
    app.get("/", function (req, res) {
        res.render("index");
    });

    // A GET route for scraping the nhl.com website
    app.get("/scrape", function (req, res) {
        request("https://www.nhl.com/", function (error, response, html) {
            // Load the body of the HTML into cheerio
            var $ = cheerio.load(html);

            // Empty array to save our scraped data
            var results = [];

            // With cheerio, find each h4-tag with the class "headline-link" and loop through the results
            $("h4.headline-link").each(function (i, element) {

                // Save the text of the h4-tag as "title"
                var title = $(element).text();

                // Find the h4 tag's parent a-tag, and save it's href value as "link"
                var link = $(element).parent().attr("href");

                // Make an object with data we scraped for this h4 and push it to the results array
                results.push({
                    title: title,
                    link: link
                });
            });

            // console.log(results);

            var oldResults = [];

            db.Article.find().then(function (dbArticle) {
                console.log(dbArticle);
                oldResults.push(dbArticle);

                // Create a new Article using the `result` object built from scraping
                db.Article.update(
                    oldResults,
                    results,
                    {
                        upsert: true
                    }
                ).then(function (dbArticle2) {
                    // View the added result in the console
                    // console.log(dbArticle2);
                }).catch(function (err) {
                    // If an error occurred, send it to the client
                    return res.json(err);
                });
            });



            res.render("article");
        });
    });
};