var db = require("../models");
var cheerio = require("cheerio");
var request = require("request");

module.exports = function (app) {
    // A GET route for home page that also scraps the nhl.com website
    app.get("/scrape", function (req, res) {
        var count = 0;

        request("https://www.nhl.com/", function (error, response, html) {
            // Load the body of the HTML into cheerio
            var $ = cheerio.load(html);

            // Empty array to save our scraped data
            var result = [];

            // With cheerio, find each h4-tag with the class "headline-link" and loop through the results
            const articles = $("h4.headline-link").map(function (i, element) {

                // Save the text of the h4-tag as "title"
                var title = $(element).text();

                // Find the h4 tag's parent a-tag, and save it's href value as "link"
                var link = $(element).parent().attr("href");

                result = {
                    title: title,
                    link: link
                }

                return new Promise((resolve, reject) => {
                    db.Article.update(
                        { title: result.title },
                        { $set: { title: result.title, link: result.link } },
                        { upsert: true, multi: true },
                        function (err, inserted) {
                            if (err) {
                                console.log(err);
                                reject(err);
                            } else {
                                if (inserted.upserted) {
                                    count++;
                                    console.log("Upserted " + count);
                                };
                                resolve();
                            };
                        }
                    );
                });
            // turn cheerios objects into arrays
            }).toArray();

            Promise.all(articles).then(() => {
                res.render("scrape", { articleCount: count });
            }).catch(err => console.log('Error: ', err));
        });
    });

    app.get("/articles", function (req, res) {
        db.Article.find().then(function (dbArticle) {
            res.render("article", { articleObject: dbArticle });
        })
    })
};