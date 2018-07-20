var express = require("express");
var exphbs = require("express-handlebars");
var bodyParser = require("body-parser");
var mongoose = require("mongoose");

// Makes HTTP request for HTML page
var request = require("request");

// Scraping tool
var cheerio = require("cheerio");

// Variable app now refers to express
var app = express();

// Allowing express to access the port at 8080 if it isn't already
var PORT = process.env.PORT || 8080;

// Requiring our models for syncing
var db = require("./models");

// Serve static content for the app from the "public" directory in the application directory.
app.use(express.static("public"));

// Parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

// Parse application/json
app.use(bodyParser.json());

// Handlebars in express
app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

// If deployed, use the deployed database. Otherwise use the local mongoHeadlines database
var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/news-blog";

// Set mongoose to leverage built in JavaScript ES6 Promises
// Connect to the Mongo DB
mongoose.Promise = Promise;
mongoose.connect(MONGODB_URI);

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

        // Create a new Article using the `result` object built from scraping
        db.Article.create(result).then(function (dbArticle) {
            // View the added result in the console
            console.log(dbArticle);
        }).catch(function (err) {
            // If an error occurred, send it to the client
            return res.json(err);
        });
    });
});

// Start the server
app.listen(PORT, function () {
    console.log("App running on port " + PORT + "!");
});