const router = require("express").Router();
const Ingredient = require("../models/ingredient.model");

const serverError = (res, error) => {
  console.log("Server-side error");
  return res.status(500).json({
    Error: error.message,
  });
};

// ------------------------ POST ----------------------

router.post("/storeIngredient", async (req, res) => {
  const ingredients = req.body.ingredientName;
  const { quantity, calories, unit, creator, family } = req.body;
  // console.log(ingredients)
  try {
    for (let i = 0; i < ingredients.length; i++) {
      const ingredientName = ingredients[i];
      console.log("ingredients[i]",ingredients[i])

      const ingredientInfo = new Ingredient({
        ingredientName: ingredientName,
        quantity: quantity,
        unit: unit,
        calories: calories,
        creator: creator,
        family: family,
      });

      const newIngredientInfo = await ingredientInfo.save();

      if (newIngredientInfo) {
        console.log("newIngredientInfo(saved)");
      }
    }
    res.status(200).json({
      ingredientInfo: newIngredientInfo,
      message: `Success! Ingredient Saved!:${req.body}`,
    });
  } catch (err) {
    // console.log("Error Ingredient: ", Ingredient);
    res.status(500).json({
      ERROR: err.message,
    });
  }
});

// -------------------------- Patch -------------------------

// router.patch("/updateIngredient", async (req, res) => {
//   try {
//     const { name } = req.body;

//   }
// })
// ------------------------- Find One -----------------------

router.post("/find", async (req, res) => {
  try {
    let { ingredientName, family } = req.body;
    const recipeIngredients = ingredientName;
    const allExistingIngredients = await Ingredient.find();
    const findIngredientsByFamily = async () => {
      const output = [];

      for (let i = 0; i < recipeIngredients.length; i++) {
        for (let j = 0; j < allExistingIngredients.length; j++) {
          if (allExistingIngredients[j].family === family) {
            if (
              recipeIngredients[i] === allExistingIngredients[j].ingredientName
            ) {
              if (allExistingIngredients[j].family === family) {
                output.push(allExistingIngredients[j]);
              }
            }
          }
        }
      }
      return output;
    };

    const results = await findIngredientsByFamily();
    if (results.length > 0) {
      res.status(200).json({
        message: "Found!",
        data: results,
      });
    } else {
      console.log("not found");
      res.status(404).json({
        message: `Can't Find the Ingredient.`,
      });
    }
  } catch (err) {
    serverError(res, err);
  }
});

// --------------------------Get All ---------------------
router.get("/getallingredients:family", async (req, res) => {
  console.log("getting all ingredients...")
  const { family } = req.params;

  try {
    const getAllIngredients = await Ingredient.find();
    const ingredients = [];

    for (let i = 0; i < getAllIngredients.length; i++) {
      if (getAllIngredients[i].family === family) {
        ingredients.push(getAllIngredients[i]);
      }
    }

    ingredients
      ? res.status(200).json({
          message: "All Ingredients:",
          ingredients,
        })
      : res.status(404).json({
          message: `No Ingredient Found!`,
        });
  } catch (err) {
    serverError(res, err);
  }
});
/* 
----------------------------- Delete Ingredient Endpoint ------------------------
*/
router.delete("/delete/", async (req, res) => {
  try {
    const { ingredientName, family } = req.body;
    const allIngredientInstances = await Ingredient.find();

    let ingredientToDelete;

    for (let i = 0; i < allIngredientInstances.length; i++) {
      if (
        allIngredientInstances[i].family === family &&
        allIngredientInstances[i].ingredientName === ingredientName
      ) {
        ingredientToDelete = allIngredientInstances[i];
      }
    }

    const deleteIngredient = await Ingredient.deleteOne({
      _id: ingredientToDelete._id,
    });
    deleteIngredient.deletedCount === 1
      ? res.status(200).json({
          message: `The ingredient was successfully deleted!`,
        })
      : res.status(404).json({
          message: `The ingredient was unable to be deleted.`,
        });
  } catch (err) {
    serverError(res, err);
  }
});

module.exports = router;
