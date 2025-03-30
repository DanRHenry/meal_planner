require("dotenv").config();

// -------------------------------------- Express Section ---------------------------------------
const express = require("express");
const app = express();
const server = require("http").createServer(app);
// const WebSocket = require("ws");
// const PORT = 3300;
const PORT = process.env.PORT;

// Middleware:

const requireValidation = require("./middleware/validate-session");

// const wss = new WebSocket.Server({ server: server });

// wss.on("connection", function connection(ws) {
//   console.log("A new client connected");
//   ws.send("Welcome new client");
//   ws.on("message", function incoming(message) {
//     console.log("received: %s", message);
//     // ws.send("got your message, duder:" + message);
//         // Broadcast the message to every connected client
//         wss.clients.forEach(function each(client) {
//           if(client !== ws && client.readyState === WebSocket.OPEN) {
//               client.send("" + message)
//           }
//       })
//   });
// });


// const bodyParser = require("body-parser");

// ---------------------- Controllers: -------------------
const userController = require("./controllers/user.controller");
const ingredientController = require ("./controllers/ingredient.controller")
const recipeController = require("./controllers/recipe.controller")
const recipeIngredientController = require ("./controllers/recipeIngredient.controller")
const weeklyPlanningController = require("./controllers/weeklyPlanning.controller")
// Adding cors() to handle the preflight request for us (something Postman did for us), this is part of our server middleware required and called in the app.js
const cors = require("cors");

// Require in the mongoose middleware, pulled/used from node_modules
const mongoose = require("mongoose");

// Create a variable for our connection address variable from the .env


const MONGO = process.env.MONGODB;

//! ---------- Disabling this lets the socket connect
mongoose.connect(
  `${MONGO}/mealPlanner`,
//   { useNewUrlParser: true },
//   { useUnifiedTopology: true }
);

// mongoose.connect(`${MONGO}/jeopardy{useNewUrlParser: true}, { useUnifiedTopology: true}`);
// console.log(MONGO,"has connected")
// Create a variable that is an event listener to check if connected.
const db = mongoose.connection;

// Use the above variable to trigger event listener to check connection
db.once("open", () => console.log(`Connected: ${MONGO}`));

// Added to allow us to accept JSON data from the body of our client.
app.use(express.json());

// Allowing the app to use cors
app.use(cors());

// app.use(bodyParser.urlencoded({ extended: true }));

// ! https://community.render.com/t/no-access-control-allow-origin-header/12947


app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS,CONNECT,TRACE"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, X-Content-Type-Options, Accept, X-Requested-With, Origin, Access-Control-Request-Method, Access-Control-Request-Headers"
  );
  res.setHeader("Access-Control-Allow-Credentials", true);
  res.setHeader("Access-Control-Allow-Private-Network", true);
  //  Firefox caps this at 24 hours (86400 seconds). Chromium (starting in v76) caps at 2 hours (7200 seconds). The default value is 5 seconds.
  res.setHeader("Access-Control-Max-Age", 7200);

  next();
});

app.options("*", (req, res) => {
  console.log("preflight");
  if (
    //      req.headers.origin === "https://badmintown.onrender.com" &&
    req.headers.origin === "https://danhenrydev.com" &&
    allowMethods.includes(req.headers["access-control-request-method"]) &&
    allowHeaders.includes(req.headers["access-control-request-headers"])
  ) {
    console.log("pass");
    return res.status(204).send();
  } else {
    console.log("fail");
  }
});

app.use("/api/mealPlanner/user", userController)


app.use(requireValidation)
app.use("/api/mealPlanner/ingredient", ingredientController)
app.use("/api/mealPlanner/recipe", recipeController)
app.use("/api/mealPlanner/recipeingredient", recipeIngredientController)
app.use("/api/mealPlanner/weeklyplanning", weeklyPlanningController)
// app.use("/api/jeopardy/user", user);
// app.use("/api/jeopardy/questions", questions);
// app.use("/api/jeopardy/gameplay", gameplay);

// app.get("/", (req, res) => {
//   res.send("it's ALIVE");
// });

// app.listen(PORT, () =>
  // console.log(`The jeopardyServer is running on Port: ${PORT}`)
// );

// Changed from app.listen to server.listen when implementing websocket
server.listen(PORT, () =>
  console.log(`The mealPlanner server is running on Port: ${PORT}`)
);
