const supertest = require("supertest");
const app = require("./index.js");
const cookieSession = require("cookie-session");
const spicedPg = require("./__mocks__/spiced-pg");

test.skip("Request to /home is successful", () => {
    return supertest(app)
        .get("/")
        .then((res) => {
            expect(res.statusCode).toBe(200);
            expect(res.headers["content-type"]).toContain("text/html");
        });
});

test("POST request is successful", () => {
    spicedPg.mockRowsOnce([
        {
            email: "7@7.com",
            password_hash:
                "$2a$10$T8ofr4rwtL4mS2jjqqLhZuHqLJS87Yd.bPmZVmjjfDvLxEYnUbzc2",
        },
    ]);
    return supertest(app)
        .post("/login")
        .send("email=7@7.com&password=h4$h_success")
        .expect("Location", "/");
});

//Exercise 1 lesson notes
test.skip("loggedout users are redirected to registration when trying to acces signature", () => {
    return supertest(app).get("/signature").expect("Location", "/");
});

//Exercise 2 lesson notes
test.skip("GET to /secret redirects to / when the user is not logged in", () => {
    cookieSession.mockSessionOnce({
        user_id: 123,
    });
    return supertest(app).get("/login").expect("Location", "/");
});

//Exercise 3 lesson notes
test.skip("POST request is successful", () => {
    spicedPg.mockRowsOnce([{ signature: "_signature" }]);
    cookieSession.mockSessionOnce({
        user_id: 123,
    });
    return supertest(app).post("/signature").expect("Location", "/thank-you");
});

//Exercise 4 lesson notes
//Users who are logged in and have not signed the petition are redirected to the petition
//page when they attempt to go to either the thank you page or the signers page

test.skip("Users who are logged in and have...", () => {
    cookieSession.mockSessionOnce({
        user_id: 123,
    });
    return supertest(app).post("/thank-you").expect("Location", "/thank-you");
});
