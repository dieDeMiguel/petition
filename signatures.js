var spicedPg = require("spiced-pg");
const {
    username,
    password,
    database,
} = require("./project_data/credentials.json");

var db = spicedPg(
    `postgres:${username}:${password}@localhost:5432/${database}`
);

function createSignature(first_name, last_name, signature) {
    return db
        .query(
            "INSERT INTO signatures(first_name, last_name, text_signature) VALUES ($1, $2, $3) RETURNING id",
            [first_name, last_name, signature]
        )
        .then((result) => result.rows[0].id);
}

function getAllSignatures() {
    return db.query("SELECT * FROM signatures").then((result) => result.rows);
}

function getSignature(id) {
    return db
        .query("SELECT * FROM signatures WHERE ID = $1", [id])
        .then((result) => result.rows[0]);
}

module.exports = {
    getAllSignatures,
    createSignature,
    getSignature,
};
