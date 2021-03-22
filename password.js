const { response } = require("express");
const { genSalt, hash, compare } = require("bcryptjs");

module.exports = {
    compare,
    hash: (password) => {
        return genSalt().then((salt) => {
            return hash(password, salt);
        });
    },
    mayBeHash: (password) => {
        password ? hash(password) : Promise.resolve(false);
    },
};
