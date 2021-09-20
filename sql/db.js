const spicedPg = require("spiced-pg");
const { dbUserName, dbPassword } = require("../secrets");
const database = "mustard-petition";

const db = spicedPg(
    `postgres:${dbUserName}:${dbPassword}@localhost:5432/${database}`
);

module.exports.addID = (first, last, signature) => {
    const q = `INSERT INTO signatures (first, last, signature)
                     VALUES ($1, $2, $3) RETURNING id`;

    const params = [first, last, signature];
    return db.query(q, params);
};


module.exports.listID = (email) => {
    return db.query(`SELECT password, id FROM users WHERE email = $1`, [email]);
};

// module.exports.listID = function (q) {
//     return db.query(q);
// };

module.exports.addUser = (first, last, email, password) => {
    const q = `INSERT INTO users (first, last, email, password)
                     VALUES ($1, $2, $3, $4) RETURNING id`;

    const params = [first, last, email, password];
    return db.query(q, params);
};

// CREATE TABLE users(
//     id SERIAL PRIMARY KEY,
//     first VARCHAR(255) NOT NULL,
//     last VARCHAR(255) NOT NULL,
//     email VARCHAR(255) NOT NULL UNIQUE,
//     password VARCHAR(255) NOT NULL,
//     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
//     );

// CREATE TABLE signatures(
//     id SERIAL PRIMARY KEY,
//     signature TEXT NOT NULL,
//     user_id INTEGER NOT NULL UNIQUE REFERENCES users(id),
//     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
//     )
