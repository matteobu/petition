const express = require("express");
const router = express.Router();
const db = require("../sql/db.js");
const { requireSignature } = require("../server/middleware");
router.use(express.static("./signers"));

router.use((req, res, next) => {
    console.log("PETITION ROUTES");
    console.log("req.method: ", req.method);
    console.log("req.url: ", req.url);
    next();
});

router.get("/", requireSignature, function (req, res) {
    db.signersJoin()
        .then(function (result) {
            let results = result.rows;

            res.render("signers", {
                results,
                layout: "logout",
            });
        })
        .catch(function (err) {
            console.log("ERROR IN LIST ID:>> ", err);
        });
});

router.get("/:city", requireSignature, function (req, res) {
    const requestedCity = req.params.city;
    // console.log("requestedProject :>> ", requestedCity);

    db.cityDB(requestedCity)
        .then(function (result) {
            let results = result.rows;

            res.render("city", {
                results,
                city: requestedCity,
                layout: "logout",
            });
        })
        .catch(function (err) {
            console.log("ERROR IN LIST ID:>> ", err);
        });
});

module.exports = router;
