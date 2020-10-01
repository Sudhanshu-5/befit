var express = require("express");
var router = express.Router();
var middleware = require("../middleware");
var axios = require("axios");
var maletheuser = require("../models/maleUser");
var mealinfo = require("../models/mealInfo");
var calorieinfo = require("../models/calorieInfo");
var userfood = require("../models/userFood");
const femaleUser = require("../models/femaleUser");
var macronutrientinfo = require("../models/macroNutrientInfo");

var userType;
var gender = "";
router.use(function (req, res, next) {
    if (req.user) {
        gender = req.user.gender;
        if (gender === "male") {
            userType = maletheuser
        }
        if (gender === "female") {
            userType = femaleUser
        }
    }
    next();
});
var dateNow = (new Date(Date.now())) //IST time
console.log("dateNow" + dateNow)
// !SHOW - profile
router.get("/viewProfile", middleware.isLoggedIn, function (req, res) {

    userType.findOne({
        username: req.user.username
    }, function (err, founduser) {
        if (err) {
            console.log(err);
        } else {
            // console.log(founduser)
            //render show template with that campground
            res.render("profile/viewProfile", {
                founduser: founduser
            });
        }
    });
});

// ! EDIT profile
router.get("/editProfile", middleware.isLoggedIn, function (req, res) {
    userType.findOne({
        username: req.user.username
    }, function (err, founduser) {
        if (err) {
            console.log(error);
        } else {
            res.render("profile/editProfile", {
                founduser: founduser
            });

        }

    });
});

// !UPDATE 
router.put("/viewProfile", middleware.isLoggedIn, async (req, res) => {
    try {
        let updateuser = await user.findOneAndUpdate({
            username: req.user.username
        }, {
            username: req.body.founduser.username
        }, {
            upsert: true,
            new: true
        });
    } catch (err) {
        console.log(err)
    }
    try {
        let updatedUsertype = await userType.findOneAndUpdate({
            username: req.user.username
        }, req.body.founduser, {
            upsert: true,
            new: true
        });
    } catch (err) {
        console.log(err)
    }
    try {
        let updatedOnDate = await onDate.findOneAndUpdate({
            date: dateNow.toLocaleDateString(),
            username: req.user.username
        }, req.body.founduser, {
            upsert: true,
            new: true
        });
    } catch (err) {
        console.log(err)
    }
    res.redirect("/viewProfile");
})
router.get("/editRatios", middleware.isLoggedIn, async (req, res) => {
    try {
        let ratio = {};
        var findeduser = await userType.findOne({
            username: req.user.username
        });
        if (findeduser.activityFactor == 1.2) {
            ratio["carbs"] = findeduser.inactive_carbsRatio;
            ratio["protiens"] = findeduser.inactive_protiensRatio;
            ratio["fats"] = findeduser.inactive_fatsRatio;
        } else if (findeduser.activityFactor == 1.375 || findeduser.activityFactor == 1.55) {

            ratio["carbs"] = findeduser.med_carbsRatio;
            ratio["protiens"] = findeduser.med_protiensRatio;
            ratio["fats"] = findeduser.med_fatsRatio;

        } else {
            ratio["carbs"] = findeduser.high_carbsRatio;
            ratio["protiens"] = findeduser.high_protiensRatio;
            ratio["fats"] = findeduser.high_fatsRatio;
        }
        //console.log("-----------:" + findedUser);
        res.render("profile/editRatios", {
            findeduser: findeduser,
            ratio: ratio
        })

    } catch (err) {
        console.log(err);
    }
});

router.put("/editRatios", middleware.isLoggedIn, async (req, res) => {
    console.log("oooooooooooooooo" + JSON.stringify(req.body.eratio));
    let ratio = {};
    var findeduser = await userType.findOne({
        username: req.user.username
    });
    if (findeduser.activityFactor == 1.2) {
        ratio["inactive_carbsRatio"] = req.body.eratio["carbs"];
        ratio["inactive_protiensRatio"] = req.body.eratio["protiens"];
        ratio["inactive_fatsRatio"] = req.body.eratio["fats"];
    } else if (findeduser.activityFactor == 1.375 || findeduser.activityFactor == 1.55) {

        ratio["med_carbsRatio"] = req.body.eratio["carbs"];
        ratio["med_protiensRatio"] = req.body.eratio["protiens"];
        ratio["med_fatsRatio"] = req.body.eratio["fats"];

    } else {
        ratio["high_carbsRatio"] = req.body.eratio["carbs"];
        ratio["high_protiensRatio"] = req.body.eratio["protiens"];
        ratio["high_fatsRatio"] = req.body.eratio["fats"];
    }
    var updateuser = await userType.findOneAndUpdate({
            username: req.user.username
        },
        ratio, {
            new: true,
            upsert: true // Make this update into an upsert
        });
    console.log("updated user---------------------" + updateuser)
    res.redirect("back")

});

module.exports = router;