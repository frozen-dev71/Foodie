import icons from 'url:../../img/icons.svg';
import View from './View';
import { maxFourWords } from '../helpers.js';

class PlannerView extends View {
  _parentElement = document.querySelector('.planner__grid');

  addHandlerLoadPlanner(handler) {
    window.addEventListener('load', handler);
  }

  addHandlerResetPlanner(handler) {
    document
      .querySelector('.page-options__btn--reset-calendar')
      .addEventListener('click', handler);
  }

  addHandlerDeletePlanned(handler) {
    this._parentElement.addEventListener('click', function (e) {
      const btn = e.target.closest('.planned__remove-btn');

      if (!btn) return;
      const day = btn.closest('.planned').dataset.positionI;
      const meal = btn.closest('.planned').dataset.positionJ;
      // console.log(day, meal);
      handler(day, meal);
    });
  }

  addHandlerDetectChange() {
    this._parentElement
      .closest('.section__planner')
      .querySelector('.planner__form')
      .addEventListener('input', function (e) {
        this.querySelector('.planner__submit').click();
      });
  }

  addHandlerSubmitWeekday(handler) {
    this._parentElement
      .closest('.section__planner')
      .querySelector('.planner__form')
      .addEventListener('submit', function (e) {
        console.log('triggered');
        e.preventDefault();
        const active = +this.querySelector('#weekday').value;
        console.log(active);
        handler(active);
      });
  }

  clearCell(i, j) {
    Array.from(this._parentElement.getElementsByClassName(`planned`)).find(
      el => el.dataset.positionI === i && el.dataset.positionJ === j
    ).innerHTML = '';
  }

  _generateMarkup() {
    const active = this._data.active;
    console.log(active);
    return this._data[this._data.page === 1 ? 'currentWeek' : 'nextWeek']
      .map((day, i) =>
        day
          .map((meal, j) => this._generatePlannerCell(i, j, meal, active))
          .join('')
      )
      .join('');
  }

  _generatePlannerCell(i, j, meal, active) {
    const id = window.location.hash;
    return `
      <div class="planner__recipe planner__recipe--${i + 1}${j + 1} planned ${
      i === active ? 'planner__recipe--active' : ''
    }" data-position-i="${i}" data-position-j="${j}">
        ${
          !meal
            ? ''
            : `
        <a class="planned__link ${
          id === meal.id ? 'planned__link--active' : ''
        }" href="${meal.id}">
            <figure class="planned__fig">
                <img src="${meal.img}" alt="${meal.title}" />
            </figure>
            <h4 class="planned__title">${maxFourWords(meal.title)}</h4>
            
        </a>
        <div class="planned__remove-btn" data-id=${meal.id}>
              <svg>
                <use href="${icons}#icon-bin"></use>
              </svg>
        </div>
        `
        }   
      </div>
      `;
  }
}

export default new PlannerView();
