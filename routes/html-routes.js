var db = require("../models");
var cheerio = require("cheerio");
var request = require("request");

module.exports = function (app) {
    // A GET route for home page that also scraps the nhl.com website
    app.get("/", function (req, res) {
        request("https://www.nhl.com/", function (error, response, html) {
            // Load the body of the HTML into cheerio
            var $ = cheerio.load(html);

            // Empty array to save our scraped data
            var results = [];

            var current = [];

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

                current = {
                    title: title,
                    link: link
                }

                db.Article.update(
                    { title: current.title },
                    { $set : { title : current.title, link : current.link } },
                    { upsert: true, multi: true },
                    function(err, inserted) {
                        if (err) {
                            console.log(err);
                        } else {
                            console.log(inserted);

                            // if inserted.upserted !== null, then count++
                        };
                    }
                );
            });
        });

        res.render("index");
    });

    app.get("/articles", function(req, res) {
        db.Article.find().then(function(dbArticle) {
            res.render("article", { articleObject: dbArticle });
        })
    })
};