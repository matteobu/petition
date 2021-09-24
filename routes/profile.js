const express = require("express");
const router = express.Router();
const db = require("../sql/db.js");
const bc = require("../sql/bc");
const { editProfile } = require("../server/middleware");

router.use((req, res, next) => {
    console.log("PROFILE ROUTES");
    console.log("req.method: ", req.method);
    console.log("req.url: ", req.url);
    next();
});

router.get("/", editProfile, function (req, res) {
    console.log("SESSION VALUE ON GET PROFILE:>> ", req.session);
    res.render("profile", {
        layout: "main",
    });
});

router.post("/", function (req, res) {
    const { city, age, url } = req.body;
    const { usersID } = req.session;
    db.userProfile(city, age, url, usersID)
        .then((result) => {
            res.redirect("/petition");
        })
        .catch((err) => {
            if (err) {
                res.redirect("/profile"); /// CHANGE AGAIN TO "/profile" AT THE MOMENT IS LIKE THAT BECAUSE YOU DID NOT HANDLE YET THE ERROR
            }

            console.log("Error in post/profile:>> ", err);
        });
});

router.get("/edit", function (req, res) {
    console.log("SESSION VALUE ON GET EDIT PROFILE:>> ", req.session);

    const { usersID } = req.session;
    db.profileValue(usersID)
        .then(function (result) {
            console.log("result :>> ", result);
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
});
router.post("/edit", (req, res) => {
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

module.exports = router;
