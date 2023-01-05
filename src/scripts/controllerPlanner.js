import * as model from './model.js';
import recipeView from './views/recipeView.js';
import plannerView from './views/plannerView.js';
import plannerPaginationView from './views/plannerPaginationView.js';
import timeView from './views/timeView.js';
import themeView from './views/themeView.js';

import 'core-js/stable';
import 'regenerator-runtime/runtime';

const controlRecipesPlanner = async function () {
  try {
    const id = window.location.hash.slice(1);

    if (!id) return;
    recipeView.scrollToRecipe();
    recipeView.renderSpinner();

    // 1) Update results view to mark selected search result
    plannerView.render(model.state.planner);

    // 2) Loading recipe
    await model.loadRecipe(id);

    // 3) Rendering recipe
    recipeView.render(model.state.recipe);
  } catch (err) {
    console.error(`${err.message} ⚠⚠⚠`);
    recipeView.renderError();
  }

  // rendering the recipe without the nutritional data
  if (!model.state.recipe.calories) {
    recipeView.render(model.state.recipe);
  }
};

const controlServings = function (newServings) {
  model.updateServings(newServings);
  recipeView.update(model.state.recipe);
};

const controlAddToShoppingList = function (ingredient) {
  model.addIngredient(ingredient);
};

const controlPlannerUI = function () {
  model.changeActive(0);
  plannerView.render(model.state.planner);
};

const controlResetPlanner = function () {
  model.clearPlanner();
  plannerView.render(model.state.planner);
};

const controlDeletePlanned = function (day, meal) {
  model.deleteMeal(day, meal);
  plannerView.clearCell(day, meal);
};

const controlRenderBtns = function () {
  model.changeWeek(1);
  plannerPaginationView.render(model.state.planner);
  plannerView.render(model.state.planner);
};

const controlChangeWeek = function (goToWeek = 1) {
  model.changeWeek(goToWeek);
  plannerPaginationView.render(model.state.planner);
  plannerView.render(model.state.planner);
};

const controlDate = function () {
  timeView.render(model.state.planner);
};

const controlActiveDay = function (active) {
  model.changeActive(active);
  plannerView.render(model.state.planner);
};

const controlTheme = function (actualTheme) {
  let newTheme = 'light';
  if (actualTheme === 'light') newTheme = 'dark';
  model.changeTheme(newTheme);
  themeView.setTheme(newTheme);
};

const initTheme = function () {
  themeView.setTheme(model.state.theme);
};

const init = function () {
  recipeView.addHandlerRender(controlRecipesPlanner);
  recipeView.addHandlerUpdateServings(controlServings);
  recipeView.addHandlerAddIngredient(controlAddToShoppingList);
  plannerView.addHandlerLoadPlanner(controlPlannerUI);
  plannerView.addHandlerResetPlanner(controlResetPlanner);
  plannerView.addHandlerDeletePlanned(controlDeletePlanned);
  plannerView.addHandlerSubmitWeekday(controlActiveDay);
  plannerView.addHandlerDetectChange();
  plannerPaginationView.addHandlerRenderBtns(controlRenderBtns);
  plannerPaginationView.addHandlerChangeWeek(controlChangeWeek);
  timeView.addHandlerRenderDate(controlDate);
  themeView.addHandlerChangeTheme(controlTheme);
  initTheme();
};
init();
