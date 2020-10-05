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
    let update_obj = {}; //contains ratios and target
    var findeduser = await userType.findOne({
        username: req.user.username
    });
    if (findeduser.activityFactor == 1.2) {
        update_obj["inactive_carbsRatio"] = req.body.eratio["carbs"];
        update_obj["inactive_protiensRatio"] = req.body.eratio["protiens"];
        update_obj["inactive_fatsRatio"] = req.body.eratio["fats"];

        update_obj["p_target"] = findeduser.bmr * req.body.eratio["protiens"] / 400;
        update_obj["f_target"] = findeduser.bmr * req.body.eratio["fats"] / 900;
        update_obj["c_target"] = findeduser.bmr * req.body.eratio["carbs"] / 400;
    } else if (findeduser.activityFactor == 1.375 | findeduser.activityFactor == 1.55) {

        update_obj["med_carbsRatio"] = req.body.eratio["carbs"];
        update_obj["med_protiensRatio"] = req.body.eratio["protiens"];
        update_obj["med_fatsRatio"] = req.body.eratio["fats"];

        update_obj["p_target"] = findeduser.bmr * req.body.eratio["protiens"] / 400;
        update_obj["f_target"] = findeduser.bmr * req.body.eratio["fats"] / 900;
        update_obj["c_target"] = findeduser.bmr * req.body.eratio["carbs"] / 400;

    } else {
        update_obj["high_carbsRatio"] = req.body.eratio["carbs"];
        update_obj["high_protiensRatio"] = req.body.eratio["protiens"];
        update_obj["high_fatsRatio"] = req.body.eratio["fats"];

        update_obj["p_target"] = findeduser.bmr * req.body.eratio["protiens"] / 400;
        update_obj["f_target"] = findeduser.bmr * req.body.eratio["fats"] / 900;
        update_obj["c_target"] = findeduser.bmr * req.body.eratio["carbs"] / 400;
    }

    var updateuser = await userType.findOneAndUpdate({
            username: req.user.username
        },
        update_obj, {
            new: true,
            upsert: true // Make this update into an upsert
        });
    // console.log("updated user---------------------" + updateuser)
    res.redirect("back")

});

module.exports = router;

// (async () => {
//     try {

//         const response = await axios({
//             method: 'get',
//             url: 'https://trackapi.nutritionix.com/v2/search/item?nix_item_id=' + req.body.nixItemId,
//             headers: {
//                 "x-app-id": "4b34a3d8",
//                 "x-app-key": "6943cb151e2c8fb6a042ca0f342347da",
//                 "x-remote-user-id": "0"
//             }
//         });
//         console.log("1qqqqqqqqqqqqqqqqqqqqq " + JSON.stringify(response.data));
//         console.log("winwinwiwnwinwinwinwinwinwin " + response.data["foods"][0].nf_calories)
//         calsum = calsum + response.data["foods"][0].nf_calories;
//         fooditems.push(response.data["foods"][0].food_name);
//         console.log("nameeeeeeeeeeeeeeeeeeeeeeeeeeeee " + fooditems)
//         servingWeight.push(response.data["foods"][0].serving_weight_grams);
//         calorie.push(response.data["foods"][0].nf_calories);
//         fats.push(response.data["foods"][0].nf_total_fat);
//         fatSum += response.data["foods"][0].nf_total_fat;
//         carbs.push(response.data["foods"][0].nf_total_carbohydrate);
//         carbSum += response.data["foods"][0].nf_total_carbohydrate;
//         protiens.push(response.data["foods"][0].nf_protein);
//         proSum += response.data["foods"][0].nf_protein;
//         cholestrol.push(response.data["foods"][0].nf_cholesterol);
//         fibres.push(response.data["foods"][0].nf_dietary_fiber);
//         servingUnit.push(req.body.measure);
//         qty.push(req.body.qty);
//         console.log("fooooooooodItems" + fooditems.length)
//     } catch (err) {
//         console.log(err)
//     }
// })()