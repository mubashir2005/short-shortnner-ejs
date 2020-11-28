const express = require("express");
require("dotenv").config();
const mongoose = require("mongoose");
const ShortUrl = require("./models/shortUrl");
const app = express();
const bcrypt = require("bcrypt");
const Auth = require("./models/users");
const { name } = require("ejs");

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
app.post("/login", async (req, res) => {
  const user = await Auth.findOne({
    name: req.body.name,
    password: req.body.password,
    email: req.body.email,
  });

  if (user === null) {
    return res.status(400).send("No such User exists");
  }
  try {
    if (await bcrypt.compare(req.body.password, user.password)) {
      res.send("Successfully logged in.");
    } else {
      res.send("Incorrect User Information. Try again.");
    }
  } catch (e) {
    res.status(500).send(e);
  }
});

app.get("/register", (req, res) => {
  res.render("register.html");
});

app.post("/register", async (req, res) => {
  try {
    mongoose.connect(
      `mongodb+srv://Mubashir:y4gQEVGPQKq0gQ9c@cluster0.ochei.mongodb.net/${req.body.email}?retryWrites=true&w=majority`,
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }
    );
    const hashedPassword = await bcrypt.hash(req.body.password);

    await Auth.create({
      password: hashedPassword,
      email: req.body.email,
      name: req.body.name,
    });
    res.redirect("/login");
    res.status(200);
  } catch {
    res.send("Registration Failed.");
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

app.listen(3000, () => console.log("running at 3000 port"));
