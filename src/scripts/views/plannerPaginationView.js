import icons from 'url:../../assets/img/icons.svg';
import { clearIngredients } from '../model';
import View from './View';

class PlannerPaginationView extends View {
  _parentElement = document.querySelector('.planner__pagination');

  addHandlerRenderBtns(handler) {
    window.addEventListener('load', handler);
  }

  addHandlerChangeWeek(handler) {
    this._parentElement.addEventListener('click', function (e) {
      const btn = e.target.closest('.btn--week');
      if (!btn) return;

      const goToWeek = +btn.dataset.goToWeek;
      handler(goToWeek);
    });
  }

  _generateMarkup() {
    const currentPage = this._data.page;
    if (currentPage === 1)
      return `
      <button class="btn--week pagination__btn--next" data-go-to-week="${
        currentPage + 1
      }">
        <span>Next week</span>
        <svg class="search__icon">
          <use href="${icons}#icon-arrow-right"></use>
        </svg>
      </button>
      `;
    if (currentPage === 2) {
      return `
      <button class="btn--week pagination__btn--prev" data-go-to-week="${
        currentPage - 1
      }">
        <svg class="search__icon">
          <use href="${icons}#icon-arrow-left"></use>
        </svg>
        <span>Current week</span>
      </button>
      `;
    }
  }
}

export default new PlannerPaginationView();
