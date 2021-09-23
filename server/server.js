const db = require("../sql/db.js");
const path = require("path");
const express = require("express");
const hb = require("express-handlebars");
const cookieSession = require("cookie-session");
// const { cookieSecret } = require("../secrets");
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

// let secrets;
// process.env.NODE_ENV === "production"
//     ? (secrets = process.env)
//     : (secrets = require("../secrets"));
// app.use(
//     cookieSession({
//         secret: secrets.cookieSecret,
//         maxAge: 1000 * 60 * 60 * 24 * 14, // 2 weeks
//     })
// );

app.use(
    cookieSession({
        secret: "I'm always hungry",
        maxAge: 1000 * 60 * 60 * 24 * 14, // 2 weeks
        sameSite: true

    })
);

const publicPath = path.join(__dirname, "..", "public");
app.use(express.static("./signers"));
app.use(express.static(publicPath));

/// GET OR POST REQUEST ///

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

///   /register GET AND POST ///

app.get("/register", function (req, res) {
    console.log("SESSION VALUE ON GET REGISTER:>> ", req.session);

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
    console.log("SESSION VALUE ON POST REGISTER:>> ", req.session);
    const { firstName, lastName, email, password } = req.body;

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
    if (req.session.signatureDone) {
        res.redirect("/profile/edit");
    } else {
        console.log("SESSION VALUE ON GET PROFILE:>> ", req.session);
        res.render("profile", {
            layout: "main",
        });
    }
});

app.post("/profile", function (req, res) {
    // console.log("SESSION VALUE ON POST PROFILE:>> ", req.session);
    const { city, age, url } = req.body;
    const { usersID } = req.session;

    db.userProfile(city, age, url, usersID)
        .then((result) => {
            // console.log("result :>> ", result);
            res.redirect("/petition");
        })
        .catch((err) => {
            if (err) {
                res.redirect("/petition"); /// CHANGE AGAIN TO "/profile" AT THE MOMENT IS LIKE THAT BECAUSE YOU DID NOT HANDLE YET THE ERROR
            }

            console.log("Error in post/profile:>> ", err);
        });
});

/// EDIT PROFILE  "/profile"/edit GET AND POST ///

app.get("/profile/edit", function (req, res) {
    console.log("SESSION VALUE ON GET EDIT PROFILE:>> ", req.session);

    const { usersID } = req.session;

    if (req.session.loginDone) {
        db.profileValue(usersID)
            .then(function (result) {
                // console.log("result :>> ", result);
                res.render("edit", {
                    firstName: result.rows[0].first,
                    lastName: result.rows[0].last,
                    email: result.rows[0].email,
                    age: result.rows[0].age,
                    city: result.rows[0].city,
                    url: result.rows[0].url,
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

app.post("/profile/edit", (req, res) => {
    const { firstName, lastName, email, password, city, age, url } = req.body;
    const { usersID } = req.session;
    if (password) {
        bc.hash(password).then((hashedPsw) => {
            Promise.all([
                db.updatePassword(hashedPsw, usersID),
                db.updateUser(firstName, lastName, email, usersID),
                db.updateProfile(age, city, url, usersID),
            ])
                .then((results) => {
                    res.redirect("/petition");
                })
                .catch((err) =>
                    console.log("ERROR IN POST PROFILE EDIT: >>", err)
                );
        });
    } else {
        Promise.all([
            db.updateUser(firstName, lastName, email, usersID),
            db.updateProfile(age, city, url, usersID),
        ])
            .then((results) => {
                res.redirect("/petition");
            })
            .catch((err) => console.log("ERROR IN POST PROFILE EDIT: >>", err));
    }
});

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
                res.redirect("/profile"); /// CHANGE AGAIN TO "/profile" AT THE MOMENT IS LIKE THAT BECAUSE YOU DID NOT HANDLE YET THE ERROR
            }

            console.log("Error in post delete signature:>> ", err);
        });
});

// app.post("/delete-account", function (req, res) {
//     const { usersID } = req.session;
//     Promise.all([
//         db.deleteSignature(usersID),
//         db.deleteProfile(usersID),
//         db.deleteAccount(usersID),
//     ])
//         .then((results) => {
//             console.log(results);
//         })
//         .catch((err) => console.log(err));

// console.log("SESSION VALUE ON POST PROFILE:>> ", req.session);
// // req.session = null
// db.deleteProfile(usersID)
//     .then((usersID) => {
//         return usersID;
//     })
//     .then((usersID) => {
//         db.deleteAccount(usersID).then(() => {
//             req.session = null;
//             res.redirect("/register");
//         });
//     })
//     .catch((err) => {
//         if (err) {
//             console.log("THERE SOME ERROR ");
//             // res.redirect("/profile/edit"); /// CHANGE AGAIN TO "/profile" AT THE MOMENT IS LIKE THAT BECAUSE YOU DID NOT HANDLE YET THE ERROR
//         }

//         console.log("Error in post delete profile-account:>> ", err);
//     });
// });

/// /login GET AND POST ///

app.get("/login", function (req, res) {
    console.log("SESSION VALUE ON GET LOGIN:>> ", req.session);
    if (req.session.signatureDone == true) {
        res.redirect("/thanks");
    } else if (req.session.loginDone) {
        res.redirect("/petition");
    } else {
        res.render("login", {
            layout: "main",
        });
    }
});

app.post("/login", function (req, res) {
    console.log("SESSION VALUE ON POST LOGIN:>> ", req.session);
    const { emailFromInput, pswFromInput } = req.body;

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
    console.log("SESSION VALUE ON GET PETITION:>> ", req.session);
    if (req.session.signatureDone) {
        res.redirect("/thanks");
    } else if (!req.session.usersID) {
        res.redirect("/register");
    } else if (req.session.loginDone) {
        db.listSigners()
            .then(function (result) {
                // console.log("result :>> ", result);
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
    console.log("SESSION VALUE ON POST PETITION:>> ", req.session);
    const { usersID } = req.session;
    const { signature } = req.body;
    // console.log("req.body :>> ", req.body);

    db.addSignature(signature, usersID)
        .then((result) => {
            // console.log("result :>> ", result);
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
    console.log("SESSION VALUE ON GET THANKS:>> ", req.session);

    if (req.session.signatureDone) {
        db.listSigners()
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
    if (req.session.signatureDone) {
        db.signersJoin()
            .then(function (result) {
                let results = result.rows;

                res.render("signers", {
                    results,
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

app.get("/signers/:city", function (req, res) {
    const requestedCity = req.params.city;
    console.log("requestedProject :>> ", requestedCity);

    if (req.session.signatureDone) {
        db.cityDB(requestedCity)
            .then(function (result) {
                let results = result.rows;

                res.render("city", {
                    results,
                    city: requestedCity,
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

app.listen(process.env.PORT || 8080, () =>
    console.log(`The petition server is running 🤟...`)
);
