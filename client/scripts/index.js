//! -------------------------- Imports ------------------------------

import { serverURL } from "../helpers/serverURL.js";

//! ----------------------- DOM Variables ---------------------------

const loginSection = document.getElementById("loginSection");
const switchBtn = document.getElementById("switchBtn");
const email = document.getElementById("emailInput");
const password = document.getElementById("passwordInput");
const family = document.getElementById("familyInput");
let menuPageContentContainer;
//! ---------------------- Global Variables -------------------------

let token;
let shoppingListData;
let recipeListData;
let menuHeight = 0;
let menuWidth = 0;
if (checkForToken() === true) {
  token = sessionStorage.token;
}

//! ---------------------- Event Listeners --------------------------

loginSection?.addEventListener("submit", login);

switchBtn?.addEventListener("click", toggleSignup);

//! ---------------------- Async Functions --------------------------

async function signup(e) {
  console.log("signing up...");
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
  // if (switchBtn.textContent === "Sign Up?") {
  url = `${serverURL}/user/login`;
  // } else if (switchBtn.textContent === "Login?") {
  // ("registering");
  // url = `${serverURL}/user/signup`;
  // }

  e.preventDefault();

  const loginBody = {
    email: email.value,
    family: family.value,
    password: password.value,
  };

  try {
    console.log("logging in...");
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

      if (checkForToken() === true) {
        updateShoppingList();

        if (!recipeListData) {
          recipeListData = await fetchRecipeList();
        }

        createMealPlannerPage();
      } else if (!document.getElementById("title_page")) {
        // console.log("reloading window...")
        window.location.reload();
      }
    } else if (data.message === "User not found.") {
      document.getElementById("subitLogin").textContent = "Register";
      document.getElementById("familyInput").style.visibility = "visible";
      document.getElementById("familyInputLabel").style.visibility = "visible";
      URL = `${serverURL}/user/signup`;

      return;
    } else if (data.message === "Incorrect Password.") {
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

async function setShoppingListToSessionStorage() {
  const shoppingListData = await fetchShoppingList();

  if (shoppingListData !== undefined) {
    sessionStorage.setItem(
      "shoppingListData",
      JSON.stringify(shoppingListData)
    );
  }
}

//! -------------------------- Fetches -------------------------------

async function fetchShoppingList() {
  if (!sessionStorage.family) {
    console.log("no family found");
    return;
  }

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
    const shoppingListData = await data;
    return shoppingListData;
  } catch (error) {
    console.log(error);
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

//! ------------------- Page Layout Functions -----------------------

function toggleSignup() {
  if (switchBtn.textContent === "Login?") {
    family.removeAttribute("required", true);
    family.style.visibility = "hidden";
    loginSection?.removeEventListener("submit", login);
    loginSection?.addEventListener("submit", signup);
    switchBtn.textContent = "Sign Up?";
  } else if (switchBtn.textContent === "Sign Up?") {
    family.style.visibility = "visible";
    family.setAttribute("required", true);
    loginSection?.removeEventListener("submit", signup);
    loginSection?.addEventListener("submit", login);
    switchBtn.textContent = "Login?";
  }
}

// Create Meal Planner Page
// * Removes login section
// * Creates navbar & main sections
// * Adds event listeners to run when section buttons are clicked
function createMealPlannerPage() {
  document.title = "Meal Planner";
  document.getElementById("loginSection").remove();

  const menuPage = document.createElement("div");
  menuPage.id = "menuPage";

  const navbar = document.createElement("div");
  navbar.id = "navbar";
  menuPage.append(navbar);

  menuPageContentContainer = document.createElement("div");
  menuPageContentContainer.id = "menuPageContentContainer";
  navbar.after(menuPageContentContainer);

  const shoppingMenuBtn = document.createElement("button");
  shoppingMenuBtn.textContent = "Shopping List";
  shoppingMenuBtn.addEventListener("click", handleShoppingListBtnClick);

  const recipesMenuBtn = document.createElement("button");
  recipesMenuBtn.textContent = "Recipes";
  //   recipesMenuBtn.addEventListener("click", loadRecipesList);

  const calorieCountingMenuBtn = document.createElement("button");
  calorieCountingMenuBtn.textContent = "Calorie Counting";
  //   calorieCountingMenuBtn.addEventListener(
  // "click",
  // handleCalorieCountingBtnClick
  //   );

  const mealPlanningMenuBtn = document.createElement("button");
  mealPlanningMenuBtn.textContent = "Meal Planning";
  //   mealPlanningMenuBtn.addEventListener("click", handleMealPlanningBtnClick);

  const logOutBtn = document.createElement("button");
  logOutBtn.id = "logOutBtn";
  logOutBtn.className = "button";
  logOutBtn.textContent = "Log Out";
  //   logOutBtn.addEventListener("click", handleLogOut);

  navbar.append(
    shoppingMenuBtn,
    recipesMenuBtn,
    mealPlanningMenuBtn,
    calorieCountingMenuBtn,
    logOutBtn
  );
  document.querySelector("body").append(menuPage);
}

function toggleMenuDimension(dimension) {
  if (dimension === "height") {
    if (menuHeight == "0") {
      menuHeight = "100";
    } else {
      menuHeight = "0";
    }
    return menuHeight;
  }

  if (dimension === "width") {
    if (menuWidth == "0") {
      menuWidth = "100";
    } else {
      menuWidth = "0";
    }
    return menuWidth;
  }
}

async function handleShoppingListBtnClick() {
  // removeExistingMenus();

  if (!sessionStorage.shoppingListData) {
    await updateShoppingList();
    handleShoppingListBtnClick();
    return;
  }

  const shoppingListData = JSON.parse(sessionStorage.shoppingListData);

  // buildShoppingListSection(shoppingListData);
  if (!document.getElementById("shoppingListContainer")) {
    createShoppingListSection();
  }
  populateShoppingList(shoppingListData.ingredients);
  addShoppingListInput()
  const height = toggleMenuDimension("height");
  menuPageContentContainer.style.height = `${height}vh`;
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

  return menuPageContentContainer.append(shoppingListContainer);
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

function populateShoppingList(items) {
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

  // const shoppingListTitle = document.createElement("div");
  // shoppingListTitle.textContent = "Shopping List";
  // shoppingListTitle.id = "shoppingListTitle";

  shoppingListTableBody?.append(headers);

  // if (!document.getElementById("shoppingListTitle")) {
  //   document.getElementById("shoppingListTable").before(shoppingListTitle);
  // }
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
    item.addEventListener("click", handleShoppingListCheckboxClick);

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

function removeRecipeIngredients() {
  const mainContent = document.getElementsByClassName("mainContent");
  document.getElementById("newIngredientSection")?.remove();

  if (mainContent.length > 0) {
    for (let i = mainContent.length; i > 0; i--) {
      mainContent[i - 1].remove();
    }
  }
}

// function createShoppingListSection() {
//   const shoppingListContainer = document.createElement("div");
//   shoppingListContainer.id = "shoppingListContainer";
//   const shoppingListTable = document.createElement("table");
//   shoppingListTable.id = "shoppingListTable";
//   const shoppingListTableBody = document.createElement("tbody");
//   shoppingListTableBody.id = "shoppingListTableBody";

//   shoppingListTable.append(shoppingListTableBody);

//   shoppingListContainer.append(shoppingListTable);

//   removeExistingMenus();

//   return document.getElementById("navbar").after(shoppingListContainer);
// }

function removeExistingMenus() {
  menuPageContentContainer.style.height = "0";
}

//! ----------------------- Other Functions -------------------------

function checkForToken() {
  if (sessionStorage.token) {
    return true;
  } else return false;
}

async function updateShoppingList() {
  setShoppingListToSessionStorage();
}

//! -------------------------- Run Code -----------------------------

// If there already is a token, and the user was logged in already, this runs. Otherwise, the login button needs to be clicked and the login callback runs, which then calls createMealPlannerPage()

if (checkForToken() === true) {
  setShoppingListToSessionStorage();
  // if (!recipeListData) {
  // recipeListData = await fetchRecipeList();
  // sessionStorage.setItem("recipeListData", JSON.stringify(recipeListData))
  // }
  // console.log(JSON.parse(sessionStorage.shoppingListData))

  //   console.log(recipeListData)
  //!------------------------------

  createMealPlannerPage();

  if (document.title === "Meal Planner") {
    console.log("continue...");
  }

  // else {
  //   alert("reloading landing page")
  //   window.location.reload();
  // }
}
