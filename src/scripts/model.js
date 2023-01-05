import { async } from 'regenerator-runtime';
import {
  API_URL,
  KEY,
  SPOONACULAR_API_KEY,
  SPOONACULAR_ENDPOINT,
} from './config.js';
import { RES_PER_PAGE, MS_PER_DAY, FIRST_MONDAY } from './config.js';
import { SERVINGS_TO_UPLOAD } from './config.js';
import { AJAX, formatIngredientsArr, calcDaysPassed } from './helper.js';

export const state = {
  theme: 'light',
  recipe: {},
  search: {
    query: '',
    results: [],
    resultsPerPage: RES_PER_PAGE,
    page: 1,
  },
  bookmarks: [],
  ingredientsList: [],
  planner: {
    currentWeek: [
      ['', '', '', ''],
      ['', '', '', ''],
      ['', '', '', ''],
      ['', '', '', ''],
      ['', '', '', ''],
      ['', '', '', ''],
      ['', '', '', ''],
    ],
    nextWeek: [
      ['', '', '', ''],
      ['', '', '', ''],
      ['', '', '', ''],
      ['', '', '', ''],
      ['', '', '', ''],
      ['', '', '', ''],
      ['', '', '', ''],
    ],
    page: 1,
    date: new Date(),
    active: 0,
  },
  lastMonday: FIRST_MONDAY,
};

const createRecipeObject = function (data) {
  const { recipe } = data.data;
  return {
    id: recipe.id,
    title: recipe.title,
    publisher: recipe.publisher,
    sourceUrl: recipe.source_url,
    image: recipe.image_url,
    servings: recipe.servings,
    cookingTime: recipe.cooking_time,
    ingredients: recipe.ingredients,
    ...(recipe.key && { key: recipe.key }),
    // does key: recipe.key if the key exists
  };
};

const getTotalNutrientAmount = function (ingredientsArr, nutrient) {
  return ingredientsArr
    .map(
      ing =>
        ing.nutrition?.nutrients.find(
          nutr => nutr.name === nutrient[0].toUpperCase() + nutrient.slice(1)
        )?.amount ?? 0
    )
    .reduce((acc, ingNutr) => acc + ingNutr, 0);
};

export const loadRecipe = async function (id) {
  try {
    const data = await AJAX(`${API_URL}${id}?key=${KEY}`);
    state.recipe = createRecipeObject(data);

    //Check for bookmarks
    if (state.bookmarks.some(bookmark => bookmark.id === id)) {
      state.recipe.bookmarked = true;
    } else state.recipe.bookmarked = false;

    const ingredientList = state.recipe.ingredients
      .map(ing => `${ing.quantity ?? ''} ${ing.unit ?? ''} ${ing.description}`)
      .join('\n');

    const ingredientsData = await AJAX(
      `${SPOONACULAR_ENDPOINT}?apiKey=${SPOONACULAR_API_KEY}`,
      {
        ingredientList: ingredientList,
        servings: state.recipe.servings,
        includeNutrition: true,
      },
      'application/x-www-form-urlencoded'
    );
    const calories = getTotalNutrientAmount(ingredientsData, 'calories');
    const carbs = getTotalNutrientAmount(ingredientsData, 'carbohydrates');
    const proteins = getTotalNutrientAmount(ingredientsData, 'protein');
    const fats = getTotalNutrientAmount(ingredientsData, 'fat');
    state.recipe.calories = Math.floor(calories / state.recipe.servings);
    state.recipe.carbs = Math.floor(carbs / state.recipe.servings);
    state.recipe.proteins = Math.floor(proteins / state.recipe.servings);
    state.recipe.fats = Math.floor(fats / state.recipe.servings);

    // console.log(state.recipe);
  } catch (err) {
    if (err.message.slice(-3) === '402') {
      state.recipe.calories = undefined;
      state.recipe.carbs = undefined;
      state.recipe.proteins = undefined;
      state.recipe.proteins = undefined;
    }

    throw err;
  }
};

export const loadSearchResults = async function (query) {
  try {
    state.search, (query = query);
    const data = await AJAX(`${API_URL}?search=${query}&key=${KEY}`);

    state.search.results = data.data.recipes.map(rec => {
      return {
        id: rec.id,
        title: rec.title,
        publisher: rec.publisher,
        image: rec.image_url,
        ...(rec.key && { key: rec.key }),
      };
    });

    state.search.page = 1;
  } catch (err) {
    console.error(`${err} ⚠⚠⚠`);
    throw err;
  }
};

export const getSearchResultsPage = function (page = state.search.page) {
  state.search.page = page;
  const start = (page - 1) * state.search.resultsPerPage;
  const end = page * state.search.resultsPerPage;
  return state.search.results.slice(start, end);
};

export const updateServings = function (newServings) {
  state.recipe.ingredients.forEach(ing => {
    ing.quantity = (ing.quantity * newServings) / state.recipe.servings;
    // newQt = oldQt * newServings / oldServings
  });
  state.recipe.servings = newServings;
};

const persistBookmarks = function () {
  localStorage.setItem('bookmarks', JSON.stringify(state.bookmarks));
};

export const addBookmark = function (recipe) {
  // Add bookmark
  state.bookmarks.push(recipe);

  //Mark current recipe as bookmarked
  if (recipe.id === state.recipe.id) {
    state.recipe.bookmarked = true;
  }

  persistBookmarks();
};

export const deleteBookmark = function (id) {
  //Delete bookmark
  const index = state.bookmarks.findIndex(el => el.id === id);
  state.bookmarks.splice(index, 1);

  //Mark current recipe as not bookmarked
  if (id === state.recipe.id) {
    state.recipe.bookmarked = false;
  }

  persistBookmarks();
};

export const uploadRecipe = async function (newRecipe) {
  try {
    //Getting the ingredients from the form
    const ingredients = formatIngredientsArr(newRecipe);

    // Preparing the recipe object for API POST request
    const recipe = {
      title: newRecipe.title,
      source_url: newRecipe.sourceUrl,
      image_url: newRecipe.image,
      publisher: newRecipe.publisher,
      cooking_time: +newRecipe.cookingTime,
      servings: SERVINGS_TO_UPLOAD,
      ingredients,
    };
    const data = await AJAX(
      `${API_URL}?key=${KEY}`,
      recipe,
      `application/json`
    );

    state.recipe = createRecipeObject(data);
    addBookmark(state.recipe);
  } catch (err) {
    throw err;
  }
};

const persistIngredients = function () {
  localStorage.setItem('ingredients', JSON.stringify(state.ingredientsList));
};

export const clearIngredients = function () {
  // localStorage.removeItem('ingredients');
  state.ingredientsList = ['My shopping list'];

  persistIngredients();
};

export const addIngredient = function (ingredient) {
  state.ingredientsList.push(ingredient);
  persistIngredients();
};

export const removeIngredient = function (ingredient) {
  const ingIndex = state.ingredientsList.findIndex(
    ing => ing.trim() === ingredient.trim()
  );
  state.ingredientsList.splice(ingIndex, 1);
  persistIngredients();
};

export const submitListData = function (formData) {
  clearIngredients();
  if (formData[0][1] === '') formData[0][1] = 'My shopping list';
  const newArray = formData.map(ing => ing[1]).filter(ing => ing !== '');

  state.ingredientsList = newArray;
  persistIngredients();
};

const persistPlanner = function () {
  localStorage.setItem('plannerData', JSON.stringify(state.planner));
};
export const clearPlanner = function () {
  localStorage.removeItem('plannerData');
  state.planner = {
    currentWeek: [
      ['', '', '', ''],
      ['', '', '', ''],
      ['', '', '', ''],
      ['', '', '', ''],
      ['', '', '', ''],
      ['', '', '', ''],
      ['', '', '', ''],
    ],
    nextWeek: [
      ['', '', '', ''],
      ['', '', '', ''],
      ['', '', '', ''],
      ['', '', '', ''],
      ['', '', '', ''],
      ['', '', '', ''],
      ['', '', '', ''],
    ],
    page: 1,
    date: new Date(),
    active: 0,
  };
  persistPlanner();
};

export const deleteMeal = function (indexDay, indexMeal) {
  state.planner[state.planner.page === 1 ? 'currentWeek' : 'nextWeek'][
    indexDay
  ][indexMeal] = '';
  persistPlanner();
};

export const addPlannedMeal = function (meal) {
  state.planner[meal.week][meal.weekday][meal.meal] = meal.recipe;
  persistPlanner();
};
export const changeWeek = function (newWeek) {
  state.planner.page = newWeek;
  persistPlanner();
};
export const changeActive = function (active) {
  state.planner.active = active;
  persistPlanner();
};

const updateWeek = function () {
  const newCurrent = state.planner.nextWeek.map(day => day.map(meal => meal));
  const newNext = [
    ['', '', '', ''],
    ['', '', '', ''],
    ['', '', '', ''],
    ['', '', '', ''],
    ['', '', '', ''],
    ['', '', '', ''],
    ['', '', '', ''],
  ];
  console.log(newCurrent);
  state.planner.currentWeek = newCurrent;
  state.planner.nextWeek = newNext;
  persistPlanner();
};

const persistMonday = function () {
  localStorage.setItem('lastMonday', JSON.stringify(state.lastMonday));
};

const updateDate = function () {
  // console.log(state.lastMonday);
  // console.log(new Date());
  const passedDays = Math.trunc(calcDaysPassed(state.lastMonday, new Date()));

  // There have passed less than 7 days
  if (passedDays < 7) return;

  // It has passed exactly one week => it's monday
  if (passedDays === 7) {
    state.lastMonday = new Date();
    updateWeek();
  }

  // It has passed more than a week
  if (passedDays > 7) {
    const weeks = Math.trunc(passedDays / 7);
    const remainder = passedDays % 7;

    state.lastMonday = new Date() - remainder * MS_PER_DAY;

    // Update if there has passed only one week
    if (weeks === 1) updateWeek();

    // Empty if there have passed 2+ weeks
    if (weeks > 1) {
      state.planner.currentWeek = [
        ['', '', '', ''],
        ['', '', '', ''],
        ['', '', '', ''],
        ['', '', '', ''],
        ['', '', '', ''],
        ['', '', '', ''],
        ['', '', '', ''],
      ];
      state.planner.nextWeek = [
        ['', '', '', ''],
        ['', '', '', ''],
        ['', '', '', ''],
        ['', '', '', ''],
        ['', '', '', ''],
        ['', '', '', ''],
        ['', '', '', ''],
      ];
    }
  }
  persistMonday(); //Update in local storage
};

const clearDate = function () {
  localStorage.removeItem('lastMonday');
};
// clearDate();

export const clearLocalStorage = function () {
  clearDate();
  clearPlanner();
  localStorage.removeItem('bookmarks');
  localStorage.removeItem('lastMonday');
};

const persistTheme = function () {
  localStorage.setItem('theme', JSON.stringify(state.theme));
};

export const changeTheme = function (theme) {
  state.theme = theme;
  persistTheme();
};

const init = function () {
  const bookmarksStorage = localStorage.getItem('bookmarks');
  const ingListStorage = localStorage.getItem('ingredients');
  const plannedMealsStorage = localStorage.getItem('plannerData');
  const mondayStorage = localStorage.getItem('lastMonday');
  const themeStorage = localStorage.getItem('theme');
  if (bookmarksStorage) state.bookmarks = JSON.parse(bookmarksStorage);
  if (ingListStorage) state.ingredientsList = JSON.parse(ingListStorage);
  if (!ingListStorage) state.ingredientsList = ['My shopping list'];
  if (plannedMealsStorage) state.planner = JSON.parse(plannedMealsStorage);
  if (themeStorage) state.theme = JSON.parse(themeStorage);

  // Sense time
  if (mondayStorage) state.lastMonday = new Date(JSON.parse(mondayStorage));
  if (!mondayStorage) state.lastMonday = new Date(FIRST_MONDAY);
  updateDate();
};
init();