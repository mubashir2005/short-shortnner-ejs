const express = require("express");
require("dotenv").config();
const mongoose = require("mongoose");
const ShortUrl = require("./models/shortUrl");
const app = express();
const ejsLint = require('ejs-lint');
require('dotenv').config()



var passport = require("passport");
var GitHubStrategy = require("passport-github2").Strategy;

//connecting to mongodb

mongoose.connect(
    "mongodb://Mubashir:y4gQEVGPQKq0gQ9c@cluster0-shard-00-00.x4m8k.mongodb.net:27017,cluster0-shard-00-01.x4m8k.mongodb.net:27017,cluster0-shard-00-02.x4m8k.mongodb.net:27017/shortnner?ssl=true&replicaSet=atlas-en1n15-shard-0&authSource=admin&retryWrites=true&w=majority", {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    }
);
//getting user location
const expressip = require('express-ip');

app.use(expressip().getIpInfoMiddleware);


app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: false }));



app.get("/", async(req, res) => {
    let ip= req.ip
    const shortUrls = await ShortUrl.find();
    const url = await ShortUrl.find({ip:ip});
    res.render("index", { shortUrls: shortUrls ,url:url});
});
app.post("/shortUrls", async(req, res) => {
    let ip= req.ip
    await ShortUrl.create({ full: req.body.fullUrl, ip:ip, shortid: req.shortid});

    res.redirect("/");
});

app.get("/:shortUrl", async(req, res) => {
    const shortUrl = await ShortUrl.findOne({ short: req.params.shortUrl });
    if (shortUrl === null) {
        return res.sendStatus(404);
    }

    shortUrl.clicks++;
    shortUrl.save();

    res.redirect(shortUrl.full);

});
//securing server

const helmet = require('helmet');
app.use(helmet())

app.disable('x-powered-by')


//listening to server
app.listen(process.env.PORT || 3000, () => console.log("running at 3000 port"));
