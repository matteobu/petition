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
        maxAge: 1000 * 60 * 5, // five minutes
    })
);

const publicPath = path.join(__dirname, "..", "public");
app.use(express.static("./signers"));
app.use(express.static(publicPath));

/// GET OR POST REQUEST ///
/// LANDING PAGE "/" GET AND POST ///
app.get("/", function (req, res) {
    if (req.session.signatureId) {
        res.redirect("/thanks");
    } else {
        res.render("home", {
            layout: "main",
        });
    }
});
/// PETITION PAGE "/petition" GET AND POST ///

// app.get("/petition", function (req, res) {
//     if (req.session.signatureId) {
//         res.redirect("/thanks");
//     } else {
//         db.listID("SELECT * FROM signatures")
//             .then(function (result) {
//                 let numberOfSigners = result.rowCount;
//                 res.render("petition", {
//                     numberOfSigners,
//                     layout: "main",
//                 });
//             })
//             .catch(function (err) {
//                 console.log("ERROR IN LIST ID:>> ", err);
//             });
//     }
// });

// app.post("/petition", (req, res) => {
//     // console.log("POST REQUEST MADE ON HOME PAGE");
//     // console.log("req.body :>> ", req.body);
//     let firstName = req.body.firstName;
//     let lastName = req.body.lastName;
//     let signatureVar = req.body.signature;
//     db.addID(firstName, lastName, signatureVar)
//         .then((result) => {
//             console.log("result :>> ", result);
//             let id = result.rows[0].id;
//             req.session.signatureId = id;
//             // if it worked successfully store the signature's id in the cookie and
//             // redirect the user to thank-you
//             // console.log("YES ITS WORKING");
//             res.redirect("/thanks");
//         })
//         .catch((err) => {
//             if (err) {
//                 let wrong = `< < < < should not be difficult to write your name and surname, but still something went wrong > > > >
//                 `;

//                 res.render("petition", {
//                     wrong,
//                     layout: "main",
//                 });
//             }

//             console.log("error in db.addActors:>> ", err);
//         });
// });

/// PETITION PAGE "/login" GET AND POST ///

// app.get("/login", function (req, res) {
//     res.render("login", {
//         layout: "main",
//     });
// });

// app.post("/login", function (req, res) {
//     let hashFromDB = "passwordHardCoded";

//     compare("someUserInputFromTheRequestBody", hashFromDB).then((match) => {
//         console.log("match :>> ", match);
//     });

//     res.render("login", {
//         layout: "main",
//     });
// });

/// PETITION PAGE "/register" GET AND POST ///

app.get("/register", function (req, res) {
    res.render("register", {
        layout: "main",
    });
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
                req.session.signatureId = id;
                res.redirect("/thanks");
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
        });

    // bc.hash(password)
    //     .then((hashedPsw) => {
    //         console.log("hasedPw :>> ", hashedPsw);
    //         return hashedPsw;
    //     }).
    //     .catch(function (err) {
    //         console.log("ERROR IN LIST HASH:>> ", err);
    //     });

    // console.log("req.body :>> ", hashedPsw);

    // db.addUser(firstName, lastName, email, hashedPsw)
    //     .then((result) => {
    //         console.log("result :>> ", result);
    //         let id = result.rows[0].id;
    //         req.session.signatureId = id;
    //         res.redirect("/thanks");
    //     })
    //     .catch((err) => {
    //         if (err) {
    //             let wrong = `< < < < should not be difficult to write your name and surname, but still something went wrong > > > >
    //                 `;

    //             res.render("register", {
    //                 wrong,
    //                 layout: "main",
    //             });
    //         }
    //     });
});

/// THANKS PAGE "/thanks" GET AND POST ///

app.get("/thanks", function (req, res) {
    // if (req.session.signatureId) {
    //     db.listID("SELECT * FROM signatures")
    //         .then(function (result) {
    //             let numberOfSigners = result.rowCount;
    res.render("thanks", {
        layout: "main",
    });
    //         })
    //         .catch(function (err) {
    //             console.log("ERROR IN LIST ID:>> ", err);
    //         });
    // } else {
    //     res.redirect("/");
    // }
});

/// PETITION PAGE "/signers" GET AND POST ///

// app.get("/signers", function (req, res) {
//     // console.log("GET REQUEST MADE ON HOME SIGNERS");

//     // logic to check whether or not the user is allowed to see this page IF not
//     // redirect to petition
//     // if user is allowed then get the information on first & last of who sigend the petition
//     // from the db, pass it along to your template render
//     // should render the signers template

//     db.listID("SELECT * FROM signatures")
//         .then(function (result) {
//             // console.log(result.rows);
//             // console.log(result.rows[0].first);

//             let results = result.rows;

//             res.render("signers", {
//                 results,
//                 layout: "main",
//             });
//         })
//         .catch(function (err) {
//             console.log("ERROR IN LIST ID:>> ", err);
//         });
// });

app.listen(PORT, () =>
    console.log(`The petition server is running on ${PORT} port 🤟...`)
);
