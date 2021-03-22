var spicedPg = require("spiced-pg");
let { hash, compare } = require("./password");

function getDatabaseURL() {
    if (process.env.DATABASE_URL) {
        return process.env.DATABASE_URL;
    }
    const {
        username,
        password,
        database,
    } = require("./project_data/credentials.json");
    return `postgres:${username}:${password}@localhost:5432/${database}`;
}

const db = spicedPg(getDatabaseURL());

function createUser(first_name, last_name, email, password_hash) {
    return db
        .query(
            "INSERT INTO users(first_name, last_name, email, password_hash) VALUES ($1, $2, $3, $4) RETURNING id",
            [first_name, last_name, email, password_hash]
        )
        .then((result) => result.rows[0].id);
}

function createSignature(signature, user_id) {
    return db.query(
        "INSERT INTO signatures(text_signature, user_id) VALUES ($1, $2)",
        [signature, user_id]
    );
}

function createUserProfiles(user_id, age, city, url) {
    return db.query(
        "INSERT INTO user_profiles(user_id, age, city, url) VALUES ($1, $2, $3, $4)",
        [user_id, age ? age : null, city, url]
    );
}

function getAllUsers() {
    return db.query("SELECT * FROM users").then((result) => result.rows);
}

function getUserByEmail(email) {
    return db
        .query("SELECT * FROM users WHERE email = $1", [email])
        .then((result) => result.rows[0]);
}

function getSignatureFromUser(user_id) {
    return db
        .query("SELECT * FROM signatures WHERE user_id = $1", [user_id])
        .then((result) => result.rows[0]);
}

function getSignatures() {
    return db
        .query(
            "SELECT users.first_name, users.last_name, user_profiles.age, user_profiles.city, user_profiles.url FROM users JOIN signatures ON signatures.user_id = users.id FULL JOIN user_profiles ON user_profiles.user_id = users.id WHERE signatures.text_signature IS NOT NULL"
        )
        .then((results) => results.rows);
}

function countSignatures() {
    return db
        .query("SELECT COUNT (id) FROM signatures")
        .then((results) => results.rows[0].count);
}

function getSignaturesByCity(city) {
    return db
        .query(
            "SELECT users.first_name, users.last_name, user_profiles.age, user_profiles.city, user_profiles.url FROM users JOIN signatures ON signatures.user_id = users.id FULL JOIN user_profiles ON user_profiles.user_id = users.id WHERE signatures.text_signature IS NOT NULL AND user_profiles.city ILIKE $1",
            [city]
        )
        .then((results) => results.rows);
}

function getUserInfoById(id) {
    return db
        .query(
            "SELECT users.*, user_profiles.* FROM users FULL JOIN user_profiles ON user_profiles.user_id = users.id WHERE users.id = $1",
            [id]
        )
        .then((results) => {
            return results.rows[0];
        });
}

function updateUser({ first_name, last_name, email, password, user_id }) {
    if (password) {
        return hash(password).then((password_hash) => {
            return db.query(
                `
        UPDATE users
        SET first_name = $1, last_name = $2, email = $3, password_hash = $4
        WHERE id = $5
        `,
                [first_name, last_name, email, password_hash, user_id]
            );
        });
    }
    return db.query(
        `
        UPDATE users
        SET first_name = $1, last_name = $2, email = $3
        WHERE id = $4
        `,
        [first_name, last_name, email, user_id]
    );
}

function upsertUserProfile({ age, city, url, user_id }) {
    return db.query(
        "INSERT INTO user_profiles(user_id, age, city, url) VALUES ($1, $2, $3, $4) ON CONFLICT (user_id) DO UPDATE SET age = $2, city = $3, url = $4",
        [user_id, age ? age : null, city, url]
    );
}

function deleteSignature(id) {
    return db
        .query("DELETE FROM signatures WHERE user_id = $1 RETURNING id", [id])
        .then((result) => result);
}

module.exports = {
    createUserProfiles,
    getAllUsers,
    createUser,
    getUserByEmail,
    getSignatureFromUser,
    createSignature,
    getSignatures,
    getSignaturesByCity,
    countSignatures,
    upsertUserProfile,
    upsertUserProfile,
    updateUser,
    getUserInfoById,
    deleteSignature,
};
