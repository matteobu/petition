const PORT = 8080;
const db = require("../sql/db.js");
const path = require("path");
const express = require("express");
const hb = require("express-handlebars");
const cookieSession = require("cookie-session");
const { cookieSecret } = require("../secrets");
const bc = require("../sql/bc");
const { compare } = require("bcryptjs");
// const { hash } = require("bcryptjs");
var app = express();
app.engine("handlebars", hb());
app.set("view engine", "handlebars");

app.use(
    express.urlencoded({
        extended: false,
    })
);
app.use(
    cookieSession({
        secret: cookieSecret,
        maxAge: 1000 * 60 * 60, // 60 minutes
    })
);

const publicPath = path.join(__dirname, "..", "public");
app.use(express.static("./signers"));
app.use(express.static(publicPath));

/// GET OR POST REQUEST ///

/// LANDING PAGE "/" GET AND POST ///
app.get("/", function (req, res) {
    if (req.session.usersID) {
        res.redirect("/thanks");
    } else {
        res.render("home", {
            layout: "main",
        });
    }
});

///   /register GET AND POST ///

app.get("/register", function (req, res) {
    if (req.session.signatureDone) {
        res.redirect("/thanks");
    } else if (req.session.loginDone) {
        res.redirect("/petition");
    } else if (req.session.userID) {
        res.redirect("/login");
    } else {
        res.render("register", {
            layout: "main",
        });
    }
});

app.post("/register", function (req, res) {
    let firstName = req.body.firstName;
    let lastName = req.body.lastName;
    let email = req.body.email;
    let password = req.body.password;

    bc.hash(password)
        .then((hashedPsw) => {
            db.addUser(firstName, lastName, email, hashedPsw).then((result) => {
                let id = result.rows[0].id;
                req.session.usersID = id;
                req.session.loginDone = true;
                res.redirect("/profile");
            });
        })
        .catch((err) => {
            if (err) {
                let wrong = `< < < < should not be difficult to write your name and surname, but still something went wrong > > > >
                        `;
                res.render("register", {
                    wrong,
                    layout: "main",
                });
            }
            console.log("ERROR IN INPUT VALUE:>> ", err);
        });
});

/// PETITION PAGE "/profile" GET AND POST ///

app.get("/profile", function (req, res) {
    console.log("req.body :>> ", req.session.usersID);

    res.render("profile", {
        layout: "main",
    });
});

app.post("/profile", function (req, res) {
    let city = req.body.city;
    let age = req.body.age;
    let url = req.body.website;
    let userID = req.session.usersID;

    db.userProfile(city, age, url, userID)
        .then((result) => {
            console.log("result :>> ", result);
            res.redirect("/petition");
        })
        .catch((err) => {
            if (err) {
                res.redirect("/petition"); /// CHANGE AGAIN TO "/profile" AT THE MOMENT IS LIKE THAT BECAUSE YOU DID NOT HANDLE YET THE ERROR
            }

            console.log("Error in post/profile:>> ", err);
        });
});

/// /login GET AND POST ///

app.get("/login", function (req, res) {
    if (!req.session.userID) {
        res.redirect("/register");
    } else if (req.session.loginDone) {
        res.redirect("/petition");
    } else if (req.session.signatureDone) {
        res.redirect("/thanks");
    } else {
        res.render("login", {
            layout: "main",
        });
    }
});

app.post("/login", function (req, res) {
    let emailFromInput = req.body.email;
    let pswFromInput = req.body.password;
    db.listID(emailFromInput)
        .then(function (result) {
            req.session.usersID = result.rows[0].id;
            req.session.loginDone = true;
            compare(pswFromInput, result.rows[0].password).then((match) => {
                if (match && req.session.loginDone) {
                    res.redirect("/petition");
                } else if (match != true) {
                    let wrong = `< < < < should not be difficult to write your name and surname, but still something went wrong > > > >`;
                    res.render("login", {
                        wrong,
                        layout: "main",
                    });
                }
            });
        })
        .catch(function (err) {
            console.log("ERROR IN LIST ID:>> ", err);
        });
});

/// /petition GET AND POST ///

app.get("/petition", function (req, res) {
    // if (!req.session.userID) {
    //     res.redirect("/register");
    // } else if (req.session.usersID) {
    //     res.redirect("/login");
    // } else

    if (req.session.signatureDone) {
        res.redirect("/thanks");
    } else if (req.session.loginDone) {
        db.listID("SELECT * FROM signatures")
            .then(function (result) {
                // console.log("result from signatures:>> ", result);
                let numberOfSigners = result.rowCount;
                res.render("petition", {
                    numberOfSigners,
                    layout: "main",
                });
            })
            .catch(function (err) {
                console.log("ERROR IN LIST ID:>> ", err);
            });
    }
});

app.post("/petition", (req, res) => {
    let signatureID = req.session.usersID;
    let signatureVar = req.body.signature;

    console.log("object :>> ", req.session.usersID);

    // console.log("req.body :>> ", req.body.signature);

    db.addSignature(signatureVar, signatureID)
        .then((result) => {
            console.log("result :>> ", result);
            req.session.signatureDone = true;
            res.redirect("/thanks");
        })
        .catch((err) => {
            res.render("petition", {
                layout: "main",
            });

            console.log("error in post petition:>> ", err);
        });
});

/// THANKS PAGE "/thanks" GET AND POST ///

app.get("/thanks", function (req, res) {
    if (req.session.signatureDone) {
        db.listID("SELECT * FROM signatures")
            .then(function (result) {
                let numberOfSigners = result.rowCount;
                res.render("thanks", {
                    numberOfSigners,
                    layout: "main",
                });
            })
            .catch(function (err) {
                console.log("ERROR IN LIST ID:>> ", err);
            });
    } else {
        res.redirect("/register");
    }
});

/// PETITION PAGE "/signers" GET AND POST ///

app.get("/signers", function (req, res) {
    // console.log("GET REQUEST MADE ON HOME SIGNERS");

    // logic to check whether or not the user is allowed to see this page IF not
    // redirect to petition
    // if user is allowed then get the information on first & last of who sigend the petition
    // from the db, pass it along to your template render
    // should render the signers template

    db.signersJoin()
        .then(function (result) {
            console.log(result.rows);
            console.log("result :>> ", result);
            // console.log(result.rows[0].first);

            let results = result.rows;

            res.render("signers", {
                results,
                layout: "main",
            });
        })
        .catch(function (err) {
            console.log("ERROR IN LIST ID:>> ", err);
        });
});

app.listen(PORT, () =>
    console.log(`The petition server is running on ${PORT} port 🤟...`)
);
