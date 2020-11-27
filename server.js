const express = require("express");
require("dotenv").config();
const mongoose = require("mongoose");
const ShortUrl = require("./models/shortUrl");
const app = express();
const bcrypt = require("bcrypt");
const Auth = require("./models/users");
const passport = require("passport");
const flash = require("express-flash");
const session = require("express-session");

const initializePassport = require("./passport-config");
initializePassport(
  passport,
  (email) => {
    return Auth.find((user) => user.email === email);
  },
  (id) => Auth.find((user) => user.id === id)
);

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: false }));
app.use(flash);
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize);
app.use(passport.session);

app.get("/s", async (req, res) => {
  const shortUrls = await ShortUrl.find();
  res.render("index", { shortUrls: shortUrls });
});
app.get("/in", async (req, res) => {
  res.send(
    "<div><h1> Log in to use Short Shortnner </h1><h4><a href='https://short-shortnner.vercel.app/'>Go back to Short Shortnner</a></h4><h4><a href='https://shortnner.herokuapp.com/'>Start Shortening your URLs</a></h4></div>"
  );
});

app.get("/", (req, res) => {
  res.render("app");
});

app.get("/login", (req, res) => {
  res.render("login.html", { name: req.body.name });
});
app.post("/login", () => {
  passport.authenticate("local"),
    {
      successRedirect: "/s",
      failureRedirect: "/login",
      failureFlash: true,
    };
});

app.get("/register", (req, res) => {
  res.render("register.html");
});

app.post("/register", async (req, res) => {
  try {
    mongoose.connect(
      `mongodb://Mubashir:y4gQEVGPQKq0gQ9c@cluster0-shard-00-00.ochei.mongodb.net:27017,cluster0-shard-00-01.ochei.mongodb.net:27017,cluster0-shard-00-02.ochei.mongodb.net:27017/${req.body.email}?ssl=true&replicaSet=atlas-5s5ecj-shard-0&authSource=admin&retryWrites=true&w=majority`,
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }
    );
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    await Auth.create({
      password: hashedPassword,
      email: req.body.email,
      name: req.body.name,
    });
    res.redirect("/login");
  } catch {
    alert("Registration Failed.");
    res.redirect("/register");
  }
}); //works now
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

app.listen(process.env.PORT || 3000);
