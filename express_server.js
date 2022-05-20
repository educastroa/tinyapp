const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const { generateRandomString } = require("./Helpers/userHelpers");
const { urlsForUser } = require("./Helpers/userHelpers");
const { verifyEmailPassword } = require("./Helpers/userHelpers");
const { lookForEmail } = require("./Helpers/userHelpers");
const bcrypt = require('bcrypt');
const cookieSession = require('cookie-session');
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
const res = require("express/lib/response");



app.set("view engine", "ejs");

const salt = bcrypt.genSaltSync(10);

const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW"
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW"
  }
};

const users = {

  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: bcrypt.hashSync("purple-monkey-dinosaur", salt)
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: bcrypt.hashSync("dishwasher-funk", salt)
  },
  "aJ48lW": {
    id: "aJ48lW",
    email: "edu@edu",
    password: bcrypt.hashSync("1234", salt)
  }
};


app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cookieSession({
  name: 'sessions',
  keys: ['this is a secret', 'lets keep it that way']
}));

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {
  //let templateVars = { urls: urlDatabase };
  const userId = req.cookies['session'];
  let templateVars = { urls: urlsForUser(userId, urlDatabase), user: users[userId] };
  res.render("urls_index", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  if (longURL) {
    res.redirect(longURL.longURL);
  }
  res.status(404).send(`
  <h1>Error, 404</h1>
  <h2>Short URL does not exist</h2>
  `);
});

app.get("/urls/new", (req, res) => {
  //res.render("urls_new");
  const userId = req.cookies['session'];
  let templateVars = { user: users[userId] };
  res.render('urls_new', templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const userId = req.cookies['session'];
  // const templateVars = { shortURL, longURL: urlDatabase[shortURL] };
  let templateVars = { shortURL, longURL: urlDatabase[shortURL].longURL, user: users[userId] };
  if (userId) {
    res.render("urls_show", templateVars);
  }
  res.redirect("/register");
});

app.post("/urls", (req, res) => {
  console.log(req.body);  // Log the POST request body to the console
  // res.send("Ok");         // Respond with 'Ok' (we will replace this)ookForEmail(email,
  // const shortURL = req.params.shortURL
  // const longURL = urlDatabase[shortURL].longURL
  const userId = req.cookies['session'];
  if (!userId) {
    return res.status(401).send(`
    <h1>Error 401</h1>
    <h2>Invalid authentication</h2>`);
  }
  const shortURL = generateRandomString(6);
  urlDatabase[shortURL] = { longURL: req.body.longURL, userID: userId };
  res.redirect(`/urls/${shortURL}`);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  const userId = req.cookies['session'];
  if (!userId) {
    return res.status(401).send(`
    <h1>Error 401</h1>
    <h2>Invalid authentication</h2>`);
  }
  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect("/urls");
});

app.post("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  res.redirect(`/urls/${shortURL}`);
});

// login added
app.post('/login', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  if (verifyEmailPassword(email, password, users) === false) {
    res.sendStatus(403);
  }
  res.cookie('session', verifyEmailPassword(email, password, users));
  req.session.sessions = verifyEmailPassword(email, password, users),
    res.redirect('/urls');
});

app.post('/logout', (req, res) => {
  res.clearCookie('session');
  res.redirect('/urls');
});

app.get("/register", (req, res) => {
  let templateVars = { user: req.cookies['session'] };
  res.render('urls_register', templateVars);
});

app.post('/register', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  if (lookForEmail(email, password, users) === false) {
    res.sendStatus(400);
  }
  const randomId = generateRandomString(6);
  users[randomId] = { id: randomId, email: req.body.email, password: bcrypt.hashSync(req.body.password, salt) };
  // console.log(req.body);
  res.cookie('session', randomId);
  req.session.sessions = randomId,
    res.redirect('/urls');
});

