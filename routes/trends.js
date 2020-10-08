var express = require("express");
var router = express.Router();
var middleware = require("../middleware");
var axios = require("axios");
var maletheuser = require("../models/maleUser");
var mealinfo = require("../models/mealInfo");
var calorieinfo = require("../models/calorieInfo");
var userfood = require("../models/userFood");
var macroNutrientInfo = require("../models/macroNutrientInfo");
var ondate = require("../models/onDate");
const femaleUser = require("../models/femaleUser");
// const {
//     response 
// } = require("express");
const middlewareObj = require("../middleware");
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

//!charts 
router.get("/trends", middleware.isLoggedIn, async(req, res)=> {
    let findeduser = await userType.findOne({
        username: req.user.username
    }).populate("macroNutrientInfo");
    res.render("trends/allCharts", {
        findeduser: findeduser
    })
})
//!targsts
router.get("/targets/:dc", middleware.isLoggedIn, async (req, res) => {
    try {
        var dc = (new Date(+req.params.dc))
        // console.log("date from calendardddddddddddddddd " + dc)
        let totals = {};
        let targets = {};


        let findeduser = await userType.findOne({
            username: req.user.username
        }).populate("macroNutrientInfo");
        let bmr = findeduser.bmr;
        //console.log("ksdksadlksamsakmds " + findeduser)

        // console.log(findeduser.bmr + " " + findeduser.activityFactor);

        if (findeduser.activityFactor == 1.2) {
            targets["pTarget"] = findeduser.bmr * findeduser.inactive_protiensRatio / 400;
            targets["fTarget"] = findeduser.bmr * findeduser.inactive_fatsRatio / 900;
            targets["cTarget"] = findeduser.bmr * findeduser.inactive_carbsRatio / 400;


        } else if (findeduser.activityFactor == 1.375 || findeduser.activityFactor == 1.55) {

            targets["pTarget"] = findeduser.bmr * findeduser.med_protiensRatio / 400;
            targets["fTarget"] = findeduser.bmr * findeduser.med_fatsRatio / 900;
            targets["cTarget"] = findeduser.bmr * findeduser.med_carbsRatio / 400;

        } else if (findeduser.activityFactor == 1.72 || findeduser.activityFactor == 1.9) {
            targets["pTarget"] = findeduser.bmr * findeduser.high_protiensRatio / 400;
            targets["fTarget"] = findeduser.bmr * findeduser.high_fatsRatio / 900;
            targets["cTarget"] = findeduser.bmr * findeduser.high_carbsRatio / 400;
        }
        findeduser.macroNutrientInfo.forEach(function (info) {
            // console.log(info)
            console.log("dateeeeeeeeeeeeeeeeeeeeeeeeeeeeee" + (info.createdAt).toLocaleDateString() + " " + dc.toLocaleDateString())
            if ((new Date(info.createdAt)).toLocaleDateString().localeCompare(dc.toLocaleDateString()) == 0) {
                console.log("ente toh krra")
                totals["totalCaloriesConsumed"] = info.totalCaloriesConsumed;
                totals["totalCaloriesBurned"] = info.totalCaloriesBurned;
                totals["totalProtiens"] = info.total_pro;
                totals["totalFats"] = info.total_fats;
                totals["totalCarbs"] = info.total_carbs;
            }

        })
        // console.log("lengthhhhhhhhhhhhhhh " + Object.keys(totals).length);
        if (Object.keys(totals).length == 0) {
            totals["totalCaloriesConsumed"] = 0;
            totals["totalCaloriesBurned"] = 0;
            totals["totalProtiens"] = 0;
            totals["totalFats"] = 0;
            totals["totalCarbs"] = 0;
        }


        // console.log("totalssssssssssssssssssss " + JSON.stringify(totals));
        // console.log("targetssssssssssssss " + JSON.stringify(targets));




        res.render("meal/targets", {
            totals: totals,
            targets: targets,
            bmr: bmr
        });
    } catch (err) {
        console.log(err)
    }
})
//!calorie vs date track
router.get("/showCalorie", middleware.isLoggedIn, function (req, res) {
    // console.log("selctedddddddddddddddddddddddddd " + req.query.selected);
    // console.log("frommmmmmmmmmmmmmmmmmmmmmmmmmmm " + req.query.from);
    // console.log("toooooooooooooooooooooooo " + req.query.to);
    userType.findOne({
        username: req.user.username
    }).populate('ondate').exec(function (err, ondateinfo) {
        if (err) {
            console.log(err)
        } else {
            // console.log("barobar to horaaaaaaaaaaaa " + ondateinfo)
        }
    })

    userType.findOne({
        username: req.user.username
    }).populate('macroNutrientInfo').exec(function (err, calorieinfo) {
        if (err) {
            console.log(err)
        } else {
            length = calorieinfo.macroNutrientInfo.length;
            // console.log("lengthhhhhhhhhhhhhhhhhhhhhhhh " + length);
            // console.log("calorieingoooooooooooooooooo " + calorieinfo)
            res.render("trends/calorie-date", {
                calorieinfo: calorieinfo,
                length: length,
                selected: req.query.selected,
                from: req.query.from,
                to: req.query.to
            })
        }
    })

})
//!weight vs date
router.get("/graphOdate", middleware.isLoggedIn, function (req, res) {
    // console.log("weight selctedddddddddddddddddddddddddd " + req.query.selected);
    // console.log("frommmmmmmmmmmmmmmmmmmmmmmmmmmm " + req.query.from);
    // console.log("toooooooooooooooooooooooo " + req.query.type);

    userType.findOne({
        username: req.user.username
    }).populate('ondate').exec(function (err, ondateinfo) {
        if (err) {
            console.log(err)
        } else {
            length = ondateinfo.ondate.length;
            // console.log("lengthhhhhhhhhhhhhhhhhhhhhhhh " + length);
            // console.log("calorieingoooooooooooooooooo " + ondateinfo)

            res.render("trends/graphOdate", {
                ondateinfo: ondateinfo,
                length: length,
                selected: req.query.selected,
                from: req.query.from,
                to: req.query.to,
                type: req.query.type //weight/height
            })
        }
    })

})
//!give graph representation of  nutrient values
// router.get("/searchInstant", middleware.isLoggedIn, function (req, res) {
//     res.render("meal/instantSearchFood")
// })
// router.post("/searchNutrients", middleware.isLoggedIn, function (req, res) {
//     var info = req.body.query; //api requirement to add info to pos
//     axios({
//         method: "post",
//         url: " https://trackapi.nutritionix.com/v2/natural/nutrients",
//         headers: {
//             //"content-type": "text/json", 
//             //"Content-Type": "application/json", 
//             "x-app-id": "4b34a3d8",
//             "x-app-key": "6943cb151e2c8fb6a042ca0f342347da",
//             "x-remote-user-id": "0"

//         },
//         data: {
//             query: info
//         }

//     }).then(function (response) {
//         var temp = response.data["foods"][0];

//         var a = {
//             food: temp.food_name,
//             total_fat: temp.nf_total_fat,
//             saturated_fat: temp.nf_saturated_fat,
//             cholestrol: temp.nf_cholesterol,
//             carbs: temp.nf_total_carbohydrate,
//             fiber: temp.nf_dietary_fiber,
//             sugar: temp.nf_sugars,
//             protiens: temp.nf_protein,
//         }
//         //console.log(a);
//         res.render("charts/charts", {
//             data: a
//         });
//     }).catch(function (error) {
//         alert("Field should not be empty")
//     }).finally(function () {

//     })
// });
module.exports = router;
// //!macronutrient targets
// router.get("/macroNutrientTarget/:date", middleware.isLoggedIn, async (req, res) => {
//     try {
//         let findedMealId;
//         let findedMeal = await userType.findOne({
//             username: req.user.username
//         }).populate("mealinfo");
//         //console.log("000000000" + findedMeal)
//         findedMeal.mealinfo.forEach(function (meal) {
//             // console.log(meal.date + "-----------" + mealmillisecToDate);
//             // console.log(typeof (meal.date) + "-----------" + typeof (mealmillisecToDate));
//             console.log(JSON.stringify(meal.createdAt.toLocaleDateString()) + "-------------------" + JSON.stringify((new Date(+req.params.date)).toLocaleDateString()));

//             if (JSON.stringify(meal.createdAt.toLocaleDateString()) === JSON.stringify((new Date(+req.params.date)).toLocaleDateString())) {

//                 console.log("ddddddddddddddddddddddddddddddddddddddddddddd" + JSON.stringify(req.params.date));
//                 var query = {},
//                     update = {
//                         expire: new Date()
//                     },
//                     options = {
//                         upsert: true,
//                         new: true,
//                         setDefaultsOnInsert: true
//                     };

//                 // Find the document
//                 Model.findOneAndUpdate(query, update, options, function (error, result) {
//                     if (error) return;

//                     // do something with the document
//                 });
//             }
//         })

//     } catch (err) {
//         console.log(err);
//     }
// });