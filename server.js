const express = require("express");
require("dotenv").config();
const mongoose = require("mongoose");
const ShortUrl = require("./models/shortUrl");
const app = express();
const bcrypt = require("bcrypt");
const Auth = require("./models/users");
const { name } = require("ejs");

//auth config

var passport = require("passport");
var GitHubStrategy = require("passport-github2").Strategy;

//connecting to mongodb

mongoose.connect(
    "mongodb://Mubashir:y4gQEVGPQKq0gQ9c@cluster0-shard-00-00.x4m8k.mongodb.net:27017,cluster0-shard-00-01.x4m8k.mongodb.net:27017,cluster0-shard-00-02.x4m8k.mongodb.net:27017/shortnner?ssl=true&replicaSet=atlas-en1n15-shard-0&authSource=admin&retryWrites=true&w=majority", {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    }
);

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: false }));

app.get("/", async(req, res) => {
    const shortUrls = await ShortUrl.find();
    res.render("index", { shortUrls: shortUrls });
});

app.set("views", __dirname + "/views");
app.engine("html", require("ejs").renderFile);

app.get("/auth", (req, res) => {
    res.render("auth.html");
});


passport.use(
    new GitHubStrategy({
            clientID: "e24a3ac1874eb843555e",
            clientSecret: "f93532099cc9ea7a254d3763fc85bf3e76933810",
            callbackURL: "http://localhost:3000/auth/github/callback",
        },
        function(accessToken, refreshToken, profile, done) {
            console.log(profile)
        }
    )
)
app.get(
    "/auth/github",
    passport.authenticate("github", { scope: ["user:email"] })
);

app.get(
    "/auth/github/callback",
    passport.authenticate("github", { failureRedirect: "/login" }),
    function(req, res) {
        // Successful authentication, redirect home.
        res.redirect("/");
    }
);

app.post("/shortUrls", async(req, res) => {
    await ShortUrl.create({ full: req.body.fullUrl });

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

app.listen(process.env.PORT || 3000, () => console.log("running at 3000 port"));