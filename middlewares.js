function checkIfLoggedIn(request, response, next) {
    if (!request.session.user_id) {
        response.redirect("/");
        return;
    }
    next();
}

function checkIfLoggedOut(request, response, next) {
    if (request.session.user_id) {
        response.redirect("/");
        return;
    }
    next();
}

module.exports = {
    checkIfLoggedIn,
    checkIfLoggedOut,
};
