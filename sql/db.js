const spicedPg = require("spiced-pg");
const { dbUserName, dbPassword } = require("../secrets");
const database = "mustard-petition";

const db = spicedPg(
    `postgres:${dbUserName}:${dbPassword}@localhost:5432/${database}`
);

// USER TABLE

module.exports.addUser = (first, last, email, password) => {
    const q = `INSERT INTO users (first, last, email, password)
                     VALUES ($1, $2, $3, $4) RETURNING id`;

    const params = [first, last, email, password];
    return db.query(q, params);
};
module.exports.listID = (email) => {
    return db.query(`SELECT password, id FROM users WHERE email = $1`, [email]);
};
// user_profile TABLE

module.exports.userProfile = (city, age, url, userID) => {
    const q = `INSERT INTO user_profiles (city, age, url, user_id)
                     VALUES ($1, $2, $3, $4) RETURNING id`;

    const params = [city, age, url, userID];
    return db.query(q, params);
};

// SIGNATURES TABLE

module.exports.addSignature = (signature, userID) => {
    const q = `INSERT INTO signatures (signature, user_id)
                     VALUES ($1, $2) RETURNING id`;

    const params = [signature, userID];
    return db.query(q, params);
};

// JOIN TABLE
module.exports.signersJoin = () => {
    return db.query(
        `SELECT users.id, users.first AS first, users.last AS last, user_profiles.age AS age, user_profiles.city AS city FROM users LEFT OUTER JOIN user_profiles ON users.id = user_profiles.user_id`
    );
};

// PROFILE TABLE

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
