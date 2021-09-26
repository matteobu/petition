const express = require("express");
const router = express.Router();
const db = require("../sql/db.js");

const {
    requireLoggedInUser,
    requireLoggedOutUser,
    requireNoSignature,
    requireSignature,
} = require("../server/middleware");

router.use((req, res, next) => {
    // console.log("PETITION ROUTES");
    // console.log("req.method: ", req.method);
    // console.log("req.url: ", req.url);
    next();
});

router.get("/", requireNoSignature, function (req, res) {
    // console.log("SESSION VALUE ON GET PETITION:>> ", req.session);
    db.listSigners()
        .then(function (result) {
            // console.log("result :>> ", result);
            let numberOfSigners = result.rowCount;
            res.render("petition", {
                numberOfSigners,
                layout: "logout",
            });
        })
        .catch(function (err) {
            console.log("ERROR IN LIST ID:>> ", err);
        });
});

router.post("/", (req, res) => {
    // console.log("SESSION VALUE ON POST PETITION:>> ", req.session);
    const { usersID } = req.session;
    const { signature } = req.body;
    // console.log("req.body :>> ", req.body);
    if (!signature) {
        res.redirect("/petition");
    } else {
        db.addSignature(signature, usersID)
            .then((result) => {
                // console.log("result :>> ", result);
                req.session.signatureDone = true;
                res.redirect("/thanks");
            })
            .catch((err) => {
                res.render("petition", {
                });

                console.log("error in post petition:>> ", err);
            });
    }
});

module.exports = router;
