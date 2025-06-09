const router = require("express").Router();
const Recipe = require("../models/recipe.model");

const serverError = (res, error) => {
  console.log("Server-side error");
  return res.status(500).json({
    Error: error.message,
  });
};


// --------------------------Get All ---------------------
router.get("/", async (req, res) => {
  try {
    const getAllRecipes = await Recipe.find();
    getAllRecipes
      ? res.status(200).json({
          message: "All Recipes:",
          getAllRecipes,
        })
      : res.status(404).json({
          message: `No Recipes Found!`,
        });
  } catch (err) {
    serverError(res, err);
  }
});

// ---------------------------- POST ---------------------

router.post("/add", async (req, res) => {
  try {
    const {
      recipeName,
      suggestedMeal,
      ingredients,
      time,
      temperature,
      instructions,
      numberOfServings,
      creator,
      family,
    } = req.body;

    const findRecipe =  await Recipe.findOne({
      family: family,
      recipeName: recipeName,
      creator: creator
    })

    if (!findRecipe) {

    }
  }
  catch (err) {

  }
})

// ------------------------- Find One -----------------------

router.post("/find", async (req, res) => {
  try {
    const { recipeName, creator, family } = await req.body;

    console.log("searching for recipe", recipeName, creator, family)
    const findRecipe = await Recipe.findOne({
      recipeName: recipeName,
      creator: creator,
      family: family,
    });

    findRecipe
      ? res.status(200).json({
          message: "Found!",
          findRecipe,
        })
      : res.status(404).json({
          message: `Can't Find the Recipe.`,
        });
  } catch (err) {
    serverError(res, err);
  }
});

// ------------------------ PATCH ----------------------

router.patch("/updateRecipe:id", async (req, res) => {
  const { _id } = req.params;

  const {
    recipeName,
    suggestedMeal,
    ingredients,
    time,
    temperature,
    instructions,
    numberOfServings,
    creator,
    family,
  } = req.body;

  try {
    const recipeInfo = new Recipe({
      recipeName: recipeName,
      suggestedMeal: suggestedMeal,
      ingredients: ingredients,
      time: time,
      temperature: temperature,
      instructions: instructions,
      numberOfServings: numberOfServings,
      creator: creator,
      family: family,
    });

    const recipesearch = await Recipe.findOneAndUpdate({ id: _id }, recipeInfo);

    if (recipesearch) {
      const newRecipeInfo = await recipeInfo.save();
      res.status(200).json({
        newRecipeInfo: newRecipeInfo,
        message: `Success! Recipe Saved!:${req.body}`,
      });
    }
  } catch (err) {
    res.status(500).json({
      ERROR: err.message,
    });
  }
});

/* 
----------------------------- Delete Ingredient Endpoint ------------------------
*/
router.delete("/delete/", async (req, res) => {
  console.log("in progress");
  // res.header("Access-Control-Allow-Origin", "*");
  // res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  // console.log("deleting...");
  try {
    //* Pull the ingredient's info from the req
    const { recipeName } = req.body;

    const recipeId = { recipeName: recipeName };

    // const returnOption = { new: true };

    const deleteRecipe = await Recipe.deleteOne(recipeId);

    deleteRecipe.deletedCount === 1
      ? res.status(200).json({
          message: `The recipe was successfully deleted!`,
        })
      : res.status(404).json({
          message: `The recipe was unable to be deleted.`,
        });
  } catch (err) {
    // console.log("oops");
    serverError(res, err);
  }
});

module.exports = router;
