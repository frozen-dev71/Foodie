import View from "./View.js";
import icons from "url:../../assets/img/icons.svg"; // Parcel 2

class RecipeView extends View {
  _parentElement = document.querySelector(".recipe");
  _errorMessage = "We could not find that recipe. Please try another one!";
  _message = "";

  addHandlerRender(handler) {
    ["hashchange", "load"].forEach((ev) =>
      window.addEventListener(ev, handler)
    );
  }

  addHandlerUpdateServings(handler) {
    this._parentElement.addEventListener("click", function (e) {
      const btn = e.target.closest(".btn--update-servings");
      if (!btn) return;
      const { updateTo } = btn.dataset;
      if (+updateTo > 0) handler(+updateTo);
    });
  }

  addHandlerAddBookmark(handler) {
    this._parentElement.addEventListener("click", function (e) {
      const btn = e.target.closest(".btn--bookmark");
      if (!btn) return;
      handler();
    });
  }
  addHandlerAddIngredient(handler) {
    this._parentElement.addEventListener('click', function (e) {
      const btn = e.target.closest('.btn--add-ing');
      if (!btn) return;
      const ingQuantity = btn
        .closest('.recipe__ingredient')
        .querySelector('.recipe__quantity').innerText;
      const ingUnitAndDescription = btn
        .closest('.recipe__ingredient')
        .querySelector('.recipe__description').innerText;
      handler(`${ingQuantity} ${ingUnitAndDescription}`);
    });
  }

  addHandlerSubmitPlan(handler) {
    this._parentElement.addEventListener('submit', function (e) {
      e.preventDefault();

      const form = e.target.closest('form');
      if (!form) return;
      const title = this.querySelector('img').alt;
      const img = this.querySelector('img').src;
      const data = {
        weekday: form.querySelector('#weekday').value,
        meal: form.querySelector('#meal').value,
        week: form.querySelector('#week').value,
        recipe: {
          id: window.location.hash,
          title,
          img,
        },
      };
      handler(data);
    });
  }

  scrollToRecipe() {
    this._parentElement.scrollIntoView();
  }

  _generateMarkup() {
    return `
    <figure class="recipe__fig">
      <img src="${this._data.image}" alt="${
      this._data.title
    }" class="recipe__img" />
      <h1 class="recipe__title">
        <span>${this._data.title}</span>
      </h1>
    </figure>

    <div class="recipe__details">
      <div class="recipe__info">
        <svg class="recipe__info-icon">
          <use href="${icons}#icon-clock"></use>
        </svg>
        <span class="recipe__info-data recipe__info-data--minutes">${
          this._data.cookingTime
        }</span>
        <span class="recipe__info-text">minutes</span>
      </div>
      <div class="recipe__info">
        <svg class="recipe__info-icon">
          <use href="${icons}#icon-users"></use>
        </svg>
        <span class="recipe__info-data recipe__info-data--people">${
          this._data.servings
        }</span>
        <span class="recipe__info-text">servings</span>

        <div class="recipe__info-buttons">
          <button class="btn--tiny btn--update-servings" data-update-to="${
            this._data.servings - 1
          }">
            <svg>
              <use href="${icons}#icon-minus-circle"></use>
            </svg>
          </button>
          <button class="btn--tiny btn--update-servings" data-update-to="${
            this._data.servings + 1
          }">
            <svg>
              <use href="${icons}#icon-plus-circle"></use>
            </svg>
          </button>
        </div>
        </div>
        ${
          window.location.pathname.includes('mealplanner') ||
          window.location.pathname.includes('mealPlanner')
            ? ''
            : `
        <div class="recipe__user-generated ${this._data.key ? '' : 'hidden'}">
          <svg>
            <use href="${icons}#icon-user"></use>
          </svg>
        </div>
        <button class="btn--round btn--bookmark">
          <svg class="">
            <use href="${icons}#icon-bookmark${
                this._data.bookmarked ? '-fill' : ''
              }">
            </use>
          </svg>
        </button>
        `
        }  
    </div>

    <!-------------------------RENDER RECIPE NUTRIENTS DATA ONLY IF DATA EXISTS-------------------------->
    ${
      this._data.calories &&
      this._data.carbs &&
      this._data.proteins &&
      this._data.fats
        ? `
    <div class="recipe__nutritional-data">  
      <h2 class="heading--2">Nutritional data / serving</h2>
      <div class="recipe__nutrients">
        <div class="recipe__nutrient-field recipe__calories">
          <h3 class="heading--3">Calories</h3>
          <span class="recipe__nutrient-value">${this._data.calories} kcal</span>
        </div>
        <div class="recipe__nutrient-field recipe__carbs">
          <h3 class="heading--3">Carbs</h3>
          <span class="recipe__nutrient-value">${this._data.carbs} g</span>
        </div>
        <div class="recipe__nutrient-field recipe__proteins">
          <h3 class="heading--3">Proteins</h3>
          <span class="recipe__nutrient-value">${this._data.proteins} g</span>
        </div>
        <div class="recipe__nutrient-field recipe__fats">
          <h3 class="heading--3">Fats</h3>
          <span class="recipe__nutrient-value">${this._data.fats} g</span>
        </div>
      </div>
    </div>
    `
        : ''
    }
    

    <div class="recipe__ingredients">
      <h2 class="heading--2">Recipe ingredients</h2>
      <ul class="recipe__ingredient-list">
      ${this._data.ingredients.map(this._generateMarkupIngredient).join('')}

      </ul>
      <h5 class="recipe__note">Click on <span>&plus;</span>
              to add an ingredient to <a href= ${
                window.location.pathname.includes('mealPlanner') ||
                window.location.pathname.includes('mealplanner')
                  ? `./shoppingList.html`
                  : `./pages/shoppingList.html`
              }
                  >your shopping list</a></h5>
    </div>

    <div class="recipe__directions">
      <h2 class="heading--2">How to cook it</h2>
      <p class="recipe__directions-text">
        This recipe was carefully designed and tested by
        <span class="recipe__publisher">${
          this._data.publisher
        }</span>. Please check out
        directions at their website.
      </p>
      <a
        class="btn--small recipe__btn"
        href="${this._data.sourceUrl}"
        target="_blank"
      >
        <span>Directions</span>
        <svg class="search__icon">
          <use href="${icons}#icon-arrow-right"></use>
        </svg>
      </a>
    </div>
    
    ${
      window.location.pathname.includes('mealPlanner') ||
      window.location.pathname.includes('mealplanner')
        ? ''
        : `
    <div class="recipe__planning">
    <h2 class="heading--2">Plan your meal</h2>
    <form class="recipe__planning-form">

      <label class="recipe__label" for="weekday"> Weekday </label>
      <select class="recipe__select" id="weekday" required>
        <option class="recipe__option" value="" disabled selected hidden>
          Select
        </option>
        <option class="recipe__option" value="0">monday</option>
        <option class="recipe__option" value="1">tuesday</option>
        <option class="recipe__option" value="2">
          wednesday
        </option>
        <option class="recipe__option" value="3">thursday</option>
        <option class="recipe__option" value="4">friday</option>
        <option class="recipe__option" value="5">saturday</option>
        <option class="recipe__option" value="6">sunday</option>
      </select>

      <label class="recipe__label" for="meal"> Meal </label>
      <select class="recipe__select" id="meal" required>
        <option class="recipe__option" value="" disabled selected hidden>
          Select
        </option>
        <option class="recipe__option" value="0">
          breakfast
        </option>
        <option class="recipe__option" value="1">lunch</option>
        <option class="recipe__option" value="2">dinner</option>
        <option class="recipe__option" value="3">desert</option>
      </select>

      <label class="recipe__label" for="week"> Week </label>
      <select class="recipe__select" id="week" required>
        <option class="recipe__option" value="" disabled selected hidden>
          Select
        </option>
        <option class="recipe__option" value="currentWeek">
          current week
        </option>
        <option class="recipe__option" value="nextWeek">
          next week
        </option>
      </select>
      <button class="btn--small recipe__submit" type="submit">
        Submit
      </button>
    </form>
      <h5 class="recipe__note">
        Check your
        <a href="./pages/mealPlanner.html">weekly meal planner</a>
      </h5>
    </div>    
    `
    }
    
`;
  }




  

  _generateMarkupIngredient(ing) {
    return `
    <li class="recipe__ingredient">
      <svg class="recipe__icon">
        <use href="${icons}#icon-check"></use>
      </svg>
      <div class="recipe__quantity">${ing.quantity
        ? // new Fraction
        ing.quantity.toString()
        : ""
      }</div>
      <div class="recipe__description">
        <span class="recipe__unit">${ing.unit}</span>
        ${ing.description}
      </div>
    </li>
  `;
  }
}

export default new RecipeView();
