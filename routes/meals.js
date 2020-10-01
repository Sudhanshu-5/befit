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
// const {
//     response 
// } = require("express");
const middlewareObj = require("../middleware");
const {
    json
} = require("body-parser");
const {
    findByIdAndUpdate
} = require("../models/maleUser");


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

//!addMeal for particular user

router.get("/addMeal", middleware.isLoggedIn, async (req, res) => {
    try {
        var findedUser = await userType.findOne({
            username: req.user.username
        }).populate("userfood");
        //console.log("-----------:" + findedUser);
        res.render("meal/addMeal", {
            findedUser: findedUser
        });
    } catch (err) {
        console.log(err);
    }
});

router.post("/addMeal", middleware.isLoggedIn, function (req, res) {
    var info = ""; //description
    var label = "";

    //USER food info array
    var uCalsum = 0;
    var uProsum = 0;
    var uCarbsum = 0;
    var uFatsum = 0;
    var ufooditems = [];
    var uqty = [];
    var uservingUnit = [];
    var uservingWeight = [];
    var ucalorie = [];
    var ufats = [];
    var ucarbs = [];
    var uprotiens = [];
    var ucholestrol = [];
    var ufibres = [];
    // if(foodFromKitchen){}
    // let foodFromKitchen = req.body.myfoodsName;
    // let myfoodsqty = req.body.myfoodsQty.map(Number);
    // let myfoodsmeasure = req.body.myfoodsMeasure;
    // console.log("999" +typeof(myfoodsmeasure))
    // let myfoodsWeight = req.body.myfoodsWeight.map(Number);

    // console.log(typeof (myfoodsqty));
    // console.log(typeof(myfoodsmeasure));
    // console.log(myfoodsWeight)

    //if food from kitchen is also added
    if (req.body.myfoodsName) {
        let userFood = req.body.myfoodsName;
        let myfoodsqty = req.body.myfoodsQty.map(Number);
        let myfoodsmeasure = req.body.myfoodsMeasure;
        let myfoodsWeight = req.body.myfoodsWeight.map(Number);

        for (let i = 0; i < userFood.length; i++) {

            userFood[i] = userFood[i].trim();
            userfood.findOne({
                food_name: userFood[i]
            }, function (err, food) {
                if (err) {
                    console.log(err)
                } else {
                    triggered(food);
                }

            })

            function triggered(food) {
                let factor; //for particular weight

                for (let i = 0; i < myfoodsmeasure.length; i++) {
                    for (let j = 0; j < food.serving_unit.length; j++) {
                        //console.log(food.serving_unit[j] + " " + myfoodsmeasure[i])
                        if (food.serving_unit[j] === myfoodsmeasure[i]) {
                            // console.log("permitted")
                            factor = myfoodsWeight[i] / food.serving_weight[j];
                            // console.log("factor" + factor)
                        }
                    }
                }

                // console.log("foofasdSDAS" + food);
                uCalsum = uCalsum + food.calories * factor;
                // console.log(typeof (uCalsum) + "0000000000000000000000000" + " " + uCalsum)
                // console.log("uSUM" + usum);
                ufooditems.push(food.food_name);
                uqty.push(myfoodsqty[i]);
                uservingUnit.push(myfoodsmeasure[i]);
                uservingWeight.push(myfoodsWeight[i]);
                ucalorie.push(food.calories * factor);
                ufats.push(food.fats * factor);
                uFatsum += food.fats * factor;
                //  console.log(typeof (uFatsum) + "0000000000000000000000000 " + uFatsum)

                ucarbs.push(food.carbs * factor);
                uCarbsum += food.carbs * factor;

                uprotiens.push(food.protiens * factor);
                uProsum += food.protiens * factor;
                ucholestrol.push(food.cholestrol * factor);
                ufibres.push(food.fibres * factor);

                // console.log("fd" + ksum)
                // console.log("sad" + kfooditems)
                // console.log("ADS" + kqty)
                // console.log("sad" + kservingUnit)
                // console.log("asd" + kservingWeight);
                // console.log("asd" + kcalorie)
                // console.log("sad" + kfats);
                // console.log("as" + kcarbs);
                // console.log("sad" + kprotiens);
                // console.log("asd" + kcholestrol);
                // console.log("ads" + kfibres);


            }

        }
    }

    //instant path
    if (req.body.labelInstant) {

        info = req.body.qty * req.body.weight + "g" + " " + req.body.food;
        label = req.body.labelInstant;
        console.log('info ' + info)
        //console.log("info" + info + label);

    }
    //descriptive path
    else if (req.body.labelDescription) {
        info = req.body.query
        label = req.body.labelDescription;
        //console.log("info" + info + label);
    }

    var caloriesSum = 0;
    var calsum = 0;
    var proSum = 0;
    var carbSum = 0;
    var fatSum = 0;
    var fooditems = [];
    var qty = [];
    var servingUnit = [];
    var servingWeight = [];
    var calorie = [];
    var fats = [];
    var carbs = [];
    var protiens = [];
    var cholestrol = [];
    var fibres = [];
    var consumedAt = [];
    axios({
        method: "post",
        url: " https://trackapi.nutritionix.com/v2/natural/nutrients",
        headers: {

            "x-app-id": "4b34a3d8",
            "x-app-key": "6943cb151e2c8fb6a042ca0f342347da",
            "x-remote-user-id": "0"

        },
        data: {
            "query": info,
            "timezone": "Asia/Calcutta"
        }

    }).then(function (response) {
        // console.log("ooooooooooooooooooooooooooooooooooooooooooooooooooooo" + qty)

        //console.log("kkkkkkkkkkkkkkkwwwwwwwwwwwaaaale" + kfooditems)
        //console.log(response.data["foods"]); 

        for (var i = 0; i < response.data["foods"].length; i++) {
            calsum = calsum + response.data["foods"][i].nf_calories;
            fooditems.push(response.data["foods"][i].food_name);

            qty.push(response.data["foods"][i].serving_qty);

            servingUnit.push(response.data["foods"][i].serving_unit);
            servingWeight.push(response.data["foods"][i].serving_weight_grams);
            calorie.push(response.data["foods"][i].nf_calories);
            fats.push(response.data["foods"][i].nf_total_fat);
            fatSum += response.data["foods"][i].nf_total_fat;
            carbs.push(response.data["foods"][i].nf_total_carbohydrate);
            carbSum += response.data["foods"][i].nf_total_carbohydrate;
            protiens.push(response.data["foods"][i].nf_protein);
            proSum += response.data["foods"][i].nf_protein;
            cholestrol.push(response.data["foods"][i].nf_cholesterol);
            fibres.push(response.data["foods"][i].nf_dietary_fiber);

        }



    }).catch(function (error) {

        if (fooditems.length > 0) {
            req.flash('error', 'add ur meal with correct spellings')
            res.redirect('back')
        }
    }).finally(function () {

        caloriesSum = calsum + uCalsum;
        // console.log(typeof (caloriesSum) + "111111111111111111111111111111 " + caloriesSum)
        fatSum = fatSum + uFatsum;
        carbSum = carbSum + uCarbsum;
        proSum = proSum + uProsum;
        console.log("summmmmmmmmmmmmmmmmmmmm " + caloriesSum + " " + fatSum + " " + carbSum + " " + proSum)


        fooditems = fooditems.concat(ufooditems);
        qty = qty.concat(uqty);
        servingUnit = servingUnit.concat(uservingUnit);
        servingWeight = servingWeight.concat(uservingWeight);
        calorie = calorie.concat(ucalorie);
        fats = fats.concat(ufats);
        carbs = carbs.concat(ucarbs);
        protiens = protiens.concat(uprotiens);
        cholestrol = cholestrol.concat(ucholestrol);
        fibres = fibres.concat(ufibres);
        // console.log("sum---" + caloriesSum);
        // console.log(fibres + "------fibres");
        // console.log("concat" + fooditems)
        if (fooditems.length) {

            var data = {
                calorieConsumption: caloriesSum,
                sumPro: proSum,
                sumCarbs: carbSum,
                sumFats: fatSum,
                label: label,
                description: info,
                foodItems: fooditems,
                qty: qty,
                servingUnit: servingUnit,
                servingWeight: servingWeight,
                calories: calorie,
                cholestrol: cholestrol,
                fats: fats,
                carbs: carbs,
                protiens: protiens,
                fibres: fibres
            }
            //!create meal info
            mealinfo.create(data,
                function (err, data) {
                    if (err) {
                        console.log("error" + err)
                    } else {
                        //console.log("mealinfo" + data);
                        //!push and save meal info to user model
                        userType.findOne({
                            username: req.user.username
                        }, function (err, findedUser) {
                            if (err) {
                                console.log(err);
                            } else {
                                findedUser.mealinfo.push(data);
                                findedUser.save(function (err, addedData) {
                                    if (err) {
                                        console.log(err);
                                    } else {
                                        //console.log("pushedandsavedData" + addedData);
                                    }
                                });
                                //! total values
                                userType.findOne({
                                    username: req.user.username
                                }).populate("mealinfo").populate("macroNutrientInfo").exec(function (err, foodinfo) {
                                    if (err) {
                                        console.log(err);
                                    } else {
                                        console.log("userinfo" + foodinfo);
                                        //console.log("daaaaaaata " + data.calorieConsumption)
                                        var totalCalorie = parseFloat(data.calorieConsumption); //from body
                                        var totalProtiens = parseFloat(data.sumPro);
                                        var totalFats = parseFloat(data.sumFats);
                                        var totalCarbs = parseFloat(data.sumCarbs);

                                        console.log("totslcalore= " + totalCalorie);
                                        console.log("totalFAts:" + totalFats);
                                        console.log("totalPro:" + totalProtiens);
                                        console.log("totalCarbs:" + totalCarbs);

                                        console.log("999999999999999999999 " + dateNow.toLocaleDateString())
                                        if (foodinfo.macroNutrientInfo.length > 0) {
                                            console.log("lengthjjjjjjjjjjjjjjjjjjjjjjjjjjjjj")
                                            foodinfo.mealinfo.forEach(function (info) {
                                                console.log("99999999999999999999 " + (new Date(info.createdAt)).toLocaleDateString())
                                                if ((new Date(info.createdAt)).toLocaleDateString().localeCompare(dateNow.toLocaleDateString()) == 0) {
                                                    totalCalorie = totalCalorie + parseFloat(info.calorieConsumption);
                                                    totalCarbs += parseFloat(info.sumCarbs);
                                                    totalFats += parseFloat(info.sumFats);
                                                    totalProtiens += parseFloat(info.sumPro);




                                                }
                                            })

                                        }


                                        console.log("totslcalore= " + totalCalorie);
                                        console.log("totalFAts:" + totalFats);
                                        console.log("totalPro:" + totalProtiens);
                                        console.log("totalCarbs:" + totalCarbs);


                                        macronutrientinfo.findOneAndUpdate({

                                            date: dateNow.toLocaleDateString(),
                                            username: req.user.username

                                        }, {
                                            totalCaloriesConsumed: totalCalorie,
                                            total_carbs: totalCarbs,
                                            total_fats: totalFats,
                                            total_pro: totalProtiens

                                        }, {
                                            new: true,
                                            upsert: true // Make this update into an upsert
                                        }, function (err, updatedCalorieInfo) {
                                            if (err) {
                                                console.log(err);
                                            } else {
                                                console.log("winwinwinwiwnwinwiwwiwn  " + updatedCalorieInfo);
                                                console.log("totslcalore= " + totalCalorie);
                                                console.log("totalFAts:" + totalFats);
                                                console.log("totalPro:" + totalProtiens);
                                                console.log("totalCarbs:" + totalCarbs);
                                                //if (foodinfo.macronutrientinfo) {
                                                let count = 0;
                                                if (foodinfo.macroNutrientInfo.length == 0) {
                                                    foodinfo.macroNutrientInfo.push(updatedCalorieInfo);
                                                    foodinfo.save(function (err, saved) {
                                                        if (err) {
                                                            console.log(err)
                                                        } else {
                                                            console.log(saved);
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
                                                    foodinfo.macroNutrientInfo.forEach(function (info) {
                                                        console.log("casmkmaskksakksa" + info)
                                                        console.log("11111111111111111" + info.createdAt.toLocaleDateString());
                                                        console.log("22222222222222222" + updatedCalorieInfo.createdAt.toLocaleDateString())
                                                        if (info.createdAt.toLocaleDateString() == updatedCalorieInfo.createdAt.toLocaleDateString()) {
                                                            count++;

                                                        }
                                                    })
                                                    console.log("countttttttttttttttttttttt " + count)
                                                    if (count == 0) {
                                                        foodinfo.macroNutrientInfo.push(updatedCalorieInfo);
                                                        foodinfo.save(function (err, saved) {
                                                            if (err) {
                                                                console.log(err)
                                                            } else {
                                                                console.log(saved);
                                                            }
                                                        })
                                                    }
                                                }
                                            }
                                        })



                                        // } else {
                                        //     foodinfo.macronutrientinfo.push(updatedCalorieInfo);
                                        //     foodinfo.save(function (err, saved) {
                                        //         if (err) {
                                        //             console.log(err)
                                        //         } else {
                                        //             console.log(saved);
                                        //         }
                                        //     })
                                        // }


                                        // userType.findOne({
                                        //     username: req.user.username
                                        // }).populate('calorieinfo').exec(function (err, populatedCalorieInfo) {

                                        // });


                                        // function create() {
                                        //     //console.log("length==:+")
                                        //     calorieinfo.create({

                                        //     }, function (err, created) {
                                        //         if (err) {
                                        //             console.log(err)
                                        //         } else {
                                        //             //console.log("created" + created._id);
                                        //             //!push totsl calorie in usermodel
                                        //             findedUser.calorieinfo.push(created);
                                        //             findedUser.save(function (err, savedUser) {

                                        //                 if (err) {
                                        //                     console.log(err);
                                        //                 } else {
                                        //                     // console.log("savedUser" + savedUser);
                                        //                     var data = {
                                        //                         totalCaloriesConsumed: totalCalorie,

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
                                        // if (findedUser.calorieinfo.length === 0) {
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
                                        //             //console.log(byDate);
                                        //             //!if bydate[] != date.now then call func which creates
                                        //             //!if bydate[] === date.now   to update
                                        //             length = byDate.calorieinfo.length;
                                        //             var d = byDate.calorieinfo[length - 1].createdAt;
                                        //             //  console.log("length" + length);
                                        //             // console.log("date" + d);
                                        //             if ((new Date(d)).toLocaleDateString().localeCompare(dateNow) == 0) {
                                        //                 var data = {
                                        //                     totalCaloriesConsumed: totalCalorie,

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

                        //console.log("data:" + data);
                        req.flash('info', 'Meal is added to ur  diary');
                        res.redirect('back');
                    }

                });
        } //end if(fooditems.length)
    })
});
//!delete Meal route
router.delete("/deleteMeal/:mealmillisec/:deleteThisIndexMeal", middleware.isLoggedIn, async (req, res) => {

    let mealmillisecToDate = new Date(+req.params.mealmillisec);
    let index = req.params.deleteThisIndexMeal;
    console.log(index + "iiiiiiiiiiiiiiiiiiiiiiiiiiiiii")

    // console.log("000000000000 " + mealmillisecToDate)
    try {
        let findedMealId;
        let findedMeal = await userType.findOne({
            username: req.user.username
        }).populate("mealinfo");
        //console.log("000000000" + findedMeal)
        findedMeal.mealinfo.forEach(function (meal) {
            console.log(meal.createdAt + "-----------" + mealmillisecToDate);
            //console.log(typeof (meal.createdAt) + "-----------" + typeof (mealmillisecToDate));
            if (JSON.stringify(meal.createdAt) === JSON.stringify(mealmillisecToDate)) {
                findedMealId = meal._id;
                console.log("iddddddd " + findedMealId);
            }
        })
        // var arrIndex = `foodItems.${index}`;
        /* ... */
        // db.collection.update({}, {
        //     $unset: {
        //         [arrIndex]: 1
        //     }
        // });
        mealinfo.update(findedMealId, {
            $unset: {
                "foodItems.0": 1
            }
        });
        //WriteResult({"nMatched": 1, "nUpserted": 0, "nModified": 1});

        mealinfo.update(findedMealId, {
            $pull: {
                "foodItems": null
            }
        });
        // WriteResult({"nMatched": 1, "nUpserted": 0, "nModified": 1});

        mealinfo.findById(findedMealId, function (err, ad) {
            if (err) {
                console.log(err)
            } else {
                console.log(ad);
            }
        })
        console.log(JSON.stringify(mealinfo));


    } catch (err) {
        console.log(err);
    }
});
//!manage diary
router.get("/diary", middleware.isLoggedIn, async (req, res) => {
    try {
        var findedUser = await userType.findOne({
            username: req.user.username
        }).populate("mealinfo");
        //console.log("UserById:" + findedUser);


        res.render("meal/mealDiary", {
            findedUser: findedUser
        });
    } catch (err) {
        console.log(err);
    }
});

//!Custom foods
router.get("/customFoods", middleware.isLoggedIn, function (req, res) {
    userType.findOne({
        username: req.user.username
    }).populate("userfood").exec(function (err, populated) {
        if (err) {
            console.log(err);
        } else {
            //console.log("populated" + populated);
            // console.log("kitchen logs" + populated)
            res.render("meal/userfoods", {
                myfoods: populated
            })
        }


    })
})
router.post("/customFoods", middleware.isLoggedIn, function (req, res) {

    let unit_array = [];
    let qty_array = [];
    let weight_array = [];
    for (let i = 0; i < req.body.qty.length; i++) {
        qty_array[i] = req.body.qty[i];
        console.log("check" + typeof (req.body.qty))
        console.log(typeof (qty_array[i]) + "sakjjbdhj bhbahdbhadjhjsah")
        weight_array[i] = req.body.serving_weight[i];
        unit_array[i] = req.body.serving_unit[i];
    }
    let completeObj = req.body.info;
    completeObj["qty"] = qty_array;
    completeObj["serving_unit"] = unit_array;
    completeObj["serving_weight"] = weight_array;
    userfood.create(
        completeObj,
        function (err, info) {
            if (err) {
                console.log(err);
            } else {
                // console.log("info" + info);
                userType.findOne({
                    username: req.user.username
                }, function (err, finded) {
                    finded.userfood.push(info);
                    finded.save(function (err, saved) {
                        if (err) {
                            console.log(err);
                        } else {
                            // console.log(saved);
                            req.flash('info', ' custom food added');
                            res.redirect('back');
                        }
                    })
                })
            }

        })
})

// !nutritional label

router.get("/Nutritional label", middleware.isLoggedIn, function (req, res) {
    res.render("meal/instantSearchFood")
});


//!instant searcch for food
router.get("/searchInstant", middleware.isLoggedIn, function (req, res) {
    res.render("meal/instantSearchFood")
})
router.get("/searchFood", middleware.isLoggedIn, function (req, res) {
    console.log(req.query.query);
    var url = " https://trackapi.nutritionix.com/v2/search/instant?query=" + req.query.query + "&detailed=true";
    axios({
        method: "get",
        url: url,
        headers: {
            "content-type": "text/json",
            "Content-Type": "application/json",
            "x-app-id": "4b34a3d8",
            "x-app-key": "6943cb151e2c8fb6a042ca0f342347da",
            "x-remote-user-id": "0"
        }
    }).then(function (response) {
        //res.send(response.data);

    }).catch(function (error) {
        console.log(error);
    }).finally(function () {})
});


router.post("/searchNutrients", middleware.isLoggedIn, function (req, res) {
    var info = req.body.query;

    console.log("Query" + JSON.stringify(info));
    axios({
        method: "post",
        url: " https://trackapi.nutritionix.com/v2/natural/nutrients",
        headers: {
            //"content-type": "text/json", 
            //"Content-Type": "application/json", 
            "x-app-id": "4b34a3d8",
            "x-app-key": "6943cb151e2c8fb6a042ca0f342347da",
            "x-remote-user-id": "0"

        },
        data: {
            query: info
        }

    }).then(function (response) {
        var temp = response.data["foods"][0];

        // var a = {
        //     food: temp.food_name,
        //     total_fat: temp.nf_total_fat,
        //     saturated_fat: temp.nf_saturated_fat,
        //     cholestrol: temp.nf_cholesterol,
        //     carbs: temp.nf_total_carbohydrate,
        //     fiber: temp.nf_dietary_fiber,
        //     sugar: temp.nf_sugars,
        //     protiens: temp.nf_protein,
        // }
        //console.log(a);
        res.render("meal/nutritionalFacts", {
            data: temp
        });
    }).catch(function (error) {
        // alert("Field should not be empty")
    }).finally(function () {

    })
});
module.exports = router;
// 	dataPoints.push({
//         label: "<%-(new Date(calorieinfo.macroNutrientInfo[<%-i%>].createdAt)).toLocaleDateString()%>",
//         y: <%-calorieinfo.macroNutrientInfo[<%-i%>].totalCaloriesConsumed-calorieinfo.macroNutrientInfo[<%-i%>].totalCaloriesBurned%>
//  });