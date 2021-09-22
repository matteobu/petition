const spicedPg = require("spiced-pg");
const database = "mustard-petition";

let db;

if (process.env.DATABASE_URL) {
    db = process.env.DATABASE_URL;
} else {
    const { dbUserName, dbPassword } = require("../secrets");
    db = spicedPg(
        `postgres:${dbUserName}:${dbPassword}@localhost:5432/${database}`
    );
}

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

module.exports.listSigners = () => {
    return db.query(`SELECT * FROM signatures`);
};

// JOIN TABLE
module.exports.signersJoin = () => {
    return db.query(
        `SELECT users.id, users.first, users.last, user_profiles.age, user_profiles.city, user_profiles.url FROM users  JOIN signatures ON users.id = signatures.user_id LEFT JOIN user_profiles ON user_profiles.user_id = signatures.user_id
        `
    );
};

// SIGNERS LIST ACCORDING TO A CITY
module.exports.cityDB = (city) => {
    return db.query(
        `SELECT users.first, users.last, user_profiles.age, user_profiles.city, user_profiles.url FROM users JOIN signatures ON users.id = signatures.user_id
        LEFT JOIN user_profiles ON user_profiles.user_id = signatures.user_id WHERE LOWER(user_profiles.city) = LOWER($1)
        `,
        [city]
    );
};

// EDIT PROFILE  GET INFORMATION

module.exports.editProfile = (usersID) => {
    return db.query(
        `SELECT users.first, users.last, users.email, user_profiles.city, user_profiles.age, user_profiles.url FROM users JOIN signatures ON users.id = signatures.user_id
        LEFT JOIN user_profiles ON user_profiles.user_id = signatures.user_id WHERE (users.id) = ($1)
        `,
        [usersID]
    );
};

module.exports.updateUser = (first, last, email, password) => {
    return db.query(
        `INSERT INTO users (firt, last, email, password) VALUES ($1, $2, $3, $4) ON CONFLICT (user_id) DO UPDATE SET first =$1, last =$2, email=$3, password=$4`,
        [first, last, email, password]
    );
};

module.exports.updateProfile = (age, city, url) => {
    return db.query(
        `INSERT INTO user_profiles (age, city, url) VALUES ($1, $2, $3, $4) ON CONFLICT (user_id) DO UPDATE SET age =$1, city =$2, url=$3`,
        [age, city, url]
    );
};

// DELETE SIGNATURE

module.exports.deleteSignature = (usersID) => {
    return db.query(`DELETE FROM signatures WHERE (user_id) = ($1)`, [usersID]);
};

// DELETE ACCOUNT

module.exports.deleteProfile = (usersID) => {
    return db.query(`DELETE FROM user_profiles WHERE (user_id) = ($1)`, [
        usersID,
    ]);
};
module.exports.deleteAccount = (usersID) => {
    return db.query(`DELETE FROM users WHERE (id) = ($1)`, [usersID]);
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
