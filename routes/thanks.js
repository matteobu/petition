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
    console.log("PETITION ROUTES");
    console.log("req.method: ", req.method);
    console.log("req.url: ", req.url);
    next();
});

router.get("/", requireSignature, function (req, res) {
    console.log("SESSION VALUE ON GET THANKS:>> ", req.session);
    const { usersID } = req.session;
    db.getSignature(usersID)
        .then((result) => {
            console.log("result :>> ", result);
            let numberOfSigners = result.rowCount;
            res.render("thanks", {
                firstName: result.rows[0].first,
                img: result.rows[0].signature,
                numberOfSigners,
                layout: "logout",
            });
        })
        .catch((err) => console.log("error in GET /thanks", err));
});

module.exports = router;
