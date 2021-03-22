const express = require("express");
const app = express();
var cookieSession = require("cookie-session");
const hb = require("express-handlebars");
const path = require("path");
const csurf = require("csurf");

app.set("view engine", "handlebars");

const userRouter = require("./routers/users");
const signatureRouter = require("./routers/signatures");

var hbs = hb.create({
    helpers: {
        checkIfHome: function (arg1, options) {
            if (arg1) {
                return options.fn(this);
            }
            return options.inverse(this);
        },
        clearURL: function (value) {
            if (value.startsWith("http://")) {
                return value;
            }
            return `http://${value}`;
        },
    },
});

app.use(
    express.urlencoded({
        extended: false,
    })
);

app.use(
    cookieSession({
        secret: "Signature_Session",
        maxAge: 1000 * 60 * 60 * 24 * 14,
    })
);

app.use(express.static(path.join(__dirname, "public")));

app.use(csurf());

app.use((request, response, next) => {
    response.locals._session = !!request.session.user_id;
    response.locals.csrfToken = request.csrfToken();
    next();
});

app.use(
    express.urlencoded({
        extended: false,
    })
);

app.engine("handlebars", hbs.engine);

app.use(userRouter);
app.use(signatureRouter);

if (require.main == module) {
    console.log("Server up and running on port: 8080");
    app.listen(process.env.PORT || 8080);
}

module.exports = app;
