var express = require("express");
var router = express.Router();
var maletheuser = require("../models/maleUser");
var femaleuser = require("../models/femaleUser");
var middleware = require("../middleware");
var userType;
var gender;
router.use(function (req, res, next) {
    if (req.user) {
        gender = req.user.gender;
        console.log("gender" + gender)
        if (gender === "male") {
            userType = maletheuser
        }
        if (gender === "female") {
            userType = femaleuser
        }
    }

    next();
});
var dateNow = (new Date(Date.now())) //IST time
console.log("dateNow" + dateNow)

//! request to bmr form


router.get("/bmr", middleware.isLoggedIn, function (req, res) {

    userType.findOne({
        username: req.user.username
    }, function (err, info) {
        if (err) {
            console.log(err)
        } else {
            res.render("others/bmrform", {
                info: info
            })
        }
    })
})

//!calculate BMR
router.post("/bmr", middleware.isLoggedIn, async (req, res) => {
    let info;
    let W = req.body.weight;
    let H = req.body.height;
    let A = req.body.age;
    if (req.user.gender === "male") {

        bmr = 10 * W + 6.25 * H - 5 * A + 5;
        bmr = bmr * req.body.factor;
    }
    if (req.user.gender === "female") {
        bmr = 10 * W + 6.25 * H - 5 * A - 161;
        bmr = bmr * req.body.factor;
    }
    console.log("bmr" + bmr);
    console.log(req.user.gender);
    console.log(typeof (req.body.factor))
    var data = {
        weight: req.body.weight,
        height: req.body.height,
        age: req.body.age,
        bmr: bmr,
        activityFactor: req.body.factor
    }
    try {
        info = userType.findOneAndUpdate({
            username: req.user.username
        }, data, {
            upsert: true,
            new: true
        });
    } catch (err) {
        console.log(er)
    }
    try {
        let updatedOnDate = await onDate.findOneAndUpdate({
            date: dateNow.toLocaleDateString(),
            username: req.user.username
        }, req.body.data, {
            upsert: true,
            new: true
        });
    } catch (err) {
        console.log(err)
    }
    res.render("others/showbmr", {
        info: info
    })
})


module.exports = router;