var express = require("express");
app = express();


app.set("view engine", "ejs");


app.get("/", function (req, res) {
    res.render("homepage");
})

app.get("/login", function (req, res) {
    res.render("login");
})

app.get("/register", function (req, res) {
    res.render("register");
})


app.listen(3000, function () {
    console.log("started");
})