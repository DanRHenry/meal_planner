const router = require("express").Router();
// const Week = require("../models/ingredient.model");
// const Week = require("../models/recipeIngredient.model");
const Week = require("../models/week.model");

const serverError = (res, error) => {
  console.log("Server-side error");
  return res.status(500).json({
    Error: error.message,
  });
};

// ------------------------ POST ----------------------

router.post("/storeWeeklyData", async (req, res) => {
  try {
    // console.log("req: ",req.body)

    const date = req.body.date
    const breakfast = req.body.breakfast
    const lunch = req.body.lunch
    const dinner = req.body.dinner
    const snacks = req.body.snacks
    const creator = req.body.creator
    const family = req.body.family

    // const { mealObject, ID } =
      // req.body;
    // console.log("--------------------------",mealObject, ID)

    // console.log("--------------------------",date, breakfast, creator, family)

    const findWeeklyPlanningInformation = await Week.findOne({
      date: date,
      creator: creator,
      family: family,
    });

    console.log("findWeeklyPlanningInformation: ",findWeeklyPlanningInformation)

    if (!findWeeklyPlanningInformation) {
      const weeklyPlanningInformation = new Week({
        date: date,
        breakfast: breakfast,
        lunch: lunch,
        dinner: dinner,
        snacks: snacks,
        creator: creator,
        family: family,
      });

      const newWeeklyPlanningInformation =
        await weeklyPlanningInformation.save();

            console.log("findWeeklyPlanningInformation: ",findWeeklyPlanningInformation)


      res.status(200).json({
        weeklyPlanningInformation: newWeeklyPlanningInformation,
        // weeklyPlanningInformation: newWeeklyPlanningInformation,
        message: `Success! Week Saved!`,
      });
    } else {
      // const info = req.body
      const returnOption = { new: true };
      const id = findWeeklyPlanningInformation._id;

      const info = {
        breakfast: breakfast,
        lunch: lunch,
        dinner: dinner,
        snacks: snacks,
      };

      const updatedInformation = await Week.findOneAndUpdate(
        id,
        info,
        returnOption
      );

      res.status(200).json({
        message: `Existing Information`,
        body: updatedInformation,
      });
    }
  } catch (err) {
    serverError(res, err);
  }
});

// ------------------------- Find Week -----------------------

router.post("/findweek", async (req, res) => {
  const {datesInput, creator, family} = req.body;

  if (datesInput) {
    console.log("------------------------------");
    console.log("datesInput: ",datesInput)
  }
  let keys, values;
  let results = [];

  if (datesInput) {
  keys = Object.keys(datesInput)
  values = Object.values(datesInput)
  } else {
    keys = []
    values = []
  }
   
  const dates = [];

  for (let i = 0; i < keys.length; i++) {
    let date = values[i]

    for (let i = 0; i < date.length; i++) {
      console.log("length:", date[i].toString().length)
        if (date[i].toString().length < 2) {
        date[i] = "0" + date[i]
      }
      else {
        date[i] = date[i].toString()
      }
    }

    console.log("date: ",date)

    let datesObject = {}
    datesObject[keys[i]] = date.join("")
    dates.push(datesObject)
  }

  
  if (dates.length === 0) {
    return;
  } else {
    

    console.log("dates: ",dates)


  for (let i = 0; i < dates.length; i++) {
    try {
      const findWeeklyPlanningDayInformation = await Week.findOne({
        date: dates[i],
      });
      if (findWeeklyPlanningDayInformation !== null) {
        results.push(findWeeklyPlanningDayInformation);
      }
    } catch (err) {
      serverError(res, err);
    }
  }

}
  results.length > 0
    ? res.status(200).json({
        message: "Found!",
        results: JSON.stringify(results),
      })
    : res.status(404).json({
        message: `Can't Find the Week Entry.`,
      });
});

router.post("/findweeklyCalories", async (req, res) => {
  try {
    // console.log("bodyadyady: ",req.body)
    const weekDays = req.body.weekDays
    // console.log("weekDays: ",weekDays)
    const weeklyDates = [];
    for (let i = 0; i < weekDays.length; i++) {
      // console.log("weekDays[i]: ",weekDays[i])
      let date = weekDays[i].currentMonthDateYear

      date = addLeadingSpaceToDates(date)

      // console.log("date: ",date)
      // date = "03272025"

      calorieInformation = await Week.findOne({
        date: date,
        creator: req.body.creator,
        family: req.body.family,
      });

      if (calorieInformation !== null){
      weeklyDates.push(calorieInformation);}
    }
    // console.log("weeklyDates: ",weeklyDates)

    if (weeklyDates.length > 0) {
          res.status(200).json({
          message: "All Weekly Calorie Information:",
          weeklyDates,
        })
    } else {
      res.status(404).json({
          message: `No Weekly Calorie Info Found!`,
        });
            }
  } catch (err) {
    if (err) {
      console.log(
        "oops, there was a problem getting the weekly calories: ",
        err
      );
    }
  }
});

// router.post("/add", async (req, res) => {
//   try {
//     const date = req.body.date;
//     console.log("date", date);
//     const findWeeklyPlanningInformation = await Week.findOne({
//       date: date,
//     });

//     findWeeklyPlanningInformation
//       ? res.status(200).json({
//           message: "Found!",
//           findWeeklyPlanningInformation,
//         })
//       : res.status(404).json({
//           message: `Can't Find the Week Entry.`,
//         });
//   } catch (err) {
//     serverError(res, err);
//   }
// });

// --------------------------Get All ---------------------
router.get("/", async (req, res) => {
  try {
    const getAllWeeklyPlanning = await Week.find();
    getAllWeeklyPlanning
      ? res.status(200).json({
          message: "All Weekly Planning:",
          getAllWeeklyPlanning,
        })
      : res.status(404).json({
          message: `No Weekly Planning Found!`,
        });
  } catch (err) {
    serverError(res, err);
  }
});
/* 
----------------------------- Delete Week Endpoint ------------------------
*/
router.delete("/delete/", async (req, res) => {
  try {
    const { date } = req.body;

    const weeklyPlanningID = { date: date };

    const deleteWeeklyPlanningEntry = await Week.deleteOne(weeklyPlanningID);

    deleteWeeklyPlanningEntry.deletedCount === 1
      ? res.status(200).json({
          message: `The weekly planning entry was successfully deleted!`,
        })
      : res.status(404).json({
          message: `The weekly planning entry was unable to be deleted.`,
        });
  } catch (err) {
    console.log("oops");
    serverError(res, err);
  }
});

/* ------------------------- Patch Week Endpoint -------------------*/
// validateSession
router.patch("/updatemeal:id", async (req, res) => {
  try {
    //1. Pull value from parameter
    const { id } = req.params;

    const info = req.body;

    const returnOption = { new: true }; //

    console.log("id:", { _id: id });
    console.log("info:", req.body);
    // console.log("param id: ",{_id: id}, "info to update", info, "returnOption: ",returnOption)
    const updateMeal = await Week.findOneAndUpdate(
      { _id: id },
      info,
      returnOption
    );

    res.status(200).json({
      message: `Meal id ${id} has been updated successfully!`,
      updateMeal,
    });
  } catch (err) {
    serverError(res, err);
  }
});

      function addLeadingSpaceToDates(date) {
          for (let i = 0; i < date.length; i++) {
        if (date[i].toString().length < 2) {
        date[i] = "0" + date[i]
      }
      else {
        date[i] = date[i].toString()
      }
    }
      date = date.join("")
      return date
      }

module.exports = router;
