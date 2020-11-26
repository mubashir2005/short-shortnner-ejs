const express = require("express");
require("dotenv").config();
const mongoose = require("mongoose");
const ShortUrl = require("./models/shortUrl");
const app = express();
const bcrypt = require("bcrypt");
const Auth = require("./models/users");

mongoose.connect(
  "mongodb://Mubashir:y4gQEVGPQKq0gQ9c@cluster0-shard-00-00.ochei.mongodb.net:27017,cluster0-shard-00-01.ochei.mongodb.net:27017,cluster0-shard-00-02.ochei.mongodb.net:27017/shortnner?ssl=true&replicaSet=atlas-5s5ecj-shard-0&authSource=admin&retryWrites=true&w=majority",
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

app.get("/login", (req, res) => {
  res.render("login.html");
});

app.get("/register", (req, res) => {
  res.render("register.html");
});

app.post("/register", async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    await Auth.create({
      password: hashedPassword,
      email: req.body.email,
      name: req.body.name,
    });
    res.redirect("/login");
  }
  catch {
    alert("Registration Failed.");
    res.redirect('/register')
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
