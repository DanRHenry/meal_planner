require("dotenv").config();

const express = require("express");
const app = express();
const server = require("http").createServer(app);
const PORT = process.env.PORT;

const requireValidation = require("./middleware/validate-session");

// ---------------------- Controllers: -------------------
const userController = require("./controllers/user.controller");
const ingredientController = require ("./controllers/ingredient.controller")
const recipeController = require("./controllers/recipe.controller")
const recipeIngredientController = require ("./controllers/recipeIngredient.controller")
const weeklyPlanningController = require("./controllers/weeklyPlanning.controller")

const cors = require("cors");

const mongoose = require("mongoose");

const MONGO = process.env.MONGODB;

mongoose.connect(
  `${MONGO}/mealPlanner`,
);

const db = mongoose.connection;

db.once("open", () => console.log(`Connected: ${MONGO}`));

// Added to allow us to accept JSON data from the body of our client.
app.use(express.json());

app.use(cors());

// ! https://community.render.com/t/no-access-control-allow-origin-header/12947

app.use("/api/mealPlanner/user", userController)

//------------------ Require Validation -----------------
app.use(requireValidation)
app.use("/api/mealPlanner/ingredient", ingredientController)
app.use("/api/mealPlanner/recipe", recipeController)
app.use("/api/mealPlanner/recipeingredient", recipeIngredientController)
app.use("/api/mealPlanner/weeklyplanning", weeklyPlanningController)

server.listen(PORT, () =>
  console.log(`The mealPlanner server is running on Port: ${PORT}`)
);