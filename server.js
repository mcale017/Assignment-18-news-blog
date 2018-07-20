var express = require("express");
var exphbs = require("express-handlebars");
var bodyParser = require("body-parser");
var mongoose = require("mongoose");

// // Makes HTTP request for HTML page
// var request = require("request");

// // Scraping tool
// var cheerio = require("cheerio");

// Variable app now refers to express
var app = express();

// Allowing express to access the port at 8080 if it isn't already
var PORT = process.env.PORT || 8080;

// Requiring our models for syncing
// var db = require("./models");

// Serve static content for the app from the "public" directory in the application directory.
app.use(express.static("public"));

// Parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

// Parse application/json
app.use(bodyParser.json());

// Handlebars in express
app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

// Require both api & html routes
require("./routes/article-api-routes.js")(app);
require("./routes/html-routes.js")(app);

// If deployed, use the deployed database. Otherwise use the local mongoHeadlines database
var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/news-blog";

// Set mongoose to leverage built in JavaScript ES6 Promises
// Connect to the Mongo DB
mongoose.Promise = Promise;
mongoose.connect(MONGODB_URI);

// Start the server
app.listen(PORT, function () {
    console.log("App running on port " + PORT + "!");
});