import * as model from './model.js';
import recipeView from './views/recipeView.js';
import searchView from './views/searchView.js';
import resultsView from './views/resultsView.js';
import paginationView from './views/paginationView.js';
import bookmarksView from './views/bookmarksView.js';
import addRecipeView from './views/addRecipeView.js';
import themeView from './views/themeView.js';
import { MODAL_CLOSE_SEC } from './config.js';

import 'core-js/stable';
import 'regenerator-runtime/runtime';

// if (module.hot) {
//   module.hot.accept();
// }

const controlRecipes = async function () {
  try {
    const id = window.location.hash.slice(1);

    if (!id) return;
    if (document.documentElement.clientWidth <= 600) {
      recipeView.scrollToRecipe();
    }

    recipeView.renderSpinner();

    // 1) Update results view to mark selected search result
    resultsView.update(model.getSearchResultsPage());

    // 2) Loading recipe
    await model.loadRecipe(id);

    // 3) Rendering recipe
    recipeView.render(model.state.recipe);

    // 4) Updating bookmarks view
    bookmarksView.update(model.state.bookmarks);
  } catch (err) {
    console.error(`${err.message} ⚠⚠⚠`);
    recipeView.renderError();
  }

  // rendering the recipe without the nutritional data
  if (!model.state.recipe.calories) {
    // 1) Rendering recipe
    recipeView.render(model.state.recipe);

    // 2) Updating bookmarks view
    bookmarksView.update(model.state.bookmarks);
  }
};

const controlSearchResults = async function () {
  try {
    resultsView.renderSpinner();
    //1) Get search query
    const query = searchView.getQuery();
    if (!query) return;

    //2) Load search results
    await model.loadSearchResults(query);

    //3) Render results
    resultsView.render(model.getSearchResultsPage());

    //4) Render pagination buttons
    paginationView.render(model.state.search);
  } catch (err) {
    console.error(err);
  }
};

const controlPagination = function (goToPage) {
  //1) Render NEW results
  resultsView.render(model.getSearchResultsPage(goToPage));

  //2) Render NEW pagination buttons
  paginationView.render(model.state.search);
};

const controlServings = function (newServings) {
  // Update the recipe servings (in state)
  model.updateServings(newServings);

  // Update the recipe view
  // recipeView.render(model.state.recipe);
  recipeView.update(model.state.recipe);
};

const controlAddBookmark = function () {
  //1) Add/remove bookmark
  if (!model.state.recipe.bookmarked) model.addBookmark(model.state.recipe);
  else model.deleteBookmark(model.state.recipe.id);

  //2) Render bookmarks
  recipeView.update(model.state.recipe);

  // 3) Render bookmarks
  bookmarksView.render(model.state.bookmarks);
};

const controlBookmarks = function () {
  bookmarksView.render(model.state.bookmarks);
};

const controlAddRecipe = async function (newRecipe) {
  try {
    // Show loading spinner
    addRecipeView.renderSpinner();

    //Upload the new recipe data
    await model.uploadRecipe(newRecipe);

    //Render recipe
    recipeView.render(model.state.recipe);

    //Success message
    addRecipeView.renderMessage();

    //Render bookmarks view
    bookmarksView.render(model.state.bookmarks);

    //Change ID in the URL
    window.history.pushState(null, '', `#${model.state.recipe.id}`);
  } catch (err) {
    console.error(err);
    addRecipeView.renderError(err.message);
  }
  //Close form window
  setTimeout(function () {
    addRecipeView.toggleWindow();
    location.reload();
  }, MODAL_CLOSE_SEC * 1000);
};

const controlAddToShoppingList = function (ingredient) {
  model.addIngredient(ingredient);
};

const controlPlanMeal = async function (mealData) {
  try {
    await model.addPlannedMeal(mealData);
  } catch (err) {
    recipeView.renderError('We could not get the recipe data. Try again!');
  }
};

const controlResetApp = function () {
  model.clearLocalStorage();
};

const controlTheme = function (actualTheme) {
  let newTheme = 'light';
  if (actualTheme === 'light') newTheme = 'dark';
  model.changeTheme(newTheme);
  themeView.setTheme(newTheme);
};

const initTheme = function () {
  console.log(model.state.theme);
  themeView.setTheme(model.state.theme);
};

const init = function () {
  //Home events
  recipeView.addHandlerRender(controlRecipes);
  recipeView.addHandlerUpdateServings(controlServings);
  recipeView.addHandlerAddBookmark(controlAddBookmark);
  recipeView.addHandlerSubmitPlan(controlPlanMeal);
  recipeView.addHandlerAddIngredient(controlAddToShoppingList);
  searchView.addHandlerSearch(controlSearchResults);
  paginationView.addHandlerClick(controlPagination);
  bookmarksView.addHandlerRender(controlBookmarks);
  addRecipeView.addHandlerUpload(controlAddRecipe);
  initTheme();

  themeView.addHandlerChangeTheme(controlTheme);
};
init();
