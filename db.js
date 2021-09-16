const spicedPg = require("spiced-pg");
const { dbUserName, dbPassword } = require("./secrets");
const database = "geography";

const db = spicedPg(
    `postgres:${dbUserName}:${dbPassword}@localhost:5432/${database}`
);

// console.log(`database :>>  ${database}`);

module.exports.getActors = () => {
    return db.query(`SELECT * FROM actors`);
};

module.exports.addActor = (actorName, actorAge) => {
    const q = `INSERT INTO actors (name, age)
                     VALUES ($1, $2)`;

    const params = [actorName, actorAge];
    return db.query(q, params);


    // ALTERNATIVE
    // return db.query(`INSERT INTO actors (name, age)
    // VALUES ($1, $2)`, params);


};
