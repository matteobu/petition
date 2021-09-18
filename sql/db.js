const spicedPg = require("spiced-pg");
const { dbUserName, dbPassword } = require("../secrets");
const database = "mustard-petition";

const db = spicedPg(
    `postgres:${dbUserName}:${dbPassword}@localhost:5432/${database}`
);

module.exports.addID = (first, second, signature) => {
    const q = `INSERT INTO signatures (first, last, signature)
                     VALUES ($1, $2, $3) RETURNING id`;

    const params = [first, second, signature];
    return db.query(q, params);
};

module.exports.listID = function (q) {
    return db.query(q);
};
