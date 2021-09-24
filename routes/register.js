const express = require("express");
const router = express.Router();
const db = require("../sql/db.js");
const bc = require("../sql/bc");

const {
    requireLoggedInUser,
    requireLoggedOutUser,
    requireNoSignature,
    requireSignature,
} = require("../server/middleware");

router.use((req, res, next) => {
    console.log("PETITION ROUTES");
    console.log("req.method: ", req.method);
    console.log("req.url: ", req.url);
    next();
});

router.get("/", requireLoggedOutUser, function (req, res) {
    console.log("SESSION VALUE ON GET REGISTER:>> ", req.session);

    res.render("register", {
        layout: "main",
    });
});

router.post("/", function (req, res) {
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

module.exports = router;
