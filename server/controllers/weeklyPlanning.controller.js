const router = require("express").Router();
// const WeeklyPlanning = require("../models/ingredient.model");
// const WeeklyPlanning = require("../models/recipeIngredient.model");
const WeeklyPlanning = require("../models/weeklyPlanning.model");

const serverError = (res, error) => {
  console.log("Server-side error");
  return res.status(500).json({
    Error: error.message,
  });
};

// ------------------------ POST ----------------------

router.post("/storeWeeklyData", async (req, res) => {

  try {
    let date = req.body.date;
    const findWeeklyPlanningInformation = await WeeklyPlanning.findOne({
      date: date,
    });

    if (!findWeeklyPlanningInformation) {
      const weeklyPlanningInformation = new WeeklyPlanning({
        date: date,
        breakfast: req.body.breakfast,
        lunch: req.body.lunch,
        dinner: req.body.dinner,
        snacks: req.body.snacks,
        creator: req.body.creator,
        family: req.body.family
      });

      const newWeeklyPlanningInformation =
        await weeklyPlanningInformation.save();

      res.status(200).json({
        weeklyPlanningInformation: newWeeklyPlanningInformation,
        message: `Success! WeeklyPlanning Saved!`,
      });

    } 
    else {
      const weeklyPlanningInformation = new WeeklyPlanning({
        date: date,
        breakfast: req.body.breakfast,
        lunch: req.body.lunch,
        dinner: req.body.dinner,
        snacks: req.body.snacks,
        creator: req.body.creator,
        family: req.body.family
      });
      const info = req.body
      const returnOption = {new: true}
      const id = findWeeklyPlanningInformation._id

      const updatedInformation = await WeeklyPlanning.findOneAndUpdate(id, info, returnOption)
      // console.log("_id: ",findWeeklyPlanningInformation._id)
      // console.log("existing information...")
      res.status(200).json({
        message: `Existing Information`,
        body: updatedInformation
      });
    }

  } catch (err) {
    serverError(res, err);
  }
});

// ------------------------- Find Week -----------------------

router.get("/findweek/:dates", async (req, res) => {
  let { dates } = req.params;

  dates = dates.split(",")

  if (dates[0].length < 2) {
    dates[0] = "0"+dates[0]
  }

  if (dates[1].length < 2) {
    dates[1] = "0"+dates[1]
  }
  dates = dates.join("")

  let results = [];

  // console.log("dates",dates)

  try {
    const findWeeklyPlanningDayInformation = await WeeklyPlanning.findOne({
      date: dates,
    });
    if (findWeeklyPlanningDayInformation !== null) {
      results.push(findWeeklyPlanningDayInformation);
      // console.log("results: ", results)
    }
    // console.log("findWeeklyPlanningDayInformation", findWeeklyPlanningDayInformation)
    // console.log("dates in try", dates)
    // cosole.log("results:",results)
  } catch (err) {
    serverError(res, err);
  }

  results.length > 0
    ?res.status(200).json({
        message: "Found!",
        results: JSON.stringify(results),
      })
    : res.status(404).json({
        message: `Can't Find the WeeklyPlanning Entry.`,
      });
});

/* 
router.post("/find", async (req, res) => {
  try {
    const date = req.body.date;
    console.log("date", date);
    const findWeeklyPlanningInformation = await WeeklyPlanning.findOne({
      date: date,
    });

    findWeeklyPlanningInformation
      ? res.status(200).json({
          message: "Found!",
          findWeeklyPlanningInformation,
        })
      : res.status(404).json({
          message: `Can't Find the WeeklyPlanning Entry.`,
        });
  } catch (err) {
    serverError(res, err);
  }
});
*/

// --------------------------Get All ---------------------
router.get("/", async (req, res) => {
  try {
    const getAllWeeklyPlanning = await WeeklyPlanning.find();
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
----------------------------- Delete WeeklyPlanning Endpoint ------------------------
*/
router.delete("/delete/", async (req, res) => {
  try {
    const { date } = req.body;

    const weeklyPlanningID = { date: date };

    const deleteWeeklyPlanningEntry = await WeeklyPlanning.deleteOne(
      weeklyPlanningID
    );

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

/* ------------------------- Patch WeeklyPlanning Endpoint -------------------*/
// validateSession
router.patch("/updatemeal:id", async (req, res) => {
  try {
    //1. Pull value from parameter
    const {id} = req.params;

    const info = req.body;

    const returnOption = { new: true }; //

    console.log("id:",{_id: id})
    console.log("info:",req.body)
    // console.log("param id: ",{_id: id}, "info to update", info, "returnOption: ",returnOption)
    const updateMeal = await WeeklyPlanning.findOneAndUpdate({"_id": id}, info, returnOption);

    res.status(200).json({
      message: `Meal id ${id} has been updated successfully!`,
      updateMeal,
    });
  } catch (err) {
    serverError(res, err);
  }
});

module.exports = router;
