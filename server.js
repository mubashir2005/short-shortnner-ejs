const express = require("express");
require("dotenv").config();
const mongoose = require("mongoose");
const ShortUrl = require("./models/shortUrl");
const app = express();
const bcrypt = require("bcrypt");
const Auth = require("./models/users");
const { name } = require("ejs");

//connecting to mongodb

mongoose.connect(
  "mongodb://Mubashir:y4gQEVGPQKq0gQ9c@cluster0-shard-00-00.x4m8k.mongodb.net:27017,cluster0-shard-00-01.x4m8k.mongodb.net:27017,cluster0-shard-00-02.x4m8k.mongodb.net:27017/shortnner?ssl=true&replicaSet=atlas-en1n15-shard-0&authSource=admin&retryWrites=true&w=majority",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: false }));

app.get("/s", async (req, res) => {
  const shortUrls = await ShortUrl.find();
  res.render("index", { shortUrls: shortUrls });
});
app.get("/in", async (req, res) => {
  res.send(
    "<div><h1> Log in to use Short Shortnner </h1><h4><a href='https://short-shortnner.vercel.app/'>Go back to Short Shortnner</a></h4><h4><a href='https://shortnner.herokuapp.com/'>Start Shortening your URLs</a></h4></div>"
  );
});
app.set("views", __dirname + "/views");
app.engine("html", require("ejs").renderFile);

app.get("/", (req, res) => {
  res.render("app.html");
});
app.set("views", __dirname + "/views");
app.engine("html", require("ejs").renderFile);

app.get("/login", (req, res) => {
  res.render("login.html");
});

app.get("/register", (req, res) => {
  res.render("register.html");
});

var passport = require("passport");
var GoogleStrategy = require("passport-google-oauth").OAuth2Strategy;

// Use the GoogleStrategy within Passport.
//   Strategies in Passport require a `verify` function, which accept
//   credentials (in this case, an accessToken, refreshToken, and Google
//   profile), and invoke a callback with a user object.
passport.use(
  new GoogleStrategy(
    {
      clientID: '28013134812-qc5lbogacg4cf42etiruqveskh8vaqgh.apps.googleusercontent.com',
      clientSecret: '8RMMnYHtNF1If5fw-njXYJUV',
      callbackURL: "http://www.example.com/auth/google/callback",
    },
    function (accessToken, refreshToken, profile, done) {
      User.findOrCreate({ googleId: profile.id }, function (err, user) {
        return done(err, user);
      });
    }
  )
);

// GET /auth/google
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  The first step in Google authentication will involve
//   redirecting the user to google.com.  After authorization, Google
//   will redirect the user back to this application at /auth/google/callback
app.get(
  "/auth/google",
  passport.authenticate("google", {
    scope: ["https://www.googleapis.com/auth/plus.login"],
  })
);

// GET /auth/google/callback
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  If authentication fails, the user will be redirected back to the
//   login page.  Otherwise, the primary route function function will be called,
//   which, in this example, will redirect the user to the home page.
app.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  function (req, res) {
    res.redirect("/");
  }
);

app.post("/shortUrls", async (req, res) => {
  await ShortUrl.create({ full: req.body.fullUrl });

  res.redirect("/");
});

app.get("/:shortUrl", async (req, res) => {
  const shortUrl = await ShortUrl.findOne({ short: req.params.shortUrl });
  if (shortUrl === null) {
    return res.sendStatus(404);
  }

  shortUrl.clicks++;
  shortUrl.save();

  res.redirect(shortUrl.full);
});

app.listen(process.env.PORT || 3000, () => console.log("running at 3000 port"));
