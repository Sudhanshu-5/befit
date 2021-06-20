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
router.get("/trends", middleware.isLoggedIn, async (req, res) => {
    let findeduser = await userType.findOne({
        username: req.user.username
    }).populate("macroNutrientInfo");
    res.render("trends/allCharts", {
        findeduser: findeduser
    })
})
//!targsts
router.get("/targets", middleware.isLoggedIn, async (req, res) => {
    try {
        //console.log(req.query.type+"1111111111111111111111111")
        var dc = (new Date(+req.query.milliForTargets));

        // console.log("date from calendardddddddddddddddd " + dc)
        let totals = {};
        let targets = {};

    
        let findeduser = await userType.findOne({
            username: req.user.username
        }).populate("macroNutrientInfo").populate('exerciseinfo');
        
    //   console.log(findeduser+"11111111111111")
        let bmr = findeduser.bmr;
        //console.log("ksdksadlksamsakmds " + findeduser)
        let energy
        let burned_calories=0
 findeduser.exerciseinfo.forEach(function (info) {
                if ((new Date(info.createdAt)).toLocaleDateString().localeCompare(dc.toLocaleDateString()) == 0) {
                   burned_calories = info['totalCaloriesBurned'];
                    
                }

            })
             energy = findeduser.goal_calories + burned_calories;
       
        
       
        if (req.query.type == "meal") {
            if (findeduser.activityFactor == 1.2) {
                targets["pTarget"] = (energy * findeduser.inactive_protiensRatio / 400).toFixed(2);
                targets["fTarget"] = (energy * findeduser.inactive_fatsRatio / 900).toFixed(2);
                targets["cTarget"] = (energy * findeduser.inactive_carbsRatio / 400).toFixed(2);


            } else if (findeduser.activityFactor == 1.375 || findeduser.activityFactor == 1.55) {

                targets["pTarget"] = (energy * findeduser.med_protiensRatio / 400).toFixed(2);
                targets["fTarget"] = (energy * findeduser.med_fatsRatio / 900).toFixed(2);
                targets["cTarget"] = (energy * findeduser.med_carbsRatio / 400).toFixed(2);

            } else if (findeduser.activityFactor == 1.72 || findeduser.activityFactor == 1.9) {
                targets["pTarget"] = (energy * findeduser.high_protiensRatio / 400).toFixed(2);
                targets["fTarget"] = (energy * findeduser.high_fatsRatio / 900).toFixed(2);
                targets["cTarget"] = (energy * findeduser.high_carbsRatio / 400).toFixed(2);
            }
            findeduser.macroNutrientInfo.forEach(function (info) {
                // console.log(info)
                
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
console.log(totals)



            res.render("meal/mealTargets", {
                totals: totals,
                targets: targets,
                energy:energy,
                bmr: bmr,
                goal: findeduser.goal,
                info: findeduser.macroNutrientInfo[1],
                dc:dc
            });
        }
            
    } catch (err) {
        console.log(err)
    }
})
//!calorie vs date track
router.get("/showCalorie", middleware.isLoggedIn, function (req, res) {
    
    let type_obj = {
        total_carbs: "Carbohydrates",
        total_fats: "Fats",
        total_pro: "Protiens",
    }
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
            // console.log(calorieinfo)
            length = calorieinfo.macroNutrientInfo.length;
            // console.log("macro lengthhhhhhhhhhhhhhhhhhhhhhhh " + length);
            // // console.log("calorieingoooooooooooooooooo " + calorieinfo)
            // console.log("--------------------- " + req.query.type);
            res.render("trends/calorie-date", {
                calorieinfo: calorieinfo,
                length: length,
                selected: req.query.selected,
                from: req.query.from,
                to: req.query.to,
                type: req.query.type,
                type_obj:type_obj
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
            //  console.log("weight lengthhhhhhhhhhhhhhhhhhhhhhhh " + length);
            // conso le.log("calorieingoooooooooooooooooo " + ondateinfo)

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

module.exports = router;
