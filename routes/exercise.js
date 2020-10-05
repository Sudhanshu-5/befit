var express = require("express");
var router = express.Router();
var maletheuser = require("../models/maleUser");
var femaleuser = require("../models/femaleUser");
var exerciseinfo = require("../models/exerciseInfo");
var calorieinfo = require("../models/calorieInfo");
var userexercise = require("../models/userExercise");
var middleware = require("../middleware");
var macronutrientinfo = require("../models/macroNutrientInfo");

var axios = require("axios");
const {
    session
} = require("passport");
const {
    request
} = require("express");

var dateNow = (new Date(Date.now()));

var userType;
var gender = "";
//set user model according to gender
router.use(function (req, res, next) {
    if (req.user) {
        gender = req.user.gender;
        console.log("meals" + gender);

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

//!add exercise for particcular user
router.get("/addExercise", middleware.isLoggedIn, async (req, res) => {
    try {
        var findedUser = await userType.findOne({
            username: req.user.username
        }).populate("userexercise");
        //console.log("UserById:" + findedUser);
        // console.log("findedUSer---------" + findedUser)
        // console.log(findedUser.DOB);
        let age = findedUser.age;
        let Gender = gender;
        let weight = findedUser.weight;
        let height = findedUser.height;
        // console.log("USer body" + Gender + " " + weight + " " + height + " " + age)
        res.render("exercise/addExercise", {
            findedUser: findedUser,
            age: age,
            weight: weight,
            height: height

        });


    } catch (err) {
        console.log(err);
    }

});

//!call nutrient api  add details to db
router.post("/addExercise", middleware.isLoggedIn, function (req, res) {

    let usum = 0;
    let uExerciseName = [];
    let uDuration = [];
    let uMet = [];
    let uCaloriesBurned = [];
    if (req.body.myExerciseName) {
        let userExercise = req.body.myExerciseName;
        let userDuration = req.body.myExerciseDuration.map(Number);

        for (let i = 0; i < userExercise.length; i++) {
            userExercise[i] = userExercise[i].trim();
            userexercise.findOne({
                exercise_name: userExercise[i]
            }, function (err, exercise) {
                if (err) {
                    console.log(err)
                } else {
                    // console.log("&&&&&&&&&&&&&&&&&&" + exercise)
                    triggered(exercise);
                }

            })

            function triggered(exercise) {

                let factor;
                factor = (userDuration[i] / exercise.duration);
                factor = factor.toFixed(2);
                console.log("factor " + factor)
                usum = usum + exercise.burnedcalories * factor;
                uCaloriesBurned.push(exercise.burnedcalories * factor);
                uMet.push(exercise.met);
                uDuration.push(userDuration[i]);
                uExerciseName.push(userExercise[i]);
                // console.log("0000000" + usum);
                // console.log("000000" + uCaloriesBurned);
                // console.log("0000000" + uMet);
                // console.log("000000000" + uDuration);
                // console.log("000000000" + uExerciseName);
            }

        }
    }
    let caloriesBurned = [];
    let durations = [];
    let exercises = [];
    let met = [];
    let label = req.body.xlabelDescription;
    let totalBurnedcalories = 0;
    var info = req.body.query; //api requirement to add info to post
    // console.log(req.body.age + " " + req.body.weight + " " + req.body.height + "1221333333")
    axios({
        method: "post",
        url: "https://trackapi.nutritionix.com/v2/natural/exercise",
        headers: {
            //"content-type": "text/json", 
            //"Content-Type": "application/json", 
            "x-app-id": "4b34a3d8",
            "x-app-key": "6943cb151e2c8fb6a042ca0f342347da",
            "x-remote-user-id": "0"

        },
        data: {
            query: info,
            gender: req.user.gender,
            weight_kg: req.body.weight,
            height_cm: req.body.height,
            age: req.body.age
        }

    }).then(function (response) {


        for (var i = 0; i < response.data.exercises.length; i++) {
            caloriesBurned.push(response.data.exercises[i].nf_calories);
            durations.push(response.data.exercises[i].duration_min);
            exercises.push(response.data.exercises[i].user_input);
            met.push(response.data.exercises[i].met);
            totalBurnedcalories = totalBurnedcalories + response.data.exercises[i].nf_calories;
        }


    }).catch(function (error) {

        if (exercises.length > 0) {
            req.flash('error', 'add ur exercise  with correct spellings')
            res.redirect('back')
        }

    }).finally(function () {
        totalBurnedcalories = totalBurnedcalories + usum;

        caloriesBurned = caloriesBurned.concat(uCaloriesBurned)
        // console.log("------------" + caloriesBurned);
        durations = durations.concat(uDuration);
        // console.log("----------" + durations)
        exercises = exercises.concat(uExerciseName);
        // console.log("-----------" + exercises);
        met = met.concat(uMet);
        if (exercises.length) {
            var data = {
                caloriesBurnedPerExercise: caloriesBurned,
                duration: durations,
                exerciseName: exercises,
                met: met,
                session: label,
                totalCaloriesBurned: totalBurnedcalories,
            }
            //!create exercise info
            exerciseinfo.create(data,
                function (err, data) {
                    if (err) {
                        console.log("error" + err)
                    } else {
                        //console.log("exerciseinfo" + data);
                        //!push and save exercise info to maletheuser
                        userType.findOne({
                            username: req.user.username
                        }, function (err, findedUser) {
                            if (err) {
                                console.log(err);
                            } else {
                                findedUser.exerciseinfo.push(data);
                                findedUser.save(function (err, addedData) {
                                    if (err) {
                                        console.log(err);
                                    } else {
                                        //console.log("pushedandsavedData" + addedData);
                                    }
                                });
                                //!total values
                                userType.findOne({
                                    username: req.user.username
                                }).populate("exerciseinfo").populate("macroNutrientInfo").exec(function (err, workoutinfo) {
                                    if (err) {
                                        console.log(err);
                                    } else {
                                        //console.log("workoutinfo----------- " + workoutinfo);
                                        var totalCalorie = parseFloat(data.totalCaloriesBurned);
                                        // console.log("totalCaloriesss " + totalCalorie);

                                        console.log("999999999999999999999 " + dateNow.toLocaleDateString())
                                        if (workoutinfo.macroNutrientInfo.length > 0) {
                                            console.log("lengthjjjjjjjjjjjjjjjjjjjjjjjjjjjjj")
                                            workoutinfo.exerciseinfo.forEach(function (info) {
                                                // console.log("99999999999999999999 " + (new Date(info.createdAt)).toLocaleDateString())
                                                if ((new Date(info.createdAt)).toLocaleDateString().localeCompare(dateNow.toLocaleDateString()) == 0) {
                                                    totalCalorie = totalCalorie + parseFloat(info.totalCaloriesBurned);
                                                }


                                            });
                                        }


                                        // console.log("totslcalore= " + totalCalorie);

                                        macronutrientinfo.findOneAndUpdate({
                                            date: dateNow.toLocaleDateString(),
                                            username: req.user.username
                                        }, {
                                            totalCaloriesBurned: totalCalorie,
                                        }, {
                                            new: true,
                                            upsert: true // Make this update into an upsert
                                        }, function (err, updatedCalorieInfo) {
                                            if (err) {
                                                console.log(err);
                                            } else {
                                                // console.log("winwinwinwiwnwinwiwwiwn  " + updatedCalorieInfo);
                                                // console.log("totslcalore= " + totalCalorie);

                                                //if (foodinfo.macronutrientinfo) {
                                                let count = 0;
                                                if (workoutinfo.macroNutrientInfo.length == 0) {
                                                    workoutinfo.macroNutrientInfo.push(updatedCalorieInfo);
                                                    workoutinfo.save(function (err, saved) {
                                                        if (err) {
                                                            console.log(err)
                                                        } else {
                                                            // console.log(saved);
                                                        }
                                                    })
                                                    //

                                                    // console.log("111111111111111111111111 " + (new Date(info.createdAt)) + " " + dateNow.toLocaleDateString())
                                                    // if ((new Date(info.createdAt)).toLocaleDateString() !== dateNow.toLocaleDateString()) {
                                                    //     console.log("kkkkkkkkkkkkdddddddddddddd")

                                                    // foodinfo.save(function (err, saved) {
                                                    //     if (err) {
                                                    //         console.log(err)
                                                    //     } else {
                                                    //         console.log(saved);
                                                    //     }
                                                    // })
                                                    // }

                                                    // })
                                                } else {
                                                    workoutinfo.macroNutrientInfo.forEach(function (info) {
                                                        if (info.createdAt.toLocaleDateString() == updatedCalorieInfo.createdAt.toLocaleDateString()) {
                                                            count++;
                                                        }
                                                    })
                                                    if (count == 0) {
                                                        workoutinfo.macroNutrientInfo.push(updatedCalorieInfo);
                                                        workoutinfo.save(function (err, saved) {
                                                            if (err) {
                                                                console.log(err)
                                                            } else {
                                                                // console.log(saved);
                                                            }
                                                        })
                                                    }
                                                }
                                            }
                                        })
                                        // workoutinfo.exerciseinfo.forEach(function (info) {

                                        //     if (new Date(info.date).toDateString().localeCompare(new Date(Date.now()).toDateString()) == 0) {
                                        //         totalCalorie = totalCalorie + parseFloat(info.totalCaloriesBurned);
                                        //     }

                                        // });
                                        // //console.log(totalCalorie);

                                        // //!create calorieinfo
                                        // function create() {
                                        //     console.log("length==:+")
                                        //     calorieinfo.create({

                                        //     }, function (err, created) {
                                        //         if (err) {
                                        //             console.log(err)
                                        //         } else {
                                        //             // console.log("created" + created._id);
                                        //             //!push in maletheuser
                                        //             findedUser.calorieinfo.push(created);
                                        //             findedUser.save(function (err, savedUser) {

                                        //                 if (err) {
                                        //                     console.log(err);
                                        //                 } else {
                                        //                     // console.log("savedUser" + savedUser);
                                        //                     var data = {
                                        //                         totalCaloriesBurned: totalCalorie,

                                        //                     }
                                        //                     var length = savedUser.calorieinfo.length;
                                        //                     calorieinfo.findByIdAndUpdate(savedUser.calorieinfo[length - 1]._id, data, {
                                        //                         upsert: true,
                                        //                         new: true

                                        //                     }, function (err, updatedCalorieInfo) {
                                        //                         // console.log("updatedCalorieInfo" + updatedCalorieInfo);
                                        //                     })
                                        //                 }
                                        //             })


                                        //         }
                                        //     })
                                        // }
                                        // if (findedUser.macroNutrientInfo.length === 0) {
                                        //     create();

                                        // } else {
                                        //     console.log("0");
                                        //     //!populate date
                                        //     userType.findOne({
                                        //         username: req.user.username
                                        //     }).populate('calorieinfo', 'date').exec(function (err, byDate) {
                                        //         if (err) {
                                        //             console.log(err)
                                        //         } else {
                                        //             // console.log(byDate);
                                        //             //!if bydate[] != date.now then call func which creates
                                        //             //!if bydate[] === date.now   to update
                                        //             length = byDate.calorieinfo.length;
                                        //             var d = byDate.calorieinfo[length - 1].date;
                                        //             console.log("length" + length);
                                        //             console.log("date" + d);
                                        //             if ((new Date(d)).toLocaleDateString().localeCompare(dateNow) == 0) {
                                        //                 var data = {
                                        //                     totalCaloriesBurned: totalCalorie,

                                        //                 }
                                        //                 calorieinfo.findByIdAndUpdate(byDate.calorieinfo[length - 1]._id, data, {
                                        //                     upsert: true,
                                        //                     new: true

                                        //                 }, function (err, updatedCalorieInfo) {
                                        //                     // console.log("updatedCalorieInfo" + updatedCalorieInfo);
                                        //                 })
                                        //             } else {
                                        //                 create();
                                        //             }

                                        //         }
                                        //     })
                                        // }


                                    }
                                });


                            }
                        });
                        req.flash('info', 'EXERCISE is added to ur  diary');
                        res.redirect('back');
                    }
                });
        }
    })
});

//!manage diasry

router.get("/exerciseDiary", middleware.isLoggedIn, async (req, res) => {
    try {
        var findedUser = await userType.findOne({
            username: req.user.username
        }).populate("exerciseinfo");
        // console.log("UserById:" + findedUser);

        res.render("exercise/exerciseDiary", {
            findedUser: findedUser
        });
    } catch (err) {
        console.log(err);
    }
});

//!custom Exercise

router.get("/customExercise", middleware.isLoggedIn, function (req, res) {
    userType.findOne({
        username: req.user.username
    }).populate("userexercise").exec(function (err, populated) {
        if (err) {
            console.log(err);
        } else {
            res.render("exercise/userExercise", {
                myexercise: populated
            })
        }
    })
})

router.post("/customExercise", middleware.isLoggedIn, function (req, res) {

    let completeObj = req.body.info;

    userexercise.create(
        completeObj,
        function (err, info) {
            if (err) {
                console.log(err);
            } else {
                // console.log("info" + info);
                userType.findOne({
                    username: req.user.username
                }, function (err, finded) {
                    finded.userexercise.push(info);
                    finded.save(function (err, saved) {
                        if (err) {
                            console.log(err);
                        } else {
                            // console.log(saved);
                            req.flash('info', ' custom execise added');
                            res.redirect('back');
                        }
                    })
                })
            }

        })
})

//!get execise suggestion
router.get("/suggestion", middleware.isLoggedIn, async (req, res) => {
    try {
        console.log("janjnasdsadsadas" + req.query.calories)
        let calories = req.query.calories;
        let duration_obj = {};
        let info = "30 min walking 30 min running 30 min bicycling ";
        let findeduser = await userType.findOne({
            username: req.user.username
        });
        // console.log("ajjsadajsnjsansdjnsajdnnajsjdnsandnas" + findedwser.username);
        axios({
            method: "post",
            url: "https://trackapi.nutritionix.com/v2/natural/exercise",
            headers: {
                //"content-type": "text/json", 
                //"Content-Type": "application/json", 
                "x-app-id": "4b34a3d8",
                "x-app-key": "6943cb151e2c8fb6a042ca0f342347da",
                "x-remote-user-id": "0"

            },
            data: {
                query: info,
                weight_kg: 63.5,

            }

        }).then(function (response) {

            duration_obj.walking_duration = Math.round((calories * response.data.exercises[0].duration_min) / response.data.exercises[0].nf_calories);
            duration_obj.running_duration = Math.round((calories * response.data.exercises[1].duration_min) / response.data.exercises[1].nf_calories);
            duration_obj.cycling_duration = Math.round((calories * response.data.exercises[2].duration_min) / response.data.exercises[2].nf_calories);

            // console.log(JSON.stringify(duration_obj) + "000000000000000000000 " + duration_obj);
            res.render("exercise/suggestions", {
                duration: duration_obj,
                calories: calories
            })
        }).catch(function (error) {
            console.log(error)

        }).finally(function () {

        })

    } catch (error) {
        console.log(error)
    }
})
module.exports = router;