const db = require("../sql/db.js");
const path = require("path");
const express = require("express");
// const helmet = require("helmet");
const csurf = require("csurf");
const hb = require("express-handlebars");
const cookieSession = require("cookie-session");
const { requireLoggedInUser } = require("./middleware");
const registerRoutes = require("../routes/register");
const loginRoutes = require("../routes/login");
const profileRoutes = require("../routes/profile");
const petitionRoutes = require("../routes/petition");
const thanksRoutes = require("../routes/thanks");
const signersRoutes = require("../routes/signers");
var app = express();

app.engine("handlebars", hb());
app.set("view engine", "handlebars");
app.use(
    express.urlencoded({
        extended: false,
    })
);
// COOKIE SESSION
app.use(
    cookieSession({
        secret: "I'm always hungry",
        maxAge: 1000 * 60 * 60 * 24 * 14, // 2 weeks
        sameSite: true,
    })
);
app.use(function (req, res, next) {
    res.setHeader("x-frame-options", "deny");
    next();
});
// app.use(helmet());

app.use(csurf());
app.use(function (req, res, next) {
    res.locals.csrfToken = req.csrfToken();
    next();
});
// PUBLIC PATH
const publicPath = path.join(__dirname, "..", "public");
//EXPRESS STATIC
app.use(express.static(publicPath));
/// LANDING PAGE "/" GET AND POST ///
app.get("/", function (req, res) {
    console.log("SESSION VALUE ON GET / :>> ", req.session);

    if (req.session.usersID) {
        res.redirect("/thanks");
    } else {
        res.render("home", {
            layout: "main",
        });
    }
});

// MIDDLEWARE LOGIN IN USER
app.use(requireLoggedInUser);
// APP_USE ROUTES
app.use("/profile", profileRoutes);
app.use("/register", registerRoutes);
app.use("/login", loginRoutes);
app.use("/petition", petitionRoutes);
app.use("/thanks", thanksRoutes);
app.use("/signers", signersRoutes);

app.post("/delete-signature", function (req, res) {
    console.log("SESSION VALUE ON POST PROFILE:>> ", req.session);
    // req.session = null
    const { usersID } = req.session;
    db.deleteSignature(usersID)
        .then((result) => {
            req.session.signatureDone = null;
            res.redirect("/petition");
        })
        .catch((err) => {
            if (err) {
                res.redirect("/profile");
            }

            console.log("Error in post delete signature:>> ", err);
        });
});

app.get("/logout", function (req, res) {
    req.session = null;
    res.redirect("/");
});

app.post("/delete-account", function (req, res) {
    const { usersID } = req.session;
    Promise.all([db.deleteSignature(usersID), db.deleteProfile(usersID)])
        .then((results) => {
            db.deleteAccount(usersID), console.log(results);
            req.session = null;
            res.redirect("/register");
        })
        .catch((err) => console.log("ERROR IN DELETE ACCOUNT:>> ", err));
});

app.listen(process.env.PORT || 8080, () =>
    console.log(`The petition server is running 🤟...`)
);
