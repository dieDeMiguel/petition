const express = require("express");
const router = express.Router();

const { checkIfLoggedIn } = require("../middlewares");
const {
    getSignatureFromUser,
    createSignature,
    getSignatures,
    getSignaturesByCity,
    countSignatures,
    deleteSignature,
} = require("../database");

router.get("/signature", checkIfLoggedIn, (request, response) => {
    const user_id = request.session.user_id;
    countSignatures().then((count) => {
        getSignatureFromUser(user_id).then((result) => {
            if (!result || result.length === 0) {
                response.render("signature", {
                    home: true,
                    title: "Time to sign!",
                    firstHeader: "Sign the petition!",
                    subtitle:
                        "You are only one step away from being part of change",
                    actionPage: "signature",
                });
                return;
            }
            response.render("thank-you", {
                signature: result.text_signature,
                home: false,
                title: "Thanks for participating!",
                count,
            });
            return;
        });
    });
});

router.post("/signature", checkIfLoggedIn, (request, response) => {
    const user_id = request.session.user_id;
    const signature = request.body.signature;
    let error;
    if (signature.length === 0) {
        error = "You must give your signature";
        response.render("signature", {
            error,
            home: true,
            title: "Time to sign!",
            firstHeader: "Oops",
            actionPage: "signature",
        });
        return;
    }
    createSignature(signature, user_id)
        .then(() => countSignatures())
        .then((count) => {
            response.render("thank-you", {
                signature,
                home: false,
                title: "Thanks for participating!",
                firstHeader: "Sign the petition!",
                subtitle:
                    "You are only one step away from being part of change",
                actionPage: "signature",
                count,
            });
        })
        .catch((DBError) => {
            let error;
            if (DBError.constraint === "signatures_id_key") {
                error = "You can Only sign once";
                response.render("thank-you", {
                    error,
                    home: false,
                    title: "Oops, Already Signed!",
                });
                return;
            }
        });
});

router.get("/signers", checkIfLoggedIn, (request, response) => {
    getSignatures()
        .then((signatures) => {
            response.render("signatures", {
                title: "All who already signed!",
                signatures,
                total: signatures.length,
                signers: true,
            });
        })
        .catch((error) => {
            console.log("error in getting signatures", error);
            response.sendStatus(500);
        });
});

router.get("/signers/:city", checkIfLoggedIn, (request, response) => {
    let city = request.params.city;
    getSignaturesByCity(city)
        .then((signatures) => {
            response.render("signaturesCity", {
                title: `All who already signed in ${city}!`,
                signatures,
                city,
                total: signatures.length,
                signers: true,
            });
        })
        .catch((error) => {
            console.log("error in getting signatures by City", error);
            response.sendStatus(500);
        });
});

router.post("/unsign", checkIfLoggedIn, (request, response) => {
    const user_id = request.session.user_id;
    deleteSignature(user_id)
        .then(() => {
            response.redirect("/signature");
            return;
        })
        .catch((error) => {
            console.log("Problems deleting user signature: ", error);
            response.sendStatus(500);
        });
});

module.exports = router;
