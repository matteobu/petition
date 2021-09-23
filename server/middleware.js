module.exports.requireLoggedInUser = function (req, res, next) {
    console.log("req.session :>> ", req.session);
    if (
        !req.session.usersID &&
        req.url !== "/login" &&
        req.url !== "/register"
    ) {
        res.redirect("/register");
    } else {
        next();
    }
};

module.exports.requireLoggedOutUser = function (req, res, next) {
    const { usersID } = req.session;

    if (usersID) {
        res.redirect("/petition");
    } else {
        next();
    }
};

module.exports.requireNoSignature = function (req, res, next) {
    if (req.session.signatureDone) {
        res.redirect("/thanks");
    } else {
        next();
    }
};

module.exports.requireSignature = function (req, res, next) {
    if (!req.session.signatureDone) {
        res.redirect("/petition");
    } else {
        next();
    }
};
