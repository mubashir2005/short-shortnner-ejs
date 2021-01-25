const express = require("express");
require("dotenv").config();
const mongoose = require("mongoose");
const ShortUrl = require("./models/shortUrl");
const app = express();
const ejsLint = require('ejs-lint');

const requestIp = require('request-ip');

// inside middleware handler
const ipMiddleware = function(req, res, next) {
    const clientIp = requestIp.getClientIp(req);
    next();
};



//connecting to mongodb

mongoose.connect(
    process.env.URI,{
        useNewUrlParser: true,
        useUnifiedTopology: true,
    }
);


app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: false }));



app.get("/", async(req, res) => {
    let ip = req.headers['x-forwarded-for'] ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        (req.connection.socket ? req.connection.socket.remoteAddress : null);
    console.log(ip)
    const shortUrls = await ShortUrl.find();
    const url = await ShortUrl.find({ip:ip});
    res.render("index", { shortUrls: shortUrls ,url:url});

});
app.post("/shortUrls", async(req, res) => {
    let ip = req.headers['x-forwarded-for'] ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        (req.connection.socket ? req.connection.socket.remoteAddress : null);
    await ShortUrl.create({ full: req.body.fullUrl, shortid: req.shortid ,ip:ip});

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



/*
//securing server

const helmet = require('helmet');
app.use(helmet())

app.disable('x-powered-by')

*/

// //listening to server
app.listen(process.env.PORT || 3000, () => console.log("running at 3000 port"));
