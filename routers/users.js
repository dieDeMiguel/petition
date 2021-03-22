const express = require("express");
const router = express.Router();

const { compare, hash } = require("../password");
const { checkIfLoggedIn, checkIfLoggedOut } = require("../middlewares");
const {
    createUser,
    getUserByEmail,
    createUserProfiles,
    upsertUserProfile,
    updateUser,
    getUserInfoById,
} = require("../database");

router.get("/", (request, response) => {
    if (request.session.user_id) {
        response.redirect("/signature");
        return;
    }
    response.render("homepage", {
        title: "We can do it!",
        firstHeader: "Cast a vote!",
        subtitle:
            "Let's be be \"clean players\", let's keep Eimsbüttel clean, let's handle Verpakung Müll differently.",
        actionPage: "register ",
    });
});

router.post("/register", (request, response) => {
    const { first_name, last_name, email, password } = request.body;
    let error;
    if (!first_name || !last_name || !password || !email) {
        error = "You forgot to complete one or more fields from the form";
        response.render("homepage", {
            error,
            title: "We can do it!",
        });
        return;
    }
    hash(password).then((hashedPassword) => {
        createUser(first_name, last_name, email, hashedPassword)
            .then((user_id) => {
                request.session.user_id = user_id;
                _session = true;
                response.redirect("/userprofile");
                return;
            })
            .catch((error) => {
                if (error.constraint === "users_email_key") {
                    error = "Email taken";
                    response.render("homepage", {
                        error,
                        firstHeader: "Try again",
                        title: "We can do it!",
                        actionPage: "register",
                    });
                    return;
                }
                console.log("Error while creating user: ", error);
                response.sendStatus(500);
            });
    });
});

router.get("/userprofile", checkIfLoggedIn, (request, response) => {
    response.render("userProfile", {
        home: false,
        title: "Tell us a little bit more about you!",
        firstHeader: "Second Step",
        subtitle: "We would like to know more about you",
        actionPage: "userprofile",
    });
});

router.post("/userprofile", checkIfLoggedIn, (request, response) => {
    const user_id = request.session.user_id;
    const { age, city, url } = request.body;
    if ((!age, !city, !url)) {
        response.redirect("/signature");
        return;
    }
    createUserProfiles(user_id, age, city, url)
        .then(() => {
            response.render("signature", {
                home: true,
                title: "Time to sign!",
                firstHeader: "You are one step away",
                actionPage: "signature",
            });
            return;
        })
        .catch((error) => {
            console.log("Error while creating user_profiles relation: ", error);
            response.sendStatus(500);
        });
});

router.get("/login", checkIfLoggedOut, (request, response) => {
    response.render("login", {
        home: false,
        title: "Login!",
        firstHeader: "Cast a vote!",
        subtitle:
            "Let's be be \"clean players\", let's keep Eimsbüttel clean, let's handle Verpakung Müll differently.",
        actionPage: "login",
    });
});

router.post("/login", checkIfLoggedOut, (request, response) => {
    const { email, password } = request.body;
    let error;
    if (!email || !password) {
        error = "You forgot something";
        response.render("login", {
            error,
            home: false,
            firstHeader: "Cast a vote!",
            title: "Login!",
            actionPage: "login",
        });
        return;
    }
    getUserByEmail(email).then((result) => {
        if (!result) {
            error = "Unable to find this email";
            response.render("login", {
                error,
                home: false,
                firstHeader: "Cast a vote!",
                subtitle: "Something went wrong",
                title: "Try again",
                actionPage: "login",
            });
            return;
        }
        compare(password, result.password_hash).then((match) => {
            let error;
            if (!match) {
                error = "Wrong password";
                response.render("login", {
                    error,
                    home: false,
                    firstHeader: "Cast a vote!",
                    subtitle: "Something went wrong",
                    title: "Login!",
                    actionPage: "login",
                });
                return;
            }
            request.session.user_id = result.id;
            response.redirect("/");
            return;
        });
    });
});

router.get("/update", checkIfLoggedIn, (request, response) => {
    const user_id = request.session.user_id;
    getUserInfoById(user_id).then((userInfo) => {
        response.render("updateUser", {
            home: false,
            title: "Update your Info!",
            firstHeader: "You are part of change!",
            subtitle: "Here you can update your information",
            actionPage: "update",
            ...userInfo,
        });
    });
});

router.post("/update", checkIfLoggedIn, (request, response) => {
    const user_id = request.session.user_id;
    let error;
    if (request.body.email === "" || request.body.email.length === 0) {
        let error = "You can't erase your email";
        getUserInfoById(user_id).then((userInfo) => {
            response.render("updateUser", {
                home: false,
                error,
                title: "Update your Info!",
                firstHeader: "email is important for us!",
                subtitle: "Oops",
                actionPage: "update",
                ...userInfo,
            });
            return;
        });
    }
    Promise.all([
        updateUser({
            ...request.body,
            user_id,
        }),
        upsertUserProfile({ ...request.body, user_id }),
    ])
        .then(() => {
            return getUserInfoById(user_id);
        })
        .then((userInfo) => {
            response.render("updateUser", {
                home: false,
                title: "Update your Info!",
                firstHeader: "You are part of change!",
                subtitle: "You info has been updated",
                actionPage: "update",
                ...userInfo,
            });
            return;
        })
        .catch((error) => {
            console.log("Error updating profile", error);
            response.sendStatus(500);
        });
});

router.post("/logout", checkIfLoggedIn, (request, response) => {
    request.session.user_id = null;
    response.redirect("/");
});

module.exports = router;
