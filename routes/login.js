const express = require("express");
const router = express.Router();
const db = require("../sql/db.js");
const { compare } = require("bcryptjs");

const { requireLogOut, requireNoSignature } = require("../server/middleware");

router.use((req, res, next) => {
    // console.log("req.method: ", req.method);
    // console.log("req.url: ", req.url);
    next();
});

router.get("/", function (req, res) {
    // console.log("SESSION VALUE ON GET LOGIN:>> ", req.session);

    res.render("login", {
        layout: "main",
    });
    // }
});

router.post("/", function (req, res) {
    // console.log("SESSION VALUE ON POST LOGIN:>> ", req.session);
    const { email, password } = req.body;
    // console.log("req.body :>> ", req.body);

    db.listID(email)
        .then(function (result) {
            if (result.rowCount === 0) {
                let wrong = `< < password or email incorrect, please try again or register > >`;
                res.render("login", {
                    wrong,

                    layout: "main",
                });
            } else {
                // console.log("result FROM LIST ID:>> ", result);
                req.session.usersID = result.rows[0].id;
                req.session.loginDone = true;

                compare(password, result.rows[0].password).then((match) => {
                    // console.log("match :>> ", match);
                    if (match && req.session.loginDone) {
                        db.listSignature(req.session.usersID)
                            .then((value) => {
                                // console.log(
                                //     "result.rows[0].signature :>> ",
                                //     value
                                // );
                                if (value.rows.length) {
                                    // console.log("LA FIRMA ESISTE");
                                    req.session.signatureDone = true;
                                    res.redirect("/thanks");
                                } else {
                                    res.redirect("/petition");
                                }
                            })
                            .catch((err) => {
                                console.log(
                                    "error in list Signature :>> ",
                                    err
                                );
                            });
                    } else if (match != true) {
                        let wrong = `< < password or email incorrect, please try again or register > >`;
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
