const express = require("express");
require("dotenv").config();
const mongoose = require("mongoose");
const ShortUrl = require("./models/shortUrl");
const app = express();
const bcrypt = require("bcrypt");
const Auth = require("./models/users");
const { name } = require("ejs");
const ejsLint = require('ejs-lint');

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
//getting user location
const expressip = require('express-ip');

app.use(expressip().getIpInfoMiddleware);


app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: false }));



app.set("views", __dirname + "/views");
app.engine("html", require("ejs").renderFile);

app.get("/auth", (req, res) => {
    res.render("auth.html");
    const ipInfo = request.ipInfo
});

passport.use(new GitHubStrategy({
        clientID: "e24a3ac1874eb843555e",
        clientSecret: "f93532099cc9ea7a254d3763fc85bf3e76933810",
        callbackURL: "http://localhost:3000/auth/github/callback",
    },
    function(accessToken, refreshToken, profile, done) {
        let email = profile._json.email

        Auth.create({ name:profile.displayName,email: profile._json.email,GithubId: profile.id, country: ipInfo.country, city:ipInfo.city}, function (err, user) {
            return done(err, user);
        });

        app.get("/", async(req, res) => {
            const shortUrls = await ShortUrl.find();
            const url = await ShortUrl.find({ realEmail: email});
            res.render("index", { shortUrls: shortUrls ,url:url, userEmail:profile._json.email, userName:profile.displayName,id:profile.id});
        });
        app.post("/shortUrls", async(req, res) => {
            let ip = req.ip
            await ShortUrl.create({ full: req.body.fullUrl ,GivenEmail:req.body.email,name:profile.displayName,realEmail:profile.email, ip:ip});

            res.redirect("/");
        });

    }
));
// Configure Passport authenticated session persistence.
//
// In order to restore authentication state across HTTP requests, Passport needs
// to serialize users into and deserialize users out of the session.  In a
// production-quality application, this would typically be as simple as
// supplying the user ID when serializing, and querying the user record by ID
// from the database when deserializing.  However, due to the fact that this
// example does not have a database, the complete Facebook profile is serialized
// and deserialized.
passport.serializeUser(function(user, done) {
    done(null, user);
});

passport.deserializeUser(function(obj, done) {
    done(null, obj);
});

app.use(require('body-parser').urlencoded({ extended: true }));
app.use(require('express-session')({ secret: 'keyboard cat', resave: true, saveUninitialized: true }));

// Initialize Passport and restore authentication state, if any, from the
// session.
app.use(passport.initialize());
app.use(passport.session());

app.get(
    "/auth/github/",
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
var GoogleStrategy = require( 'passport-google-oauth2' ).Strategy;

passport.use(new GoogleStrategy({
        clientID:    '220565751325-99unjjb3n77re39faolb1iks9u3n0tle.apps.googleusercontent.com',
        clientSecret: 'xJLEn_2v1VQ3UPxjGahh2QtD',
        callbackURL: "http://localhost:3000/auth/google/callback",
        passReqToCallback   : true
    },
    function(request, accessToken, refreshToken, profile, done) {
        let email= profile.email
        const ipInfo = request.ipInfo;
        Auth.create({name:profile.displayName, email:profile.email, GoogleId: profile.id , ip: request.connection.remoteAddress, country: ipInfo.country, city:ipInfo.city
        }, function (err, user) {
            return done(err, user);
        });
        app.get("/", async(req, res) => {
            const shortUrls = await ShortUrl.find();
            const url = await ShortUrl.find({ realEmail: email });
            res.render("index", { shortUrls: shortUrls ,url:url, userEmail:profile.email, userName:profile.displayName,id:profile.id});
        });
        app.post("/shortUrls", async(req, res) => {
            let ip= req.ip
            await ShortUrl.create({ full: req.body.fullUrl ,GivenEmail:req.body.email,name:profile.displayName,realEmail:profile.email, ip:ip});

            res.redirect("/");
        });
    }
));

app.get('/auth/google',
    passport.authenticate('google', { scope:
            [ 'email', 'profile' ] }
    ));

app.get( '/auth/google/callback',
    passport.authenticate( 'google', {
        successRedirect: '/',
        failureRedirect: '/auth/'
    }));




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
