// const serverURL = "http://127.0.0.1:3498/api/mealPlanner";
// const serverURL = "https://www.danhenrydev.com/api/mealPlanner";
// import { url } from "inspector";
import { serverURL } from "../helpers/serverURL.js";

// https://developers.google.com/identity/sign-in/web/sign-getElementsByName("email")
// https://stackoverflow.com/questions/2264072/detect-a-finger-swipe-through-javascript-on-the-iphone-and-android
// https://github.com/john-doherty/swiped-events/blob/master/src/swiped-events.js

//!-------------------- DOM Variables ------------------------------------
const loginForm = document.getElementById("login-form");
const loginBtn = document.getElementById("login-Btn");
const loginSection = document.getElementById("loginSection");
const switchBtn = document.getElementById("switchBtn");
const email = document.getElementById("emailInput");
const password = document.getElementById("passwordInput");
const family = document.getElementById("familyInput");
const ingredientCollection = document.getElementsByClassName("ingredient");
const ingredientCheck = document.getElementsByClassName("ingredientCheck");
// const loginWelcomeSection = document.getElementById("loginWelcomeSection");

//!------------------------- Event Listeners-------------------------------

loginSection?.addEventListener("submit", login);

loginForm?.addEventListener("submit", login);

switchBtn?.addEventListener("click", toggleSignup);

//!---------------------------Global Variables-----------------------------

let selectAllFlag = false;

let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();
let currentDate = new Date().getDate();
let currentDay = new Date().getDay();
let shoppingListData;
let recipeListData;

const days = {
  0: 6,
  1: 0,
  2: 1,
  3: 2,
  4: 3,
  5: 4,
  6: 5,
};

const months = {
  0: "Jan",
  1: "Feb",
  2: "Mar",
  3: "Apr",
  4: "May",
  5: "Jun",
  6: "Jul",
  7: "Aug",
  8: "Sep",
  9: "Oct",
  10: "Nov",
  11: "Dec",
};

const calendar = {
  1: 31,
  2: 28,
  3: 31,
  4: 30,
  5: 31,
  6: 30,
  7: 31,
  8: 31,
  9: 30,
  10: 31,
  11: 30,
  12: 31,
  leapMonth: 29,
};

const conversionObject = {
  gal: 128,
  qt: 32,
  pint: 16,
  cup: 8,
  tbsp: 0.5,
  tsp: 1.6666667,
  "fl oz": 1,
};

const daysarray = ["", "Mon", "Tue", "Wed", "Thurs", "Fri", "Sat", "Sun"];

const fullDayNamesArray = [
  "",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thusday",
  "Friday",
  "Saturday",
  "Sunday",
];

const headerslabelsarray = [
  "Breakfast",
  "Lunch",
  "Dinner",
  "Snacks",
  "Calories",
];

//? What is this section here for???
// console.log("currentDate: ",currentDate)
// console.log("days[currentDay]: ",days[currentDay])
// console.log("currentDate - days[currentDay]: ",currentDate - days[currentDay])
if (currentDate - days[currentDay] > 0) {
  currentDate -= days[currentDay];
} else {
  currentMonth--;
  if (currentMonth % 4 === 0) {
    if (currentDate - days[currentDay] === 0) {
      currentDate = calendar.leapMonth + currentDate - days[currentDay];
    }
  } else {
    currentDate = calendar[currentMonth] + days[currentDay];
  }
}
//? ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

//!------------------------Async Functions-----------------------------

async function createMealPlanningPage() {
  // const recipes = [];

  const breakfastRecipesList = [];
  const lunchRecipesList = [];
  const dessertRecipesList = [];
  const dinnerRecipesList = [];
  const snacksRecipesList = [];

  let weeklyMeals = {
    previous: {},
    current: {},
    next: {},
  };

  resetDate();

  weeklyMeals.previous = await findWeeklyMeals(prevWeek().currentMonthDateYear);
  resetDate();

  // console.log(prevWeek().nextWeek);
  // resetDate();

  weeklyMeals.current = await findWeeklyMeals(prevWeek().nextWeek);
  resetDate();

  weeklyMeals.next = await findWeeklyMeals(nextWeek().currentMonthDateYear);
  resetDate();

  // console.log(weeklyMeals);
  const calendarControlRow = document.createElement("div");
  calendarControlRow.id = "calendarControlRow";

  const nextMonthBtn = document.createElement("button");
  nextMonthBtn.id = "nextMonthBtn";
  nextMonthBtn.textContent = "Next";
  nextMonthBtn.addEventListener("click", handleGetNextWeek);

  const prevMonthBtn = document.createElement("button");
  prevMonthBtn.id = "prevMonthBtn";
  prevMonthBtn.textContent = "Prev";
  prevMonthBtn.addEventListener("click", handleGetPrevWeek);

  function handleGetNextWeek() {
    const current = nextWeek().currentMonthDateYear;
    const currentMonth = current[0];
    const currentDate = current[1];
    const currentYear = current[2];

    dateDisplay.textContent = `Week of ${months[currentMonth]} ${currentDate}, ${currentYear}`;
  }

  function handleGetPrevWeek() {
    const current = prevWeek().currentMonthDateYear;
    const currentMonth = current[0];
    const currentDate = current[1];
    const currentYear = current[2];

    dateDisplay.textContent = `Week of ${months[currentMonth]} ${currentDate}, ${currentYear}`;
  }

  calendarControlRow.append(prevMonthBtn, nextMonthBtn);

  const mealPlanningGrid = document.createElement("div");
  mealPlanningGrid.id = "mealPlanningGrid";
  document.getElementById("mealPlanningWindow").append(mealPlanningGrid);

  const dateDisplayBox = document.createElement("div");
  dateDisplayBox.id = "dateDisplayBox";

  const dateDisplay = document.createElement("div");
  dateDisplay.id = "dateDisplay";

  const currentMonthDateYear =
    months[currentMonth].toString() +
    " " +
    currentDate.toString() +
    ", " +
    currentYear.toString();

  dateDisplay.textContent = `Week of ${currentMonthDateYear}`;

  dateDisplayBox.append(dateDisplay);

  mealPlanningGrid.after(dateDisplayBox);
  dateDisplay.before(calendarControlRow);

  // All recipes go to recipes. Use meal lists to prioritize standard meals, then add the rest for, ie. pizza for breakfast
  // const recipes = [];

  // console.log("recipes before edit functions:",recipes)

  for (let i = 0; i < daysarray.length; i++) {
    const day = document.createElement("div");
    day.className = "day";
    day.textContent = daysarray[i];
    mealPlanningGrid.append(day);
  }

  for (let i = headerslabelsarray.length - 1; i >= 0; i--) {
    const label = document.createElement("div");
    label.className = `${headerslabelsarray[i]}_row`;
    label.textContent = headerslabelsarray[i];

    const daysOfTheWeekLabels = document.getElementsByClassName("day");

    for (let j = daysarray.length - 1; j >= 1; j--) {
      if (i === 4) {
        const dailyCalorieTotal = document.createElement("div");
        dailyCalorieTotal.className = "dailyCalorieTotal";
        dailyCalorieTotal.textContent = "0";
        daysOfTheWeekLabels[daysOfTheWeekLabels.length - 1].after(
          dailyCalorieTotal
        );
        continue;
      }

      const mealsObject = {
        0: "breakfast",
        1: "lunch",
        2: "dinner",
        3: "snacks",
      };

      const button = document.createElement("button");
      button.textContent = "view";

      //todo change this view to the total number of calories for each meal

      button.classList.add(
        `edit_Meals_Category_Button`,
        `${mealsObject[i]}_${j}`
      );
      // button.className = ;
      button.addEventListener("click", () =>
        // button.style.backgroundColor = "gray",
        // () =>

        {
          document.getElementById("breakfastWindow")?.remove();
          document.getElementById("lunchWindow")?.remove();
          document.getElementById("dinnerWindow")?.remove();
          document.getElementById("snacksWindow")?.remove();
          document.getElementById("breakfastWindowContent")?.remove();
          document.getElementById("lunchWindowContent")?.remove();
          document.getElementById("dinnerWindowContent")?.remove();
          document.getElementById("snacksWindowContent")?.remove();

          changeClickedMealPlanningViewButtonColor();

          function changeClickedMealPlanningViewButtonColor() {
            const buttons = document.getElementsByClassName(
              `edit_Meals_Category_Button`
            );

            for (let button of buttons) {
              if (button.style.backgroundColor === "rgb(94, 93, 93)") {
                button.style.backgroundColor = "";
                button.style.color = "";

                for (let i = 0; i < headerslabelsarray.length; i++) {
                  const buttons = document.getElementsByClassName(
                    `edit_Meals_Category_Button`
                  );
                  for (let button of buttons) {
                    button.style.backgroundColor = "";
                    button.style.color = "";
                  }
                }
              }
            }

            button.style.backgroundColor = "rgb(94, 93, 93)";
            button.style.color = "white";

            editMealsFunctions[i](button.classList);
          }
        }
      );
      daysOfTheWeekLabels[daysOfTheWeekLabels.length - 1].after(button);
    }

    daysOfTheWeekLabels[daysOfTheWeekLabels.length - 1].after(label);
    headerslabelsarray[i];
  }
  //!moving the fetch let the meal planning window load without delay
  const fetchedRecipes = await fetchAllRecipes();

  for (let i = 0; i < fetchedRecipes.length; i++) {
    // recipes.push(fetchedRecipes[i].recipeName);
    if (fetchedRecipes[i].suggestedMeal === "Breakfast") {
      breakfastRecipesList.push(fetchedRecipes[i]);
    } else if (fetchedRecipes[i].suggestedMeal === "Lunch") {
      lunchRecipesList.push(fetchedRecipes[i]);
    } else if (fetchedRecipes[i].suggestedMeal === "Dinner") {
      dinnerRecipesList.push(fetchedRecipes[i]);
    } else if (fetchedRecipes[i].suggestedMeal === "Dessert") {
      dessertRecipesList.push(fetchedRecipes[i]);
    } else if (fetchedRecipes[i].suggestedMeal === "Snack") {
      snacksRecipesList.push(fetchedRecipes[i]);
    }
  }

  for (let i = 0; i < fetchedRecipes.length; i++) {
    // recipes.push(fetchedRecipes[i].recipeName);
    if (fetchedRecipes[i].suggestedMeal !== "Breakfast") {
      breakfastRecipesList.push(fetchedRecipes[i]);
    } else if (fetchedRecipes[i].suggestedMeal !== "Lunch") {
      lunchRecipesList.push(fetchedRecipes[i]);
    } else if (fetchedRecipes[i].suggestedMeal !== "Dinner") {
      dinnerRecipesList.push(fetchedRecipes[i]);
      // } else if (fetchedRecipes[i].suggestedMeal !== "Dessert") {
      //   dessertRecipesList.push(fetchedRecipes[i]);
    } else if (fetchedRecipes[i].suggestedMeal !== "Snack") {
      snacksRecipesList.push(fetchedRecipes[i]);
    }
  }
}

async function checkForExistingIngredient(item) {
  const URL = `${serverURL}/ingredient/find`;

  const reqOptions = {
    method: "POST",
    mode: "cors",
    headers: new Headers({
      "Content-Type": "application/json",
      Authorization: token,
    }),
    body: JSON.stringify({
      ingredientName: item,
      family: sessionStorage.family,
      creator: sessionStorage.email,
    }),
  };

  try {
    const res = await fetch(URL, reqOptions);
    const data = await res.json();

    if (data.message === "Can't Find the Ingredient.") {
      return;
    } else if (data.message === "Found!") {
      // console.log("data.message: ",data.message)
      // console.log("data:", data.data)
      return data.data;
    }
    // return data.message;
  } catch (error) {}
}

async function checkForExistingRecipe(item) {
  const URL = `${serverURL}/recipe/find`;

  const ingredientQuery = {
    recipeName: item,
  };

  const reqOptions = {
    method: "POST",
    mode: "cors",
    headers: new Headers({
      "Content-Type": "application/json",
      Authorization: token,
    }),
    body: JSON.stringify(ingredientQuery),
  };

  try {
    const res = await fetch(URL, reqOptions);
    const data = await res.json();
    return data.message;
  } catch (error) {}
}

async function checkForExistingRecipeIngredient(item) {
  const URL = `${serverURL}/recipeingredient/find${item}`;

  const reqOptions = {
    method: "GET",
    mode: "cors",
    headers: new Headers({
      "Content-Type": "application/json",
      Authorization: token,
    }),
  };

  try {
    const res = await fetch(URL, reqOptions);
    const data = await res.json();
    return data;
  } catch (error) {}
}

async function handleAddRecipeIngredientsToShoppingList() {
  const button = document.getElementById(
    "addRecipeIngredientsToShoppingListBtn"
  );
  button.removeEventListener("click", handleAddRecipeIngredientsToShoppingList);

  setTimeout(() => {
    button.style.backgroundColor = "initial";
    button.style.color = "initial";
    button.textContent = "Add to Shopping List";
    button.addEventListener("click", handleAddRecipeIngredientsToShoppingList);
  }, 6000);

  const ingredientsToPost = [];

  for (let i = 0; i < ingredientCollection.length; i++) {
    if (ingredientCheck[i].children[0].checked === true) {
      ingredientsToPost.push(ingredientCollection[i].textContent);
    }
  }
  await postNewIngredient(ingredientsToPost, ingredientsToPost.length - 1);

  console.log("fetching shopping list data...")
  console.log(shoppingListData)
  shoppingListData = await fetchShoppingList();
  console.log(await fetchShoppingList())
  console.log(shoppingListData)
  
  loadShoppingList();

  console.log("here");
}

async function handleNewRecipeSubmit(e) {
  await e.preventDefault();

  const nameInput = document.getElementById("newRecipeNameInput").value;
  const suggestedMealInput = document.getElementById("suggestedMeal").value;
  const timeInput = document.getElementById("recipeCookTimeInputField").value;
  const temperatureInput = document.getElementById(
    "recipeTempInputField"
  ).value;
  const recipeInstructionsInput = document.getElementById(
    "recipeInstructionsInputField"
  ).value;

  const numberOfServingsInput = document.getElementById(
    "numberOfServingsInputField"
  ).value;

  const newIngredients = document.getElementsByClassName("newIngredients");
  const newIngredientAmtInputs = document.getElementsByClassName(
    "newIngredientAmtInputs"
  );
  const measurementUnit = document.getElementsByClassName("measurementUnit");
  const newIngredientCalorieInputs = document.getElementsByClassName(
    "newIngredientCalorieInputs"
  );

  let newRecipe = {};

  newRecipe.recipeName = nameInput;
  newRecipe.suggestedMeal = suggestedMealInput;
  newRecipe.time = timeInput;
  newRecipe.temperature = temperatureInput;
  newRecipe.ingredients = [];
  newRecipe.numberOfServings = numberOfServingsInput;

  newRecipe.instructions = [recipeInstructionsInput];

  for (let i = 1; i < newIngredients.length; i++) {
    const newIngredient = {};
    newIngredient.name = newIngredients[i].textContent;
    newIngredient.amount = newIngredientAmtInputs[i].textContent;
    newIngredient.measurementUnit = measurementUnit[i].textContent;
    newIngredient.newIngredientCalorieInput =
      newIngredientCalorieInputs[i].textContent;
    newRecipe.ingredients.push(newIngredient);
  }

  const recipeSteps = document.getElementsByClassName("recipeSteps");
  for (let i = 0; i < recipeSteps.length; i++) {
    if (recipeSteps[i].value.trim().length > 0) {
      newRecipe.instructions.push(recipeSteps[i].value);
    }
  }

  if ((await checkForExistingRecipe(nameInput)) === "Found!") {
    return;
  }
  
  await postNewRecipe(newRecipe);
  recipeListData = await fetchRecipeList();
  await populateRecipeList();
}

async function handleRemovingShoppingListItems() {
  const shoppingListCheckBoxes = document.getElementsByClassName(
    "shoppingListCheckBoxes"
  );
  const itemsToDelete = document.getElementsByClassName("item");

  for (let i = 0; i < shoppingListCheckBoxes.length; i++) {
    if (shoppingListCheckBoxes[i].checked === true) {
      const URL = `${serverURL}/ingredient/delete/`;

      let delItem = {
        ingredientName: itemsToDelete[i].textContent,
        family: sessionStorage.family,
      };
      try {
        const res = await fetch(URL, {
          method: "DELETE",
          mode: "cors",
          headers: {
            "Content-Type": "application/json",
            Authorization: token,
          },
          body: JSON.stringify(delItem),
        });
        const data = await res.json();
        if (data.message === "The ingredient was successfully deleted!") {
        }
      } catch (error) {
        console.log(error);
      }
    }
  }
  shoppingListData = await fetchShoppingList();
  loadShoppingList()
}

async function getKnownRecipeIngredients(ingredientInputForm) {
  console.log("getting known recipe ingredients:", ingredientInputForm);
  const URL = `${serverURL}/recipeingredient/`;

  const res = await fetch(URL, {
    method: "GET",
    mode: "cors",
    headers: {
      "Content-Type": "application/json",
      Authorization: token,
    },
  });

  const data = await res.json();

  const fetchedIngredients = data.getAllRecipeIngredients;

  if (fetchedIngredients) {
    console.log("fetchedIngredients:", fetchedIngredients);
    let ingredientDataList = document.createElement("datalist");
    ingredientDataList.id = "ingredientOptions";
    const newIngredientInput = document.createElement("input");
    newIngredientInput.className = "newIngredients";
    newIngredientInput.id = "newIngredientInput";
    newIngredientInput.setAttribute("list", "ingredientOptions");
    newIngredientInput.placeholder = "Name";
    newIngredientInput.required = true;

    fetchedIngredients.map((listing) => {
      const ingredientOption = document.createElement("option");
      ingredientOption.value = listing.recipeIngredientName;
      ingredientDataList.append(ingredientOption);
    });
    document.getElementById("ingredientOptions")?.remove();
    ingredientInputForm.append(ingredientDataList);
  }
}

async function fetchAllRecipes() {
  const output = [];
  const URL = `${serverURL}/recipe/`;
  try {
    const res = await fetch(URL, {
      method: "GET",
      mode: "cors",
      headers: {
        "Content-Type": "application/json",
        Authorization: token,
      },
    });
    const data = await res.json();
    for (let i = 0; i < data.getAllRecipes.length; i++) {
      output.push(data.getAllRecipes[i]);
      // console.log(data.getAllRecipes[i])
    }
    return output;
  } catch (error) {
    output.push("no recipes");
    console.log(error);
    return output;
  }
}

async function fetchRecipeList() {
  console.log("fetching recipe list...");
  const URL = `${serverURL}/recipe`;

  try {
    const res = await fetch(URL, {
      method: "GET",
      mode: "cors",
      headers: {
        "Content-Type": "application/json",
        Authorization: token,
      },
    });
    const data = await res.json();
    recipeListData = data;
    return recipeListData;
  } catch (error) {
    console.log(error);
  }
}

async function fetchShoppingList() {
  console.log("fetching shopping list...");

  const URL = `${serverURL}/ingredient/getallingredients${sessionStorage.family}`;
  try {
    const res = await fetch(URL, {
      method: "GET",
      mode: "cors",
      headers: {
        "Content-Type": "application/json",
        Authorization: token,
      },
    });
    const data = await res.json();
    const shoppingListData = data;
    return shoppingListData;
  } catch (error) {
    console.log(error);
  }
}

async function handlePostNewItem() {
  const existingListItems = document.getElementsByClassName("item");
  let newItem = document.getElementById("itemInput").value;

  for (let i = 0; i < existingListItems.length; i++) {
    if (
      newItem.toLowerCase() == existingListItems[i].textContent.toLowerCase()
    ) {
      console.log("match");
      document.getElementById("itemInput").textContent = "";
      return;
    }
  }

  const qty = 1;
  if (newItem.length > 0) {
    await postNewIngredient(newItem, qty);
    shoppingListData = await fetchShoppingList();
    loadShoppingList()
  }
}

async function populateRecipeList() {
  console.log("checking recipelistdata...");
  if (!recipeListData) {
    recipeListData = await fetchRecipeList();
  } 

  const selections = document.getElementById("selections");

  if (selections) {
    selections.innerHTML = "";
  }

  const recipeListTable = document.createElement("table");
  recipeListTable.id = "recipeListTable";

  const recipeListTableBody = document.createElement("tbody");
  recipeListTableBody.id = "recipeListTableBody";
  recipeListTable.append(recipeListTableBody);

  if (selections) {
    selections.append(recipeListTable);
    const addRecipeBtn = document.createElement("button");
    addRecipeBtn.id = "addRecipe";
    addRecipeBtn.className = "button";
    addRecipeBtn.textContent = "New Recipe";

    const addRecipeContainer = document.createElement("div");
    addRecipeContainer.id = "addRecipeContainer";

    selections.append(addRecipeContainer);
    addRecipeContainer.append(addRecipeBtn);
    addRecipeBtn.addEventListener("click", handleNewRecipeClick);

    const deleteRecipeBtn = document.createElement("button");
    deleteRecipeBtn.id = "deleteRecipe";
    deleteRecipeBtn.className = "button";
    deleteRecipeBtn.textContent = "Delete Recipe";
    addRecipeContainer.append(deleteRecipeBtn);
    deleteRecipeBtn.addEventListener("click", handleDeleteRecipe);

    async function handleDeleteRecipe(e) {
      e.preventDefault();
      const recipeCheckboxes =
        document.getElementsByClassName("recipeCheckbox");
      const recipeName = document.getElementsByClassName("recipeName");

      for (let i = 0; i < recipeCheckboxes.length; i++) {
        if (recipeCheckboxes[i].checked === true) {
          console.log(recipeCheckboxes[i].checked);
          console.log(recipeName[i].textContent);
          const URL = `${serverURL}/recipe/delete/`;
          let delItem = {};
          delItem.recipeName = recipeName[i].textContent;
          try {
            const res = await fetch(URL, {
              method: "DELETE",
              mode: "cors",
              headers: {
                "Content-Type": "application/json",
                Authorization: token,
              },
              body: JSON.stringify(delItem),
            });
            const data = await res.json();
            if (data.message === "The recipe was successfully deleted!") {
              console.log("the recipe was deleted");
              recipeListData = await fetchRecipeList();
              await populateRecipeList();
              document.getElementsByClassName("mainContent")?.remove();
            }
          } catch (error) {
            console.log(error);
          }
        }
      }
    }

    async function handleNewRecipeClick() {
      document.getElementById("newIngredientSection")?.remove();

      const mainContent = document.getElementsByClassName("mainContent");

      for (let i = mainContent.length; i > 0; i--) {
        mainContent[i - 1].remove();
      }

      document
        .getElementById("addRecipeIngredientsToShoppingListBtn")
        ?.remove();
      document.getElementById("newIngredientSection")?.remove();
      const ingredientsInformation = [];
      // removeNewRecipeInputFields();

      const ingredientInputForm = document.createElement("div");
      ingredientInputForm.id = "ingredientInputForm";

      const newRecipeNameInput = document.createElement("input");
      newRecipeNameInput.type = "text";
      newRecipeNameInput.id = "newRecipeNameInput";
      newRecipeNameInput.placeholder = "New Recipe Name";
      newRecipeNameInput.required = true;

      const newIngredientInput = document.createElement("input");
      newIngredientInput.className = "newIngredients";
      newIngredientInput.id = "newIngredientInput";
      newIngredientInput.setAttribute("list", "ingredientOptions");
      newIngredientInput.placeholder = "Name";
      newIngredientInput.required = true;
      newIngredientInput.addEventListener(
        "change",
        handleFillExistingIngredientData
      );

      //! Monitors new recipe ingredient information fill in (calories, measurement type, etc.)

      //todo check into this later...
      async function handleFillExistingIngredientData() {
        console.log("filling existing ingredients...");
        console.log(newIngredientInput.value);
        const URL = `${serverURL}/recipeingredient/find${newIngredientInput.value}`;
        const res = await fetch(URL, {
          method: "GET",
          mode: "cors",
          headers: {
            "Content-Type": "application/json",
            Authorization: token,
          },
        });
        const data = await res.json();
        console.log("existing", data);
      }

      const newIngredientMeasure = document.createElement("input");
      newIngredientMeasure.className = "newIngredientMeasure";

      const newIngredientFieldBtn = document.createElement("button");
      newIngredientFieldBtn.id = "newIngredientInputFieldBtn";
      newIngredientFieldBtn.classList = ("button", "newIngredientFieldBtns");
      newIngredientFieldBtn.addEventListener(
        "click",
        handleIngredientInputSubmit
      );

      async function handleIngredientInputSubmit(e) {
        e.preventDefault();
        const ingredientNameInput =
          document.getElementById("newIngredientInput");
        const ingredientAmtInput = document.getElementById(
          "newIngredientAmtInput"
        );
        const measurementUnitInput = document.getElementById(
          "measurementUnitInput"
        );
        const newIngredientCalorieInput = document.getElementById(
          "newIngredientCalorieInput"
        );
        if (newIngredientCalorieInput.value === "?") {
          return;
        }
        if (
          ingredientNameInput.value &&
          ingredientAmtInput.value &&
          measurementUnitInput.value &&
          newIngredientCalorieInput.value
        ) {
          convertMeasurementUnitsToFlOz(
            measurementUnitInput,
            ingredientAmtInput,
            newIngredientCalorieInput
          );

          //todo push this information to the ingredients array that will be sent to the back end when the recipe is actually submitted
          const ingredientObject = {};
          const { measurementUnitToSend, caloriesToSend } =
            convertMeasurementUnitsToFlOz(
              measurementUnitInput,
              ingredientAmtInput,
              newIngredientCalorieInput
            );

          ingredientObject.ingredientName = ingredientNameInput.value;
          ingredientObject.ingredientAmt = ingredientAmtInput.value;
          ingredientObject.measurementUnitInput = measurementUnitToSend;
          ingredientObject.newIngredientCalorieInput = caloriesToSend;

          console.log("measurementUnitToSend: ", measurementUnitToSend);
          if (measurementUnitToSend === "whole") {
            ingredientObject.whole = true;
            ingredientObject.newIngredientCalorieInput = caloriesToSend;
          } else if (measurementUnitToSend === "half") {
            ingredientObject.whole = true;
            ingredientObject.newIngredientCalorieInput = caloriesToSend * 2;
          } else if (measurementUnitToSend === "quarter") {
            ingredientObject.whole = true;
            ingredientObject.newIngredientCalorieInput = caloriesToSend * 4;
          } else {
            ingredientObject.whole = false;
          }

          console.log("ingredientObject.whole: ", ingredientObject.whole);
          ingredientsInformation.push(ingredientObject);

          const URL = `${serverURL}/recipeingredient/storeRecipeIngredient`;

          //todo insert an alternate fetch to patch an update to an existing ingredient, rather than posting another one

          try {
            const res = await fetch(URL, {
              method: "POST",
              mode: "cors",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(ingredientObject),
              Authorization: token,
            });
            const data = await res.json();
            if (data.message === "Success! RecipeIngredient Saved!") {
              console.log("Success! RecipeIngredient Saved!");
            }
          } catch (error) {
            console.log(error.message);
          }

          const submittedIngredient = document.createElement("div");
          submittedIngredient.textContent = ingredientNameInput.value;
          submittedIngredient.className = "newIngredients";

          const submittedIngredientAmt = document.createElement("div");
          submittedIngredientAmt.textContent = ingredientAmtInput.value;
          submittedIngredientAmt.className = "newIngredientAmtInputs";

          const submittedMeasurementUnit = document.createElement("div");
          submittedMeasurementUnit.textContent = measurementUnit.value;
          submittedMeasurementUnit.className = "measurementUnit";

          const submittedIngredientCals = document.createElement("div");
          submittedIngredientCals.textContent =
            newIngredientCalorieInputs.value;
          submittedIngredientCals.className = "newIngredientCalorieInputs";
          submittedIngredientCals.setAttribute("number", true);

          const editBtn = document.createElement("button");
          editBtn.id = "recipeIngredientEdit";
          editBtn.className = "newIngredientFieldBtns";
          editBtn.textContent = "Edit";
          editBtn.addEventListener("click", handleEditRecipeIngredient);
          editBtn.removeEventListener("click", handleEditRecipeIngredient);
          newIngredientGrid.append(
            submittedIngredient,
            submittedIngredientAmt,
            submittedMeasurementUnit,
            submittedIngredientCals,
            editBtn
          );

          function handleEditRecipeIngredient() {
            alert(
              "This will be used to switch the line to inputs, and the text content to the previous values"
            );
          }
          ingredientNameInput.value = "";
          ingredientAmtInput.value = "";
          measurementUnitInput.value = "";
          newIngredientCalorieInput.value = "";
        } else {
          console.log("missing input");
        }
        await getKnownRecipeIngredients(ingredientInputForm);
      }

      function convertMeasurementUnitsToFlOz(
        measurementUnitInput,
        ingredientAmtInput,
        newIngredientCalorieInput
      ) {
        console.log("measurementUnitInput.value: ", measurementUnitInput.value);
        const conversionObject = {
          gal: 128,
          qt: 32,
          pint: 16,
          cup: 8,
          tbsp: 0.5,
          tsp: 1.6666667,
          "fl oz": 1,
        };

        if (conversionObject[measurementUnitInput.value]) {
          const convertedUnits =
            conversionObject[measurementUnitInput.value] *
            +ingredientAmtInput.value;

          const convertedCalories =
            +newIngredientCalorieInputs.value / convertedUnits;

          return {
            caloriesToSend: convertedCalories,
            measurementUnitToSend: "fl oz",
          };
        } else {
          return {
            caloriesToSend: +newIngredientCalorieInput.value,
            measurementUnitToSend: measurementUnitInput.value,
          };
        }
      }

      newIngredientFieldBtn.textContent = "Add ";

      const recipeCookTimeInputField = document.createElement("input");
      recipeCookTimeInputField.type = "string";
      recipeCookTimeInputField.id = "recipeCookTimeInputField";
      recipeCookTimeInputField.placeholder = "Time to Make";

      const recipeTempInputField = document.createElement("input");
      recipeTempInputField.type = "string";
      recipeTempInputField.id = "recipeTempInputField";
      recipeTempInputField.placeholder = "Temperature";

      const numOfServingsRow = document.createElement("div");
      const numOfServingsLabel = document.createElement("div");
      numOfServingsLabel.id = "numOfServingsLabel";
      numOfServingsLabel.textContent = "Servings: ";

      const numberOfServingsInputField = document.createElement("input");
      numberOfServingsInputField.type = "number";
      numberOfServingsInputField.id = "numberOfServingsInputField";
      numberOfServingsInputField.placeholder = "Servings";
      numberOfServingsInputField.min = "1";
      numberOfServingsInputField.value = 1;

      numOfServingsRow.append(numOfServingsLabel, numberOfServingsInputField);

      const recipeInstructionsInputField = document.createElement("textarea");
      recipeInstructionsInputField.id = "recipeInstructionsInputField";
      recipeInstructionsInputField.placeholder = "Description";
      if (document.getElementById("ingredientInputForm")) {
        document
          .getElementById("addRecipeIngredientsToShoppingListBtn")
          ?.remove();
      }

      const recipeStepRow = document.createElement("div");
      recipeStepRow.className = "recipeStepRows";

      const recipeStepLabel = document.createElement("div");
      recipeStepLabel.className = "recipeStepLabels";
      recipeStepLabel.textContent = "Step 1: ";

      const recipeStep = document.createElement("input");
      recipeStep.placeholder = "step:";
      recipeStep.className = "recipeSteps";
      recipeStep.id = "step_1";

      const submitRecipeStepBtn = document.createElement("button");
      submitRecipeStepBtn.className = "submitRecipeStepBtn";
      submitRecipeStepBtn.textContent = "+";
      submitRecipeStepBtn.addEventListener("click", handleSubmitRecipeStep);

      recipeStepRow.append(recipeStepLabel, recipeStep, submitRecipeStepBtn);

      function handleSubmitRecipeStep() {
        const oldBtns = document.getElementsByClassName("submitRecipeStepBtn");
        oldBtns[oldBtns.length - 1].removeEventListener(
          "click",
          handleSubmitRecipeStep
        );
        oldBtns[oldBtns.length - 1].remove();

        const recipeStepRow = document.createElement("div");
        recipeStepRow.className = "recipeStepRows";

        const recipeStepLabel = document.createElement("div");
        recipeStepLabel.className = "recipeStepLabels";

        const recipeStep = document.createElement("input");
        recipeStep.placeholder = "step:";
        recipeStep.className = "recipeSteps";

        console.log(
          "recipeStepRows: ",
          document.getElementsByClassName("recipeStepRows")
        );

        const submitRecipeStepBtn = document.createElement("button");
        submitRecipeStepBtn.className = "submitRecipeStepBtn";
        submitRecipeStepBtn.textContent = "+";
        submitRecipeStepBtn.addEventListener("click", handleSubmitRecipeStep);

        recipeStepRow.append(recipeStepLabel, recipeStep, submitRecipeStepBtn);

        const newRecipeBtn = document.getElementById("newRecipeInputBtn");
        // console.log(newRecipeBtn.textContent);

        newRecipeBtn.before(recipeStepRow);
        const recipeStepLabels =
          document.getElementsByClassName("recipeStepLabels");

        for (let i = 0; i < recipeStepLabels.length; i++) {
          console.log("recipeStepLabel: ", recipeStepLabel);
          recipeStepLabels[i].id = `step_${i + 1}`;
          recipeStepLabels[i].textContent = `Step ${i + 1}:`;
        }
      }

      const measurementUnit = document.createElement("select");
      measurementUnit.setAttribute("list", "unitOptions");
      measurementUnit.className = "measurementUnit";
      measurementUnit.id = "measurementUnitInput"; //todo - remove this when adding a new ingredient line
      measurementUnit.placeholder = "unit";
      measurementUnit.addEventListener("change", handleMeasurementUnitChange);

      async function handleMeasurementUnitChange() {
        console.log("here");
        const data = await checkForExistingRecipeIngredient(
          newIngredientInput.value
        );
        console.log("data:", data);
        const body = data.findIngredient;

        // console.log("body: ", body);

        console.log("body:", body);
        if (body.whole === false) {
          console.log("bodyfalse");
          if (conversionObject[measurementUnit.value]) {
            const newValue =
              body.calories * conversionObject[measurementUnit.value];
            newIngredientCalorieInputs.value =
              +newValue.toFixed(0) * +newIngredientAmtInputs.value;
          }
        } else if (body.whole === true) {
          console.log("body-true");
        }
        if (measurementUnit.value === "whole") {
          newIngredientCalorieInputs.value = body.calories.toFixed(0);
        } else if (measurementUnit.value === "half") {
          newIngredientCalorieInputs.value = (body.calories * 0.5).toFixed(0);
        } else if (measurementUnit.value === "quarter") {
          newIngredientCalorieInputs.value = (body.calories * 0.25).toFixed(0);
        } else {
          newIngredientCalorieInputs.value = "?";
        }
      }

      const unitOptions = [
        "tsp",
        "tbsp",
        "fl oz",
        "cup",
        "pint",
        "qt",
        "gal",
        "whole",
        "half",
        "quarter",
      ];

      unitOptions.map((unit) => {
        const option = document.createElement("option");
        option.value = unit;
        option.textContent = unit;
        measurementUnit.append(option);
      });

      let ingredientDataList = document.createElement("datalist");
      ingredientDataList.id = "ingredientOptions";

      const unitOption = document.createElement("option");

      const newRecipeInputBtn = document.createElement("input");
      newRecipeInputBtn.type = "submit";
      newRecipeInputBtn.id = "newRecipeInputBtn";
      newRecipeInputBtn.addEventListener("click", handleNewRecipeSubmit);

      const newIngredientAmtInputs = document.createElement("input");
      newIngredientAmtInputs.placeholder = "qty";
      newIngredientAmtInputs.type = "number";
      newIngredientAmtInputs.className = "newIngredientAmtInputs";
      newIngredientAmtInputs.min = 0;
      newIngredientAmtInputs.id = "newIngredientAmtInput";
      newIngredientAmtInputs.addEventListener(
        "change",
        handleMeasurementUnitChange
      );

      const newIngredientCalorieInputs = document.createElement("input");
      newIngredientCalorieInputs.className = "newIngredientCalorieInputs";
      newIngredientCalorieInputs.placeholder = "Cal";
      newIngredientCalorieInputs.id = "newIngredientCalorieInput";
      newIngredientCalorieInputs.setAttribute("number", true);

      const newIngredientGrid = document.createElement("div");
      newIngredientGrid.id = "newIngredientGrid";

      const newIngredientSection = document.createElement("div");
      newIngredientSection.id = "newIngredientSection";

      newIngredientSection.append(
        newIngredientGrid,
        recipeInstructionsInputField,
        recipeStepRow,
        newRecipeInputBtn
      );

      document.getElementById("recipesContainer").after(newIngredientSection);

      const newIngredientContainer = document.createElement("tr");
      newIngredientContainer.id = "newIngredientContainer";
      newIngredientContainer.className = "newIngredientContainers";

      newIngredientGrid.append(
        newIngredientInput,
        newIngredientAmtInputs,
        measurementUnit,
        newIngredientCalorieInputs,
        newIngredientFieldBtn
      );

      ingredientInputForm.append(unitOption, newRecipeNameInput);

      const timeAndTemp = document.createElement("div");
      timeAndTemp.id = "timeAndTemp";
      timeAndTemp.append(
        recipeCookTimeInputField,
        recipeTempInputField,
        numOfServingsRow
      );

      const suggestedMeal = document.createElement("select");
      suggestedMeal.id = "suggestedMeal";

      const breakfastOption = document.createElement("option");
      breakfastOption.value = "Breakfast";
      breakfastOption.textContent = "Breakfast";

      const lunchOption = document.createElement("option");
      lunchOption.value = "Lunch";
      lunchOption.textContent = "Lunch";

      const dinnerOption = document.createElement("option");
      dinnerOption.value = "Dinner";
      dinnerOption.textContent = "Dinner";

      const snackOption = document.createElement("option");
      snackOption.value = "Snack";
      snackOption.textContent = "Snack";

      suggestedMeal.append(
        breakfastOption,
        lunchOption,
        dinnerOption,
        snackOption
      );

      console.log(suggestedMeal);

      document
        .getElementById("newIngredientGrid")
        .before(ingredientInputForm, suggestedMeal, timeAndTemp);
    }
  }

  recipeListData.getAllRecipes.map((recipe) => {
    const recipeCheck = document.createElement("td");
    recipeCheck.className = "recipeCheck";

    const recipeCheckbox = document.createElement("input");
    recipeCheckbox.type = "checkbox";
    recipeCheckbox.className = "recipeCheckbox";
    recipeCheck.append(recipeCheckbox);

    const recipeName = document.createElement("td");
    recipeName.className = "recipeName";
    recipeName.value = recipe.recipeName;
    recipeName.textContent = recipe.recipeName;
    recipeName.style.textDecoration = "none";
    recipeName.addEventListener("click", handleRecipeClick);

    const showRecipeBtn = document.createElement("button");
    showRecipeBtn.className = "button";
    showRecipeBtn.addEventListener("click", handleShowRecipeClick);
    showRecipeBtn.textContent = "View";

    const recipeGroup = document.createElement("tr");
    recipeGroup.className = "recipeGroup";
    recipeGroup.append(recipeCheck, recipeName, showRecipeBtn);

    recipeListTableBody.append(recipeGroup);

    async function handleShowRecipeClick() {
      console.log("creatingRecipeWindow...");
      createRecipeWindow();

      const data = async () => {
        const URL = `${serverURL}/recipe/find`;

        const recipeQuery = {
          recipeName: recipe.recipeName,
        };

        const reqOptions = {
          method: "POST",
          mode: "cors",
          headers: new Headers({
            "Content-Type": "application/json",
            Authorization: token,
          }),
          body: JSON.stringify(recipeQuery),
        };

        try {
          const res = await fetch(URL, reqOptions);
          const data = await res.json();
          return data.findRecipe;
        } catch (error) {}
      };

      const recipeInfo = await data();

      const recipeWindow = document.getElementById("recipeWindow");
      recipeWindow.style.display = "block";
      const recipeWindowContent = document.getElementById(
        "recipeWindowContent"
      );
      const recipeButtonContainer = document.createElement("div");
      recipeButtonContainer.id = "recipeButtonContainer";

      const closeRecipeWindowBtn = document.createElement("button");
      closeRecipeWindowBtn.id = "closeRecipeWindowBtn";
      closeRecipeWindowBtn.textContent = "Close";

      closeRecipeWindowBtn.addEventListener("click", handleCloseRecipeWindow);

      recipeButtonContainer.append(closeRecipeWindowBtn);

      recipeWindowContent.style.height = "fit-content";
      recipeWindowContent.style.minHeight = "95vh";
      recipeWindowContent.style.width = "93vw";
      recipeWindowContent.style.visibility = "visible";

      const recipeText = document.getElementById("recipeText");
      recipeText.innerHTML = "";

      const recipeName = document.createElement("h2");
      recipeName.textContent = recipeInfo.recipeName;

      const temp = document.createElement("li");
      temp.textContent = `Temp: ${recipeInfo.temperature}`;
      temp.className = "temperatureDivs";

      const time = document.createElement("li");
      time.textContent = `Time: ${recipeInfo.time}`;
      time.className = "timeDivs";

      const listContainer = document.createElement("div");
      listContainer.id = "listContainer";

      const column_one = document.createElement("div");
      column_one.className = "recipeIngredientsColumns";
      column_one.id = "recipeIngredientsColumn_1";

      const column_two = document.createElement("div");
      column_two.className = "recipeIngredientsColumns";
      column_two.id = "recipeIngredientsColumn_2";

      const ingredients = recipeInfo.ingredients;

      for (let i = 0; i < ingredients.length; i += 2) {
        const firstDiv = document.createElement("div");
        firstDiv.textContent = `${ingredients[i].amount} ${ingredients[i].measurementUnit} ${ingredients[i].name}`;

        const secondDiv = document.createElement("div");
        secondDiv.textContent = `${ingredients[i + 1]?.amount} ${
          ingredients[i + 1]?.measurementUnit
        } ${ingredients[i + 1]?.name}`;

        column_one.append(firstDiv);
        if (ingredients[i + 1]) {
          column_two.append(secondDiv);
        }
      }
      listContainer.append(column_one, column_two);

      const instructionsContainer = document.createElement("div");
      instructionsContainer.id = "instructionsContainer";

      const currentRecipeInstructions = recipeInfo.instructions;

      const currentRecipeDescription = recipeInfo.instructions[0];

      const instructions = document.createElement("div");
      instructions.className = "instructionsText";
      instructions.id = "currentRecipeDescription";
      instructions.textContent = currentRecipeDescription;
      instructionsContainer.append(instructions);

      for (let i = 1; i < currentRecipeInstructions.length; i++) {
        const instructionsRow = document.createElement("div");
        instructionsRow.className = "instructionsRows";

        const instructionsCheckbox = document.createElement("input");
        instructionsCheckbox.type = "checkbox";
        instructionsCheckbox.className = "instructionsCheckboxes";
        instructionsCheckbox.addEventListener(
          "click",
          handleInstructionsStepClick
        );

        const instructions = document.createElement("div");
        instructions.className = "instructionsText";
        instructions.textContent = `Step ${i}: ${currentRecipeInstructions[i]}`;
        instructions.style.textDecoration = "none";
        instructionsRow.append(instructionsCheckbox, instructions);

        instructionsContainer.append(instructionsRow);

        function handleInstructionsStepClick() {
          if (instructions.style.textDecoration === "line-through") {
            instructions.style.textDecoration = "none";
            instructions.style.color = "white";
          } else if (instructions.style.textDecoration === "none") {
            instructions.style.textDecoration = "line-through";
            instructions.style.color = "black";
          }
        }
      }

      let totalCaloriesAmt = 0;

      for (let i = 0; i < ingredients.length; i++) {
        totalCaloriesAmt += Number(ingredients[i].newIngredientCalorieInput);
      }

      const totalCalories = document.createElement("li");
      totalCalories.id = "totalCalories";
      totalCalories.textContent = `Total Calories: ${totalCaloriesAmt.toLocaleString()}`;

      const noOfServingsInput = document.createElement("input");
      noOfServingsInput.id = "noOfServingsInput";
      noOfServingsInput.value = recipeInfo.numberOfServings;
      noOfServingsInput.type = "number";
      noOfServingsInput.min = "1";
      noOfServingsInput.addEventListener("change", handleNoOfServingsChange);

      function handleNoOfServingsChange() {
        if (noOfServingsInput.value < 1) {
          noOfServingsInput.value = 1;
          return;
        }
        const calsPerServing = (
          totalCaloriesAmt / noOfServingsInput.value
        ).toFixed(0);
        document.getElementById(
          "caloriesPerServing"
        ).textContent = `Calories Per Serving: ${calsPerServing}`;
      }

      const caloriesPerServing = document.createElement("li");
      caloriesPerServing.id = "caloriesPerServing";

      const calsPerServing = (
        totalCaloriesAmt / noOfServingsInput.value
      ).toFixed(0);
      caloriesPerServing.textContent = `Calories Per Serving: ${calsPerServing}`;

      const numberOfServings = document.createElement("li");
      numberOfServings.id = "numberOfServings";
      numberOfServings.textContent = "Number of servings: ";
      numberOfServings.append(noOfServingsInput);

      const generalRecipeInfo = document.createElement("ul");
      generalRecipeInfo.id = "generalRecipeInfo";
      generalRecipeInfo.append(
        temp,
        time,
        totalCalories,
        numberOfServings,
        caloriesPerServing
      );

      instructionsContainer.append(recipeButtonContainer);
      recipeText.append(recipeName, generalRecipeInfo, listContainer);
      document
        .getElementById("recipeWindowContent")
        .append(instructionsContainer);
    }

    recipeCheckbox.addEventListener("click", handleRecipeCheckboxClick);

    function handleCloseRecipeWindow() {
      document.getElementById("instructionsContainer")?.remove();
      document.getElementById("recipeWindowContent")?.remove();
      recipeWindow.remove();
    }

    function handleRecipeCheckboxClick() {
      if (recipeName.style.textDecoration === "line-through") {
        recipeName.style.textDecoration = "none";
      } else if (recipeName.style.textDecoration === "none") {
        recipeName.style.textDecoration = "line-through";
      }
    }

    function handleRecipeClick() {
      removeRecipeIngredients();
      document.getElementById("recipeInstructionsInputField")?.remove();
      document.getElementById("newIngredientGrid")?.remove();
      document
        .getElementById("addRecipeIngredientsToShoppingListBtnContainer")
        ?.remove();
      document.getElementById("newRecipeInputBtn")?.remove();
      document.getElementById("ingredientInputForm")?.remove();
      document.getElementById("timeAndTemp")?.remove();

      const recipeStepRows = document.getElementsByClassName("recipeStepRows");

      for (let i = recipeStepRows.length - 1; i >= 0; i--) {
        recipeStepRows[i].remove();
      }

      const checkboxHeader = document.createElement("th");
      checkboxHeader.textContent = "Select";

      const ingredientHeader = document.createElement("th");
      ingredientHeader.textContent = "Ingredient";

      recipe.ingredients.map((item) => {
        const mainContent = document.createElement("tr");
        mainContent.className = "mainContent";

        const check = document.createElement("td");
        check.className = "ingredientCheck";

        const checkBox = document.createElement("input");
        checkBox.type = "checkbox";
        checkBox.checked = "true";
        check.append(checkBox);

        const ingredient = document.createElement("td");
        ingredient.className = "ingredient";
        ingredient.textContent = item.name;
        ingredient.style.textDecoration = "none";
        mainContent.append(check, ingredient);
        document.getElementById("recipesContainer").after(mainContent);

        checkBox.addEventListener("click", handleIngredientListCheckboxClick);

        function handleIngredientListCheckboxClick() {
          if (ingredient.style.textDecoration === "line-through") {
            ingredient.style.textDecoration = "none";
          } else if (ingredient.style.textDecoration === "none") {
            ingredient.style.textDecoration = "line-through";
          }
        }
      });

      const addRecipeIngredientsToShoppingListBtnContainer =
        document.createElement("div");
      addRecipeIngredientsToShoppingListBtnContainer.id =
        "addRecipeIngredientsToShoppingListBtnContainer";

      const addRecipeIngredientsToShoppingListBtn =
        document.createElement("button");
      addRecipeIngredientsToShoppingListBtn.id =
        "addRecipeIngredientsToShoppingListBtn";
      addRecipeIngredientsToShoppingListBtn.className = "button";
      addRecipeIngredientsToShoppingListBtn.textContent =
        "Add to Shopping List";
      addRecipeIngredientsToShoppingListBtn.addEventListener(
        "click",
        handleAddRecipeIngredientsToShoppingList
      );

      if (document.getElementById("addRecipeIngredientsToShoppingListBtn")) {
        document
          .getElementById("addRecipeIngredientsToShoppingListBtn")
          .remove();
        document
          .getElementById("addRecipeIngredientsToShoppingListBtnContainer")
          .remove();
      }
      document;

      document
        .getElementsByClassName("mainContent")
        [document.getElementsByClassName("mainContent").length - 1].after(
          addRecipeIngredientsToShoppingListBtnContainer
        );
      document
        .getElementById("addRecipeIngredientsToShoppingListBtnContainer")
        .append(addRecipeIngredientsToShoppingListBtn);
    }
  });
}

async function postNewIngredient(items, qty) {
  console.log("posting new ingredient...");
  const URL = `${serverURL}/ingredient/storeIngredient`;
  if (typeof items === "string") {
    items = [items];
  }
  const ingredientCheck = await checkForExistingIngredient(items);

  if (ingredientCheck !== undefined) {
    if (ingredientCheck !== undefined) {
      if (ingredientCheck.length > 0) {
        for (let i = 0; i < ingredientCheck.length; i++) {
          items.splice(items.indexOf(ingredientCheck[i].ingredientName), 1);
        }
      }
      if (items.length === 0) {
        return;
      }
    }
  }
  try {
    const newIngredient = {
      ingredientName: items,
      qty: qty,
      recipe: "",
      creator: sessionStorage.email,
      family: sessionStorage.family,
    };

    const res = await fetch(URL, {
      method: "POST",
      mode: "cors",
      headers: {
        "Content-Type": "application/json",
        Authorization: token,
      },
      body: JSON.stringify(newIngredient),
    });
  } catch (error) {
    // console.log(error);
  }
  await fetchShoppingList();
}

async function loadShoppingList() {
  console.log("loading shopping list...");
  console.log(shoppingListData)
  //todo - rename this function to remove menus or something more accurate
  selectAllFlag = false;
  removeRecipeIngredients();
  document
    .getElementById("addRecipeIngredientsToShoppingListBtnContainer")
    ?.remove();
  document.getElementById("newIngredientSection")?.remove();

  //todo - look over this section for mistakes (coding distracted)
  createShoppingListSection();
  console.log("here");

  console.log("shoppingListData: ", shoppingListData);
  if (!shoppingListData) {
    shoppingListData = await fetchShoppingList();
  } else {
    if (shoppingListData) {
      console.log("filling menus...");
      fillMenus(shoppingListData);
    } else {
      console.log("waiting for shoppinglist data...");
    }
  }
}

async function loadRecipesList() {
  console.log("fetched recipes list...");
  console.log(recipeListData);
  removeRecipeIngredients();
  createRecipesContainer();
  await populateRecipeList();
  // fetchShoppingList();
}

async function postNewRecipe(newRecipeInformation) {
  const {
    ingredients,
    instructions,
    recipeName,
    suggestedMeal,
    temperature,
    time,
    numberOfServings,
    creator,
    family,
  } = newRecipeInformation;

  console.log("newRecipeInformation: ", newRecipeInformation);
  const URL = `${serverURL}/recipe/storeRecipe`;

  if ((await checkForExistingRecipe(recipeName)) === "Found!") {
    return console.log("it's here");
  } else {
    try {
      const newRecipe = {
        recipeName: recipeName,
        suggestedMeal: suggestedMeal,
        time: time,
        temperature: temperature,
        ingredients: ingredients,
        instructions: instructions,
        numberOfServings: numberOfServings,
        creator: sessionStorage.email,
        family: sessionStorage.family,
      };

      await fetch(URL, {
        method: "POST",
        mode: "cors",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
        body: JSON.stringify(newRecipe),
      });
      removeExistingMenus();
      loadRecipesList();
    } catch (error) {
      console.log(error);
    }
  }
}

async function findWeeklyMeals(date) {
  const url = `${serverURL}/weeklyplanning/findweek/${date}`;

  const reqOptions = {
    method: "GET",
    mode: "cors",
    headers: new Headers({
      "Content-Type": "application/json",
      Authorization: token,
    }),
  };

  try {
    const res = await fetch(url, reqOptions);
    const data = await res.json();

    if (data.message === "Can't Find the WeeklyPlanning Entry.") {
      return;
    }
    // console.log(data);
    return data.message;
  } catch (error) {
    // console.log(error);
  }
}

async function signup(e) {
  e.preventDefault();
  if (family.value.length === 0) {
    console.log("No Family");
    return;
  }

  let newSignup = {};

  newSignup.email = email.value;
  newSignup.family = family.value;
  newSignup.password = password.value;

  const URL = `${serverURL}/user/signup`;
  await fetch(URL, {
    method: "POST",
    mode: "cors",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(newSignup),
  });
}

async function login(e) {
  let url;
  if (document.getElementById("submitLogin").textContent === "Submit") {
    url = `${serverURL}/user/login`;
  } else if (
    document.getElementById("submitLogin").textContent === "Register"
  ) {
    ("registering");
    url = `${serverURL}/user/signup`;
  }

  e.preventDefault();

  let loginBody = {};

  loginBody.email = email.value;
  loginBody.family = family.value;
  loginBody.password = password.value;

  try {
    const res = await fetch(url, {
      method: "POST",
      mode: "cors",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(loginBody),
    });
    const data = await res.json();

    if (
      data.message === "Login successful!" ||
      data.message === "Success! User Created!"
    ) {
      sessionStorage.family = data.user.family;
      sessionStorage.email = data.user.email;
      sessionStorage.token = data.token;
      token = data.token;

      console.log("checking for token");
      console.log("token: ", token);
      // console.log(checkForToken())
      if (checkForToken() === true) {
        console.log("creating menu page...");
        createMenuPage();
      } else if (!document.getElementById("title_page")) {
        window.location.reload();
      }
    } else if (data.message === "User not found.") {
      document.getElementById("subitLogin").textContent = "Register";
      document.getElementById("familyInput").style.visibility = "visible";
      document.getElementById("familyInputLabel").style.visibility = "visible";
      URL = `${serverURL}/user/signup`;
      console.log(URL);

      return;
    } else if (data.message === "Incorrect Password.") {
      console.log("data.message: ", data.message);
      password.value = "Incorrect Password";
      password.type = "text";
      setTimeout(() => {
        password.type = "password";
        password.value = "";
      }, 3000);
      return;
    }
  } catch (error) {
    console.log(error);
  }
}

//!-------------------------- Functions -------------------------------

function addShoppingListInput() {
  const shoppingListTableBody = document.getElementById(
    "shoppingListTableBody"
  );
  const shoppingListTableInputLine = document.createElement("tr");
  shoppingListTableInputLine.className = "shoppingListTableInputLine";

  const check = document.createElement("td");
  check.className = "check";

  const addNewItemBtn = document.createElement("button");
  addNewItemBtn.id = "addNewItem";
  addNewItemBtn.className = "button";
  addNewItemBtn.textContent = "+";
  addNewItemBtn.addEventListener("click", handlePostNewItem);

  const item = document.createElement("td");
  item.className = "item";
  const itemInput = document.createElement("input");
  itemInput.id = "itemInput";
  itemInput.type = "text";
  itemInput.required = "true";
  itemInput.placeholder = "Enter New Item";
  item.append(itemInput);

  itemInput.addEventListener("keypress", handlPostNewItemKeypress);
  function handlPostNewItemKeypress(e) {
    if (e.key === "Enter" || e.keyCode === "13" || e.keyCode === "9") {
      e.preventDefault();
      handlePostNewItem();
    }
  }

  const removeSelectedItems = document.createElement("td");
  removeSelectedItems.id = "removeSelectedItemsContainer";

  const removeSelectedItemsBtn = document.createElement("button");
  removeSelectedItemsBtn.addEventListener(
    "click",
    handleRemovingShoppingListItems
  );
  removeSelectedItemsBtn.id = "removeSelectedItems";
  removeSelectedItemsBtn.textContent = "Remove";
  removeSelectedItems.append(removeSelectedItemsBtn);

  shoppingListTableInputLine.append(removeSelectedItems, item, addNewItemBtn);

  if (shoppingListTableBody) {
    shoppingListTableBody.append(shoppingListTableInputLine);
  }
}

function checkForToken() {
  if (sessionStorage.token) {
    return true;
  } else return false;
}

function createMenuPage() {
  document.getElementById("title_page").remove();

  const menuPage = document.createElement("div");
  menuPage.id = "menuPage";

  const navbar = document.createElement("div");
  navbar.id = "navbar";
  menuPage.append(navbar);

  const shoppingMenuBtn = document.createElement("button");
  shoppingMenuBtn.textContent = "Shopping List";
  shoppingMenuBtn.addEventListener("click", loadShoppingList);

  const recipesMenuBtn = document.createElement("button");
  recipesMenuBtn.textContent = "Recipes";
  recipesMenuBtn.addEventListener("click", loadRecipesList);

  const calorieCountingMenuBtn = document.createElement("button");
  calorieCountingMenuBtn.textContent = "Calorie Counting";
  calorieCountingMenuBtn.addEventListener(
    "click",
    handleCalorieCountingBtnClick
  );

  const mealPlanningMenuBtn = document.createElement("button");
  mealPlanningMenuBtn.textContent = "Meal Planning";
  mealPlanningMenuBtn.addEventListener("click", handleMealPlanningBtnClick);

  const logOutBtn = document.createElement("button");
  logOutBtn.id = "logOutBtn";
  logOutBtn.className = "button";
  logOutBtn.textContent = "Log Out";
  logOutBtn.addEventListener("click", handleLogOut);

  navbar.append(
    shoppingMenuBtn,
    recipesMenuBtn,
    mealPlanningMenuBtn,
    calorieCountingMenuBtn,
    logOutBtn
  );
  document.querySelector("body").append(menuPage);
  //todo add fetches here???
}

function createShoppingListSection() {
  const shoppingListContainer = document.createElement("div");
  shoppingListContainer.id = "shoppingListContainer";
  const shoppingListTable = document.createElement("table");
  shoppingListTable.id = "shoppingListTable";
  const shoppingListTableBody = document.createElement("tbody");
  shoppingListTableBody.id = "shoppingListTableBody";

  shoppingListTable.append(shoppingListTableBody);

  shoppingListContainer.append(shoppingListTable);

  removeExistingMenus();

  return document.getElementById("navbar").after(shoppingListContainer);
}

function createRecipesContainer() {
  removeExistingMenus();
  const recipesContainer = document.createElement("div");
  recipesContainer.id = "recipesContainer";
  const recipesContainerHeaders = document.createElement("div");
  recipesContainerHeaders.className = "headers";
  recipesContainerHeaders.textContent = "Recipes";

  const recipesSelections = document.createElement("div");
  recipesSelections.id = "selections";

  recipesContainer.append(recipesContainerHeaders, recipesSelections);

  document.getElementById("navbar").after(recipesContainer);
  console.log(recipesSelections);
  return;
}

function createRecipeWindow() {
  const recipeWindow = document.createElement("div");
  recipeWindow.id = "recipeWindow";

  const recipeWindowContent = document.createElement("div");
  recipeWindowContent.id = "recipeWindowContent";

  const recipeText = document.createElement("div");
  recipeText.id = "recipeText";

  recipeWindowContent.append(recipeText);

  recipeWindow.append(recipeWindowContent);

  return document.getElementById("navbar").after(recipeWindow);
}

function handleCalorieCountingBtnClick() {
  removeExistingMenus();
  const calorieCountingWindow = document.createElement("div");
  calorieCountingWindow.id = "calorieCountingWindow";
  document.getElementById("navbar").after(calorieCountingWindow);
}

function handleLogOut(e) {
  e.preventDefault();
  sessionStorage.removeItem("token");
  checkForToken();
  sessionStorage.removeItem("family");
  sessionStorage.removeItem("email");
  window.location.reload();
}

function handleMealPlanningBtnClick() {
  removeExistingMenus();
  const mealPlanningWindow = document.createElement("div");
  mealPlanningWindow.id = "mealPlanningWindow";
  document.getElementById("navbar").after(mealPlanningWindow);

  createMealPlanningPage();
}

function handleSelectAllClick() {
  selectAllFlag = !selectAllFlag;
  const shoppingListCheckBoxes = document.getElementsByClassName(
    "shoppingListCheckBoxes"
  );
  for (let i = 0; i < shoppingListCheckBoxes.length; i++) {
    shoppingListCheckBoxes[i].checked = selectAllFlag;
    if (selectAllFlag === false) {
      document.getElementsByClassName("item")[i].style.textDecoration = "none";
    } else {
      document.getElementsByClassName("item")[i].style.textDecoration =
        "line-through";
    }
  }
}

function logMeals() {
  const mealsArray = [
    "Breakfast Meals:",
    breakfastRecipesList,
    "Lunch Meals:",
    lunchRecipesList,
    "Dessert Meals",
    dessertRecipesList,
    "Dinner Meals:",
    dinnerRecipesList,
    "Snacks Meals:",
    snacksRecipesList,
  ];
  console.log("mealsArray: ", mealsArray);
}

function populateShoppingList(items) {
  console.log("populating shopping list data...")
  const shoppingListTableBody = document.getElementById(
    "shoppingListTableBody"
  );
  shoppingListTableBody.innerHTML = "";

  const shoppingListItems =
    document.getElementsByClassName("shoppingListItems");

  for (let i = shoppingListItems.length - 1; i > 0; i--) {
    shoppingListItems[i]?.remove();
  }

  document.getElementById("headers")?.remove();
  // shoppingListTableBody.innerHTML = "";

  const headers = document.createElement("tr");
  headers.id = "headers";

  const checkboxHeader = document.createElement("th");
  checkboxHeader.id = "checkboxHeader";
  checkboxHeader.textContent = "Select All";
  checkboxHeader.addEventListener("click", handleSelectAllClick);
  headers.append(checkboxHeader);

  const ingredientHeader = document.createElement("th");
  ingredientHeader.id = "ingredientHeader";
  ingredientHeader.textContent = "Ingredient";
  headers.append(ingredientHeader);

  const qtyHeader = document.createElement("th");
  qtyHeader.id = "qtyHeader";
  // document.getElementById("qtyHeader").textContent = "Qty"

  headers.append(qtyHeader);

  const shoppingListTitle = document.createElement("div");
  shoppingListTitle.textContent = "Shopping List";
  shoppingListTitle.id = "shoppingListTitle";

  shoppingListTableBody?.append(headers);

  if (!document.getElementById("shoppingListTitle")) {
    document.getElementById("shoppingListTable").before(shoppingListTitle);
  }
  for (let ingredient of items) {
    const shoppingListItems = document.createElement("tr");
    shoppingListItems.className = "shoppingListItems";

    const check = document.createElement("td");
    check.className = "check";
    const checkBox = document.createElement("input");
    checkBox.type = "checkbox";
    checkBox.className = "shoppingListCheckBoxes";
    check.append(checkBox);

    const item = document.createElement("td");
    item.className = "item";
    item.textContent = ingredient.ingredientName;
    item.style.textDecoration = "none";
    item.addEventListener('click', handleShoppingListCheckboxClick)

    checkBox.addEventListener("click", handleShoppingListCheckboxClick);

    function handleShoppingListCheckboxClick() {
      if (item.style.textDecoration === "line-through") {
        item.style.textDecoration = "none";
        checkBox.checked = false;
      } else if (item.style.textDecoration === "none") {
        item.style.textDecoration = "line-through";
        checkBox.checked = true;
      }
    }
    const itemQuantity = document.createElement("td");
    itemQuantity.className = "qty";
    itemQuantity.addEventListener("change", handleUpdatingItemQuantity);

    async function handleUpdatingItemQuantity() {
      const URL = `${serverURL}/ingredient/updateIngredient`;
    }

    const qtyInput = document.createElement("input");
    qtyInput.placeholder = "1";
    qtyInput.type = "number";
    qtyInput.min = "1";
    qtyInput.value = 1;

    itemQuantity.append(qtyInput);

    shoppingListItems.append(check, item, itemQuantity);

    if (document.getElementsByClassName("qty")) {
      document.getElementById("qtyHeader").textContent = "Qty";
    }
    shoppingListTableBody?.append(shoppingListItems);
  }
}

function removeRecipeIngredients() {
  const mainContent = document.getElementsByClassName("mainContent");
  document.getElementById("newIngredientSection")?.remove();

  if (mainContent.length > 0) {
    for (let i = mainContent.length; i > 0; i--) {
      mainContent[i - 1].remove();
    }
  }
}

function removeExistingMenus() {
  document.getElementById("newIngredientSection")?.remove();

  document.getElementById("shoppingListContainer")?.remove();

  document.getElementById("recipesContainer")?.remove();

  document.getElementById("recipeWindow")?.remove();

  document.getElementById("recipeContent")?.remove();

  document.getElementById("calorieCountingWindow")?.remove();

  document.getElementById("mealPlanningWindow")?.remove();

  document.getElementById("breakfastWindow")?.remove();

  document.getElementById("lunchWindow")?.remove();

  document.getElementById("dinnerWindow")?.remove();

  document.getElementById("snacksWindow")?.remove();

  const mainContent = document.getElementsByClassName("mainContent");
  for (let i = mainContent.length - 1; i >= 0; i--) {
    mainContent[i].remove();
  }

  document
    .getElementById("addRecipeIngredientsToShoppingListBtnContainer")
    ?.remove();

  document.getElementById("newIngredientSection")?.remove();
}

function resetDate() {
  currentMonth = new Date().getMonth();
  currentYear = new Date().getFullYear();
  currentDate = new Date().getDate();
  currentDay = new Date().getDay();
}

function toggleSignup() {
  if (switchBtn.textContent === "Login?") {
    family.removeAttribute("required", true);
    family.style.visibility = "hidden";
    loginForm.removeEventListener("submit", login);
    loginForm.addEventListener("submit", signup);
    switchBtn.textContent = "Signup?";
    loginBtn.textContent = "Login";
  } else if (switchBtn.textContent === "Signup?") {
    family.style.visibility = "visible";
    family.setAttribute("required", true);
    loginForm.removeEventListener("submit", signup);
    loginForm.addEventListener("submit", login);
    switchBtn.textContent = "Login?";
    loginBtn.textContent = "Sign Up";
  }
}

const editMealsFunctions = [
  async function editBreakfast(ID) {
    logMeals();
    let date = [currentMonth, currentDate, currentYear];

    // for (let i = 0; i < breakfastRecipesList.length; i++) {
    //   console.log(breakfastRecipesList[i]);
    //   recipes.splice(
    //     [recipes.indexOf(breakfastRecipesList[i].recipeName)],
    //     1
    //   );
    // }

    const breakfastWindowContent = document.createElement("div");
    breakfastWindowContent.id = "breakfastWindowContent";

    const breakfastWindow = document.createElement("div");
    breakfastWindow.id = "breakfastWindow";

    document.getElementById("mealPlanningWindow").after(breakfastWindowContent);
    // breakfastWindow.append(breakfastWindowContent);

    document.getElementById("navbar").append(breakfastWindow);
    // document.getElementById("mealPlanningWindow").after(breakfastWindow);

    // console.log(ID[1][ID.length-1])
    const dayNum = ID[1][ID[1].length - 1];

    const breakfastHeader = document.createElement("h1");
    breakfastHeader.textContent = `${fullDayNamesArray[dayNum]} Breakfast`;

    breakfastWindowContent.append(breakfastHeader);

    const breakfastAddRow = document.createElement("div");
    breakfastAddRow.className = "breakfastAddRow";

    const breakfastSelections = document.createElement("select");
    breakfastSelections.id = "breakfastSelections";
    // const breakfastAndAllRecipes = breakfastRecipesList.concat(recipes);

    const addBreakfastItemBtn = document.createElement("button");
    addBreakfastItemBtn.textContent = "+";
    addBreakfastItemBtn.id = "addBreakfastItemBtn";
    addBreakfastItemBtn.addEventListener("click", handleAddBreakfastItem);

    const breakfastGrid = document.createElement("div");
    breakfastGrid.id = "breakfastGrid";

    function handleAddBreakfastItem() {
      const breakfastItem = document.createElement("div");
      breakfastItem.className = "breakfastItem";

      const breakfastItemName = document.createElement("div");
      breakfastItemName.className = "breakfastItemName";
      breakfastItemName.textContent = breakfastSelections.value;

      const breakfastItemQtyRow = document.createElement("div");
      breakfastItemQtyRow.className = "breakfastItemQtyRow";

      const breakfastItemQuantity = document.createElement("input");
      breakfastItemQuantity.className = "breakfastItemQuantity";
      breakfastItemQuantity.type = "number";
      breakfastItemQuantity.value = 1;
      breakfastItemQuantity.min = 1;
      breakfastItemQuantity.addEventListener(
        "change",
        handleUpdateItemCalories
      );

      const removeBreakfastItemRowBtn = document.createElement("button");
      removeBreakfastItemRowBtn.textContent = "-";
      removeBreakfastItemRowBtn.className = "removeBreakfastItemRowBtn";
      removeBreakfastItemRowBtn.addEventListener(
        "click",
        handleRemoveBreakfastItemRow
      );

      function handleRemoveBreakfastItemRow() {
        breakfastItem.remove();
      }

      breakfastItemQtyRow.append(
        breakfastItemQuantity,
        removeBreakfastItemRowBtn
      );

      const breakfastItemCalories = document.createElement("div");
      breakfastItemCalories.className = "breakfastItemCalories";

      const listIndex = breakfastRecipesList.findIndex(
        (name) => name.recipeName === breakfastSelections.value
      );
      let recipe = breakfastRecipesList[listIndex];

      let breakfastItemCaloriesTotal = 0;

      for (let i = 0; i < recipe.ingredients.length; i++) {
        let recipeIngredientCalories =
          recipe.ingredients[i].newIngredientCalorieInput;

        for (let i = 0; i < recipeIngredientCalories.length; i++) {
          let output = "";
          if (+recipeIngredientCalories[i] !== NaN) {
            output += recipeIngredientCalories[i];
            // console.log(recipeIngredientCalories[i])
          }
          recipeIngredientCalories = +output;
        }

        breakfastItemCaloriesTotal += recipeIngredientCalories;
      }

      breakfastItemCaloriesTotal /= recipe.numberOfServings;

      function handleUpdateItemCalories() {
        breakfastItemCalories.textContent =
          +breakfastItemCaloriesTotal.toFixed(0) * breakfastItemQuantity.value;
      }

      breakfastItemCalories.textContent = breakfastItemCaloriesTotal.toFixed(0);

      breakfastItem.append(
        breakfastItemName,
        breakfastItemQtyRow,
        breakfastItemCalories
      );

      breakfastGrid.append(breakfastItem);
    }

    for (let i = 0; i < breakfastRecipesList.length; i++) {
      // console.log(breakfastRecipesList)
      // console.log("breakfastRecipesList[i]",breakfastRecipesList[i])
      const breakfastOption = document.createElement("option");
      breakfastOption.value = breakfastRecipesList[i].recipeName;
      breakfastOption.textContent = breakfastRecipesList[i].recipeName;
      breakfastSelections.append(breakfastOption);
    }

    breakfastAddRow.append(
      breakfastSelections,
      addBreakfastItemBtn,
      breakfastGrid
    );
    breakfastHeader.after(breakfastAddRow);

    const editBreakfastCloseButtonContainer = document.createElement("div");
    editBreakfastCloseButtonContainer.id = "editBreakfastCloseButtonContainer";

    const editBreakfastCloseButton = document.createElement("button");
    editBreakfastCloseButton.id = "closeRecipeWindowBtn";
    editBreakfastCloseButton.textContent = "Close";
    editBreakfastCloseButton.addEventListener(
      "click",
      handleCloseEditBreakfastWindow
    );

    editBreakfastCloseButtonContainer.append(editBreakfastCloseButton);

    // breakfastWindowContent.style.height = "fit-content";
    // breakfastWindowContent.style.minHeight = "95vh";
    // breakfastWindowContent.style.width = "93vw";
    // breakfastWindowContent.style.height = "100%"
    // breakfastWindowContent.style.bottom = "0"
    // breakfastWindowContent.style.width = "100%";
    // breakfastWindowContent.style.visibility = "visible";

    /* 
  - dropdown menus with known breakfast recipes first, then others listed
  - number of servings or parts thereof
  - calories consumed
  - on submit, create a new database entry with the date and the items in the meal, and hard-coded calories from the day (to prevent future changes to recipes from changing the calories from the past)
  
  */

    function totalCals() {
      let total = 0;
      const breakfastItemCalories = document.getElementsByClassName(
        "breakfastItemCalories"
      );
      for (let i = 0; i < breakfastItemCalories.length; i++) {
        total += +breakfastItemCalories[i].textContent;
        // console.log(breakfastItemCalories[i])
      }
      // console.log(total);
      return total;
    }
    const totalBreakfastCalories = document.createElement("div");
    totalBreakfastCalories.id = "totalBreakfastCalories";
    totalBreakfastCalories.textContent = "total";

    breakfastWindowContent.append(editBreakfastCloseButtonContainer);

    async function handleCloseEditBreakfastWindow() {
      // console.log(ID[1][ID[1].length - 1]);
      const calorieTotal = totalCals();

      // console.log("date before changing:",date)
      //todo change date to reflect day clicked

      // console.log("Day: ",ID[1][ID[1].length -1])
      // console.log("day: ",new Date().getDay())

      let currentDate = date[1];
      let currentDay = +ID[1][ID[1].length - 1];
      let currentMonth = date[0];
      let currentYear = date[2];

      console.log(currentDate, currentDay, currentMonth, currentYear);

      let currentMonday = document.getElementById("dateDisplay").textContent;
      currentMonday = currentMonday.split(" ")[3];
      currentMonday = +currentMonday.slice(0, currentMonday.length - 1);

      // currentMonday.length = currentMonday.length -1
      // console.log("currentMonday: ",currentMonday)
      // console.log("currentDay: ", currentDay)
      //incorporate next month, leap year, next year
      let output;
      for (let i = 0; i < currentDay; i++) {
        output = nextDay(currentDate, currentDay, currentMonth, currentYear);
      }

      // console.log(currentDate,currentDay, currentMonth, currentYear)
      console.log("output: ", output);

      if (date[0].toString().length < 2) {
        date[0] = "0" + date[0].toString();
      }

      if (date[1].toString().length < 2) {
        date[1] = "0" + date[1].toString();
      }

      date = `${date[0]}${date[1]}${date[2]}`;
      console.log(date);

      const breakfastItemsObject = {};
      const names = [];
      const quantity = [];
      const calories = [];

      const breakfastItems =
        document.getElementsByClassName("breakfastItemName");
      const breakfastItemQuantities = document.getElementsByClassName(
        "breakfastItemQuantity"
      );
      const breakfastItemCalories = document.getElementsByClassName(
        "breakfastItemCalories"
      );

      for (let i = 0; i < breakfastItems.length; i++) {
        names.push(breakfastItems[i].textContent);
        quantity.push(breakfastItemQuantities[i].value);
        calories.push(breakfastItemCalories[i].textContent);
      }
      breakfastItemsObject.names = names;
      breakfastItemsObject.quantity = quantity;
      breakfastItemsObject.calories = calories;

      // console.log(breakfastItemsObject)

      breakfastItemsObject.calorieTotal = calorieTotal;

      const url = `${serverURL}/weeklyplanning/storeWeeklyData`;

      // date = date.join("")

      // console.log("ID:", ID);
      const day = ID[1][ID[1].length - 1];

      // console.log(date, daysarray[day], breakfastRecipesList);

      const mealObject = {
        date: date,
        breakfast: breakfastItemsObject,
        creator: sessionStorage.email,
        family: sessionStorage.family,
      };

      console.log("mealObject: ", mealObject);

      try {
        const res = await fetch(url, {
          method: "POST",
          mode: "cors",
          headers: {
            "Content-Type": "application/json",
            Authorization: token,
          },
          body: JSON.stringify(mealObject),
        });
        const data = await res.json();
        // console.log("data:",data)
        if (data.message === "Existing Information") {
          // console.log(data.message)
          console.log("data:", data);

          const url = `${serverURL}/weeklyplanning/updatemeal${data.body._id}`;

          console.log("url: ", url);

          const updateObject = { breakfast: mealObject.breakfast };

          console.log("updateObject: ", updateObject);
          try {
            // console.log("mealObject: ",mealObject.breakfast)
            const res = await fetch(url, {
              method: "PATCH",
              mode: "cors",
              headers: {
                "Content-Type": "application/json",
                Authorization: token,
              },
              body: JSON.stringify(updateObject),
            });
            const data = await res.json();
            console.log("patch data:", data);
          } catch (error) {
            console.log("patch error; ", error);
          }
        }
      } catch (error) {
        console.log(error);
      }

      const breakfastWindowContent = document.getElementById(
        "breakfastWindowContent"
      );
      breakfastWindowContent.remove();
      document.getElementById("breakfastWindow").remove();
    }
  },

  async function editLunch(ID) {
    logMeals();
    // console.log("recipes:",recipes)

    // const recipes = [];
    // const fetchedRecipes = await fetchAllRecipes();
    console.log(ID[1]);

    // for (let i = 0; i < fetchedRecipes.length; i++) {
    //   recipes.push(fetchedRecipes[i].recipeName);
    // }

    // for (let i = 0; i < lunchRecipesList.length; i++) {
    //   console.log(lunchRecipesList[i]);
    //   recipes.splice([recipes.indexOf(lunchRecipesList[i].recipeName)], 1);
    // }

    const lunchWindowContent = document.createElement("div");
    lunchWindowContent.id = "lunchWindowContent";

    const lunchWindow = document.createElement("div");
    lunchWindow.id = "lunchWindow";

    lunchWindow.append(lunchWindowContent);

    document.getElementById("navbar").append(lunchWindow);

    const dayNum = ID[1][ID[1].length - 1];

    const lunchHeader = document.createElement("h1");
    lunchHeader.textContent = `${fullDayNamesArray[dayNum]} Lunch`;
    lunchWindowContent.append(lunchHeader);

    const lunchSelections = document.createElement("select");

    // const lunchRecipesList = lunchRecipesList.concat(recipes);

    for (let i = 0; i < lunchRecipesList.length; i++) {
      const lunchOption = document.createElement("option");
      lunchOption.value = lunchRecipesList[i].recipeName;
      lunchOption.textContent = lunchRecipesList[i].recipeName;
      lunchSelections.append(lunchOption);
    }

    lunchHeader.after(lunchSelections);

    const editLunchCloseButtonContainer = document.createElement("div");
    editLunchCloseButtonContainer.id = "editLunchCloseButtonContainer";

    const editLunchCloseButton = document.createElement("button");
    editLunchCloseButton.id = "closeLunchWindowBtn";
    editLunchCloseButton.textContent = "Close";

    editLunchCloseButton.addEventListener("click", handleCloseEditLunchWindow);

    editLunchCloseButtonContainer.append(editLunchCloseButton);

    function handleCloseEditLunchWindow() {
      const lunchWindowContent = document.getElementById("lunchWindowContent");
      lunchWindowContent.remove();
      document.getElementById("lunchWindow").remove();
      // handleMealPlanningBtnClick();
    }

    lunchWindowContent.style.height = "fit-content";
    lunchWindowContent.style.minHeight = "95vh";
    lunchWindowContent.style.width = "93vw";
    lunchWindowContent.style.visibility = "visible";

    lunchWindowContent.append(editLunchCloseButtonContainer);
  },

  async function editDinner(ID) {
    logMeals();
    const recipes = [];
    const fetchedRecipes = await fetchAllRecipes();
    console.log(ID[1]);

    // for (let i = 0; i < fetchedRecipes.length; i++) {
    //   recipes.push(fetchedRecipes[i].recipeName);
    // }
    console.log("recipes", recipes);
    console.log("dinnerRecipesList", dinnerRecipesList);
    // removeExistingMenus();

    for (let i = 0; i < dinnerRecipesList.length; i++) {
      console.log(dinnerRecipesList[i]);
      recipes.splice([recipes.indexOf(dinnerRecipesList[i].recipeName)], 1);
    }

    // console.log("recipes",recipes)

    const dinnerWindowContent = document.createElement("div");
    dinnerWindowContent.id = "dinnerWindowContent";

    const dinnerWindow = document.createElement("div");
    dinnerWindow.id = "dinnerWindow";

    dinnerWindow.append(dinnerWindowContent);

    document.getElementById("navbar").append(dinnerWindow);

    // const lunchHeader = document.createElement("h1");
    // lunchHeader.textContent = `${fullDayNamesArray[dayNum]} Lunch`;
    // lunchWindowContent.append(lunchHeader);
    const dayNum = ID[1][ID[1].length - 1];

    const dinnerHeader = document.createElement("h1");
    dinnerHeader.textContent = `${fullDayNamesArray[dayNum]} Dinner`;
    dinnerWindowContent.append(dinnerHeader);

    const dinnerSelections = document.createElement("select");

    const dinnerAndAllRecipes = lunchRecipesList.concat(recipes);

    for (let i = 0; i < dinnerAndAllRecipes.length; i++) {
      const dinnerOption = document.createElement("option");
      dinnerOption.value = dinnerAndAllRecipes[i].recipeName;
      dinnerOption.textContent = dinnerAndAllRecipes[i].recipeName;
      dinnerSelections.append(dinnerOption);
    }

    dinnerHeader.after(dinnerSelections);

    const editDinnerCloseButtonContainer = document.createElement("div");
    editDinnerCloseButtonContainer.id = "editDinnerCloseButtonContainer";

    const editDinnerCloseButton = document.createElement("button");
    editDinnerCloseButton.id = "closeDinnerWindowBtn";
    editDinnerCloseButton.textContent = "Close";

    editDinnerCloseButton.addEventListener(
      "click",
      handleCloseEditDinnerWindow
    );

    editDinnerCloseButtonContainer.append(editDinnerCloseButton);

    function handleCloseEditDinnerWindow() {
      const dinnerWindowContent = document.getElementById(
        "dinnerWindowContent"
      );
      dinnerWindowContent.remove();
      document.getElementById("dinnerWindow").remove();
      // handleMealPlanningBtnClick();
    }

    dinnerWindowContent.style.height = "fit-content";
    dinnerWindowContent.style.minHeight = "95vh";
    dinnerWindowContent.style.width = "93vw";
    dinnerWindowContent.style.visibility = "visible";

    dinnerWindowContent.append(editDinnerCloseButtonContainer);
  },

  async function editSnacks(ID) {
    logMeals();
    const recipes = [];
    const fetchedRecipes = await fetchAllRecipes();
    console.log(ID[1]);

    // for (let i = 0; i < fetchedRecipes.length; i++) {
    //   recipes.push(fetchedRecipes[i].recipeName);
    // }

    // console.log("recipes", recipes);
    console.log("snacksRecipesList", snacksRecipesList);
    // console.log("dessertRecipesList", dessertRecipesList);
    const temp = [];
    for (let i = 0; i < snacksRecipesList.length; i++) {
      console.log(snacksRecipesList[i]);
      recipes.splice([recipes.indexOf(snacksRecipesList[i].recipeName)], 1);
    }

    // removeExistingMenus();

    const snacksWindowContent = document.createElement("div");
    snacksWindowContent.id = "snacksWindowContent";

    const snacksWindow = document.createElement("div");
    snacksWindow.id = "snacksWindow";

    snacksWindow.append(snacksWindowContent);

    document.getElementById("navbar").append(snacksWindow);

    const dayNum = ID[1][ID[1].length - 1];

    const snacksHeader = document.createElement("h1");
    snacksHeader.textContent = `${fullDayNamesArray[dayNum]} Snacks`;
    snacksWindowContent.append(snacksHeader);

    const snacksSelections = document.createElement("select");

    const snacksAndAllRecipes = snacksRecipesList.concat(temp);

    for (let i = 0; i < snacksAndAllRecipes.length; i++) {
      const snacksOption = document.createElement("option");
      snacksOption.value = snacksAndAllRecipes[i].recipeName;
      snacksOption.textContent = snacksAndAllRecipes[i].recipeName;
      snacksSelections.append(snacksOption);
    }

    snacksHeader.after(snacksSelections);

    const editSnacksCloseButtonContainer = document.createElement("div");
    editSnacksCloseButtonContainer.id = "editSnacksCloseButtonContainer";

    const editSnacksCloseButton = document.createElement("button");
    editSnacksCloseButton.id = "closeSnacksWindowBtn";
    editSnacksCloseButton.textContent = "Close";

    editSnacksCloseButton.addEventListener(
      "click",
      handleCloseEditSnacksWindow
    );

    editSnacksCloseButtonContainer.append(editSnacksCloseButton);

    function handleCloseEditSnacksWindow() {
      const snacksWindowContent = document.getElementById(
        "snacksWindowContent"
      );
      snacksWindowContent.remove();
      document.getElementById("snacksWindow").remove();
      // handleMealPlanningBtnClick();
    }

    snacksWindowContent.style.height = "fit-content";
    snacksWindowContent.style.minHeight = "95vh";
    snacksWindowContent.style.width = "93vw";
    snacksWindowContent.style.visibility = "visible";

    snacksWindowContent.append(editSnacksCloseButtonContainer);
  },
];

function fillMenus(data) { 
  if (document.getElementById("recipesContainer")) {
    populateRecipeList();
  }

  if (document.getElementById("shoppingListContainer")) {
    populateShoppingList(data.filteredIngredients);
  }
  if (!document.getElementById("shoppingListTableInputLine")) {
    addShoppingListInput();
  }
}

//---------------------- Day switching functions-----------------
function nextDay(currentDate, currentDay, currentMonth, currentYear) {
  const months = {
    0: "Jan",
    1: "Feb",
    2: "Mar",
    3: "Apr",
    4: "May",
    5: "Jun",
    6: "Jul",
    7: "Aug",
    8: "Sep",
    9: "Oct",
    10: "Nov",
    11: "Dec",
  };

  const days = {
    0: 6,
    1: 0,
    2: 1,
    3: 2,
    4: 3,
    5: 4,
    6: 5,
  };

  const calendar = {
    1: 31,
    2: 28,
    3: 31,
    4: 30,
    5: 31,
    6: 30,
    7: 31,
    8: 31,
    9: 30,
    10: 31,
    11: 30,
    12: 31,
    leapMonth: 29,
  };

  if (currentDate - days[currentDay] > 0) {
    // console.log("greater than zero");
    currentDate -= days[currentDay];
  } else {
    currentMonth--;
    if (currentMonth % 4 === 0) {
      if (currentDate - days[currentDay] === 0) {
        currentDate = calendar.leapMonth + currentDate - days[currentDay];
      }
    } else {
      currentDate = calendar[currentMonth] + days[currentDay];
    }
  }
  //leap year
  if (currentMonth + 1 === 2 && currentYear % 4 === 0) {
    if (currentDate + 1 <= calendar.leapMonth) {
      return { currentDate: currentDate++ };
    } else if (currentDate + 1 > calendar.leapMonth) {
      return {
        currentDate: 1,
        currentMonth: currentMonth++,
      };
    }
  } else if (currentMonth + 1 < 12) {
    //normal days not the end of the month
    if (currentDate + 1 <= calendar[currentMonth + 1]) {
      // console.log("calendar", calendar)
      console.log("currentMonth+1", currentMonth + 1);
      console.log("normal");
      return { currentDate: currentDate++ };
    } else if (currentDate === calendar[currentDate + 1]) {
      // last day of the month
      return { currentMonth: currentMonth++, currentDate: 1 };
    }
  } //december
  else if (currentMonth + 1 === 12) {
    if (currentDate + 1 <= calendar[currentMonth + 1]) {
      return { currentDate: currentDate++ };
    } else {
      return { currentDate: 1, currentMonth: 1, currentYear: currentYear++ };
    }
  }
}

function prevDay(currentDate, currentDay, currentMonth, currentYear) {
  const months = {
    0: "Jan",
    1: "Feb",
    2: "Mar",
    3: "Apr",
    4: "May",
    5: "Jun",
    6: "Jul",
    7: "Aug",
    8: "Sep",
    9: "Oct",
    10: "Nov",
    11: "Dec",
  };

  console.log("day: ", new Date().getDay());
  // let currentMonth = new Date().getMonth();
  // let currentYear = new Date().getFullYear();
  // let currentDate = new Date().getDate();
  // let currentDay = new Date().getDay();

  const days = {
    0: 6,
    1: 0,
    2: 1,
    3: 2,
    4: 3,
    5: 4,
    6: 5,
  };

  const calendar = {
    1: 31,
    2: 28,
    3: 31,
    4: 30,
    5: 31,
    6: 30,
    7: 31,
    8: 31,
    9: 30,
    10: 31,
    11: 30,
    12: 31,
    leapMonth: 29,
  };

  if (currentDate - days[currentDay] > 0) {
    // console.log("greater than zero");
    currentDate -= days[currentDay];
  } else {
    currentMonth--;
    if (currentMonth % 4 === 0) {
      if (currentDate - days[currentDay] === 0) {
        currentDate = calendar.leapMonth + currentDate - days[currentDay];
      }
    } else {
      currentDate = calendar[currentMonth] + days[currentDay];
    }
  }
  if (currentDay > 1) {
    //* If the day of the month is not the 1st...
    return { currentDay: currentDay-- };
  } else {
    if (currentYear % 4 === 0 && currentMonth === 3) {
      return { currentMonth: currentMonth--, currentDay: calendar.leapMonth };
    }

    if (currentMonth === 1) {
      return {
        currentYear: currentYear--,
        currentMonth: (currentMonth = 12),
        currentDay: calendar[currentMonth--],
      };
    }
    //* If the day of the month IS the 1st...
    else if (currentMonth > 1); //* If the current month is not January...
    {
      return {
        currentMonth: currentMonth--,
        currentDay: calendar.currentMonth--,
      };
    }
  }
}

function nextWeek() {
  const prevWeek = [currentMonth, currentDate, currentYear];
  //* If it is December, and the day is the last of the month...
  if (currentMonth === 11 && currentDate + 7 > calendar[currentMonth + 1]) {
    currentYear++;
    currentMonth = 0;
    currentDate = currentDate + 7 - calendar[currentMonth + 1];
    const currentMonthDateYear =
      months[currentMonth].toString() +
      " " +
      currentDate.toString() +
      ", " +
      currentYear.toString();
    // dateDisplay.textContent = `Week of ${currentMonthDateYear}`;
    return {
      currentMonthDateYear: [currentMonth, currentDate, currentYear],
      prevWeek: prevWeek,
    };
  }
  //* If the current month is not December...
  else if (currentMonth < 11);
  {
    //* If it IS a leap year, and it is February...
    if (currentYear % 4 === 0 && currentMonth === 1) {
      //* If the day is not the last of the leap month...
      if (currentDate + 7 < 29) {
        currentDate += 7;
      }
      //* If the day is the last of the leap month...
      else {
        currentMonth++;
        currentDate = currentDate + 7 - calendar.leapMonth;
      }
    }
    //* If it is not December, and the current day is the last of the month...
    else if (
      currentDate + 7 === calendar[currentMonth + 1] + 1 &&
      currentMonth !== 11
    ) {
      currentDate = 1;
      currentMonth++;
    } else if (currentDate + 7 <= calendar[currentMonth + 1]) {
      currentDate += 7;
    } else {
      currentDate = currentDate + 7 - calendar[currentMonth + 1];
      currentMonth++;
    }
  }
  const output = {
    currentMonthDateYear: [currentMonth, currentDate, currentYear],
    prevWeek: prevWeek,
  };
  // findWeeklyMeals(output)
  return output;
}

function prevWeek() {
  const nextWeek = [currentMonth, currentDate, currentYear];

  if (currentDate - 7 > 0) {
    currentDate -= 7;
  } else {
    if (currentMonth > 0) {
      if (currentYear % 4 === 0 && currentMonth === 2) {
        currentMonth--;
        let tempMonth = currentMonth - 1;
        currentDate = calendar.leapMonth - (7 - currentDate);
      }
    }
    if (currentMonth === 0 && currentDate - 7 <= 0) {
      currentYear--;
      currentMonth = 11;
      currentDate = calendar[currentMonth + 1] - (7 - currentDate);
    }
    if (currentDate - 7 <= 0) {
      currentMonth--;
      currentDate = calendar[currentMonth + 1] - (7 - currentDate);
    }
  }

  const output = {
    currentMonthDateYear: [currentMonth, currentDate, currentYear],
    nextWeek: nextWeek,
  };

  // findWeeklyMeals([currentDate, currentMonth, currentYear])

  return output;
}

//!----------------------- Run page code -------------------------------
let token;

sessionStorage.token ? (token = sessionStorage.token) : (token = "");

//!------------------------------
if (checkForToken() === true) {
  if (!shoppingListData) {
    shoppingListData = await fetchShoppingList();
  }
  if (!recipeListData) {
    recipeListData = await fetchRecipeList();
  }

  console.log(shoppingListData)
  console.log(recipeListData)
//!------------------------------

  createMenuPage();
} else if (!document.getElementById("title_page")) {
  window.location.reload();
}


if (shoppingListData) {
  console.log("filling menus...");
  fillMenus(shoppingListData);
} else {
  console.log("waiting for shoppinglist data...");
}
