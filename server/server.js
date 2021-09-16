const PORT = 8080;
const db = require("../sql/db.js");

const express = require("express");
const path = require("path");
const hb = require("express-handlebars");
const projects = require("./projects.json");
const cookieParser = require("cookie-parser");
const { Http2ServerRequest } = require("http2");
var app = express();

app.engine("handlebars", hb());
app.set("view engine", "handlebars");
const publicPath = path.join(__dirname, "..", "public");
app.use(
    express.urlencoded({
        extended: false,
    })
);

app.use(cookieParser());
app.use((req, res, next) => {
    if (req.url != "/cookie" && req.cookies.allowed != "true") {
        res.cookie("requestedUrl", req.url);
        res.redirect("/cookie");
    } else next();
});
app.use(express.static("./projects"));
app.use(express.static(publicPath));

app.get("/", function (req, res) {
    res.render("petition", {
        layout: "main",
    });
});

app.post("/", (req, res) => {
    let firstName = req.body.firstName;
    let lastName = req.body.lastName;

    db.addID(firstName, lastName, "abc")
        .then(() => {
            console.log("YES ITS WORKING");
            res.redirect("/thanks");
        })
        .catch((err) => console.log("error in db.addActors:>> ", err));
});

app.get("/thanks", function (req, res) {
    res.render("thanks", {
        layout: "main",
    });
});

app.get("/signers", function (req, res) {
    console.log("RICHIESTA :>> ", req);

    let firstName = req.SOMETHING.firstName;
    // let lastName = req.body.lastName;
    db.listID(firstName, lastName)
        .then(() => {
            console.log("FROM THE DATA BASE: ", firstName);
        })
        .catch((err) => console.log("error in db.addActors:>> ", err));
});

// COOKIES PART DO NOT TOUCH SO FAR
app.get("/cookie", (req, res) => {
    res.send(
        `<form method='POST' >
        <h2>
        So please please please let me, let me, let me get the Cookies I want this time... check the box 👉👉👉<input type="checkbox" name="cookieAccepted"> and click the button<button> i accept </submit>
        </h2>
        </form>
        `
    );
});
app.post("/cookie", (req, res) => {
    const { cookieAccepted } = req.body;
    if (cookieAccepted) {
        res.cookie("allowed", "true");
        res.redirect(req.cookies.requestedUrl);
    } else {
        res.redirect("/cookie");
    }
});

app.listen(PORT, () => console.log(`The server is listening on ${PORT} 🤟...`));
