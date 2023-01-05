import View from './View.js';
import icons from 'url:../../assets/img/icons.svg';

class ListView extends View {
  // _parentElement = document.querySelector('.list__shopping-list');
  _parentElement = document.querySelector('.list__list-container');
  _message =
    "Choose a recipe and start adding some ingredients to your shopping list or click 'Edit' to add your own items!";
  _buttonClear = document.querySelector('.list__btn-delete');
  _buttonDownload = document.querySelector('.list__btn-download');
  _buttonEdit = document.querySelector('.list__btn-edit');
  _buttonNav = document.querySelector('.page-options__btn--reset');
  listToDownload = document.getElementById('list');

  addHandlerRenderList(handler) {
    window.addEventListener('load', handler);
    this.renderMessageInsideList();
  }

  addHandlerReset(handler) {
    this._buttonNav.addEventListener('click', function () {
      handler();
    });
  }

  addHandlerCheck(handler) {
    this._parentElement.addEventListener('click', function (e) {
      const btn = e.target.closest('.btn--check');
      if (!btn) return;
      const ingredient = e.target
        .closest('.list__item')
        .querySelector('.list__ing').innerText;
      handler(ingredient);
    });
  }

  addHandlerClear(handler) {
    this._parentElement.addEventListener('click', function (e) {
      const btn = e.target.closest('.list__btn-delete');

      if (!btn) return;
      handler('listView');
    });
  }

  addHandlerDownload(handler) {
    this._parentElement.addEventListener('click', function (e) {
      const btn = e.target.closest('.list__btn-download');

      if (!btn) return;
      handler();
    });
  }

  addHandlerEditList(handler) {
    this._parentElement.addEventListener('click', function (e) {
      const btn = e.target.closest('.list__btn-edit');

      if (!btn) return;
      handler();
    });
  }

  _generateMarkup() {
    return ` 
    <h3 class="list__title"><span>${this._data[0]}</span></h3>
    
    <ul class="list__shopping-list">
    ${this._data.slice(1).map(this._generateMarkupItem).join('')}
    </ul>

    <div class="list__options">
                <button class="btn--list list__btn-edit">
                  <svg class="list__icon">
                    <use href="${icons}#icon-edit-pencil"></use>
                  </svg>
                </button>
                <button class="btn--list list__btn-delete">
                  <svg class="list__icon">
                    <use href="${icons}#icon-bin"></use>
                  </svg>
                </button>
                <button class="btn--list list__btn-download">
                  <svg class="list__icon">
                    <use href="${icons}#icon-download"></use>
                  </svg>
                </button>
              </div>
    `;
  }
  _generateMarkupItem(item) {
    return `
    <li class="list__item">
    <div class="list__ing">${item}</div>
    <div class="list__item-buttons">
      <button class="btn--tiny btn--check">
        <svg>
          <title>Check</title>
          <use href="${icons}#icon-checkmark"></use>
        </svg>
      </button>
    </div>
  </li>
    `;
  }

  renderMessageInsideList(message = this._message) {
    const markup = `
    <h3 class="list__title"><span>MY SHOPPING LIST</span></h3>

    <ul class="list__shopping-list" id="list">
      <div class="message">
        <div>
          <svg>
            <use href="${icons}#icon-smile"></use>
           </svg>
        </div>
        <p>${message}</p>
      </div>
    </ul>

    <div class="list__options">
      <button class="btn--list list__btn-edit">
        <svg class="list__icon">
          <use href="${icons}#icon-edit-pencil"></use>
        </svg>
      </button>
      <button class="btn--list list__btn-delete">
        <svg class="list__icon">
          <use href="${icons}#icon-bin"></use>
        </svg>
      </button>
      <button class="btn--list list__btn-download">
        <svg class="list__icon">
          <use href="${icons}#icon-download"></use>
        </svg>
      </button>
    </div>
      `;
    this._clear();
    this._parentElement.insertAdjacentHTML('afterbegin', markup);
  }
}

export default new ListView();
