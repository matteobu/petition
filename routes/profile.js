const express = require("express");
const router = express.Router();
const db = require("../db");

router.use((req, res, next) => {
    console.log("PROFILE ROUTES");
    console.log("req.method: ", req.method);
    console.log("req.url: ", req.url);
    next();
});

router.get("/prova", (req, res) => res.send("<h1>Profile page</h1>"));

router.get("/", function (req, res) {
    // if (req.session.signatureDone) {
    //     res.redirect("/profile/edit");
    // } else {
    console.log("SESSION VALUE ON GET PROFILE:>> ", req.session);
    res.render("profile", {
        layout: "main",
    });
    // }
});

module.exports = router;
