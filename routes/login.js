const express = require("express");
const router = express.Router();
const db = require("../sql/db.js");
const { compare } = require("bcryptjs");

const {
    requireLoggedInUser,
    requireLoggedOutUser,
    requireNoSignature,
    requireSignature,
    requireLogOut,
} = require("../server/middleware");

router.use((req, res, next) => {
    console.log("req.method: ", req.method);
    console.log("req.url: ", req.url);
    next();
});

router.get("/", function (req, res) {
    console.log("SESSION VALUE ON GET LOGIN:>> ", req.session);

    res.render("login", {
        layout: "main",
    });
    // }
});

router.post("/", function (req, res) {
    console.log("SESSION VALUE ON POST LOGIN:>> ", req.session);
    const { email, password } = req.body;
    console.log("req.body :>> ", req.body);
    db.listID(email)
        .then(function (result) {
            if (result.rowCount === 0) {
                let wrong = `< < password or email incorrect, please try again or register > >`;
                res.render("login", {
                    wrong,

                    layout: "main",
                });
            } else {
                console.log("result FROM LIST ID:>> ", result);
                req.session.usersID = result.rows[0].id;
                req.session.loginDone = true;
                compare(password, result.rows[0].password).then((match) => {
                    console.log("match :>> ", match);
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
            }
        })
        .catch(function (err) {
            console.log("ERROR IN POST LOGIN:>> ", err);
        });
});

module.exports = router;
