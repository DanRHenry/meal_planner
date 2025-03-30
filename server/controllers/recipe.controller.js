const router = require("express").Router();
const Recipe = require("../models/recipe.model");

const serverError = (res, error) => {
  console.log("Server-side error");
  return res.status(500).json({
    Error: error.message,
  });
};

// ------------------------ POST ----------------------

router.post("/storeRecipe", async (req, res) => {
  console.log("req.body: ", req.body)
  try {
    const recipeInfo = new Recipe({
      recipeName: req.body.recipeName,
      suggestedMeal: req.body.suggestedMeal,
      ingredients: req.body.ingredients,
      time: req.body.time,
      temperature: req.body.temperature,
      instructions: req.body.instructions,
      numberOfServings: req.body.numberOfServings,
      creator: req.body.creator,
      family: req.body.family
    });


    const newRecipeInfo = await recipeInfo.save();
    if (newRecipeInfo) {
      console.log("newRecipe:", newRecipeInfo);
    }
    res.status(200).json({
      newRecipeInfo: newRecipeInfo,
      message: `Success! Recipe Saved!:${req.body}`,
    });
  } catch (err) {
    // console.log(Recipe);
    res.status(500).json({
      ERROR: err.message,
    });
  }
});

// ------------------------- Find One -----------------------

router.post("/find", async (req, res) => {
  try {
    console.log("req.body: ", await req.body)
    const { recipeName, creator, family } = await req.body;
    // console.log("aRecipeName:", await recipeName);
    const findRecipe = await Recipe.findOne({ recipeName: recipeName });

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
