import View from './View.js';
import icons from 'url:../../assets/img/icons.svg';

class FormView extends View {
  _parentElement = document.querySelector('.list__list-container');

  // Form handlers
  addHandlerSubmit(handler) {
    this._parentElement.addEventListener('click', function (e) {
      e.preventDefault();
      const btn = e.target.closest('.list__btn-submit');

      if (!btn) return;
      const formData = [...new FormData(this.querySelector('form'))];
      handler(formData);
    });
  }

  addHandlerAddItem(handler) {
    this._parentElement.addEventListener('click', function (e) {
      const btn = e.target.closest('.list__btn-add');

      if (!btn) return;
      handler();
    });
  }

  addHandlerClear(handler) {
    this._parentElement.parentElement.addEventListener('click', function (e) {
      const btn = e.target.closest('.list__btn-clear-form');

      if (!btn) return;
      handler('formView');
    });
  }

  addHandlerRemoveItem(handler) {
    this._parentElement.addEventListener('click', function (e) {
      const btn = e.target.closest('.btn--discard');
      if (!btn) return;
      const item = e.target.closest('.list__item');
      handler(item);
    });
  }

  // Event delegation for clearing the dragging on input focus
  addHandlerOnFocus() {
    this._parentElement.addEventListener('onfocusin', function (e) {
      const input = e.target.closest('.form__input');
      if (!input) return;
      input.parentNode.setAttribute('draggable', false);
      console.log(input.parentNode);
    });
  }

  addHandlerOnBlur() {
    this._parentElement.addEventListener('onfocusout', function (e) {
      const input = e.target.closest('.form__input');
      if (!input) return;
      input.parentNode.setAttribute('draggable', true);
      console.log(input.parentNode);
    });
  }

  // Drag and drop events for list items
  addHandlerDragover() {
    this._parentElement.addEventListener('dragover', this._dragover.bind(this));
  }

  addHandlerDragstart() {
    this._parentElement.addEventListener('dragstart', function (e) {
      const draggable = e.target.closest('.list__item--draggable');

      if (!draggable) return;
      draggable.classList.add('list__item--draggable-dragging');
    });
  }

  addHandlerDragend() {
    this._parentElement.addEventListener('dragend', function (e) {
      const draggable = e.target.closest('.list__item--draggable');

      if (!draggable) return;
      draggable.classList.remove('list__item--draggable-dragging');
    });
  }

  //Drag and drop helpers
  _dragover(e) {
    e.preventDefault();
    const container = e.target.closest('.list__shopping-list');

    if (!container) return;
    const afterElement = this._getDragAfterElement(container, e.clientY);
    const draggable = document.querySelector('.list__item--draggable-dragging');
    if (afterElement == null) {
      container.appendChild(draggable);
    } else {
      container.insertBefore(draggable, afterElement);
    }
  }

  _getDragAfterElement(container, y) {
    const draggableEls = [
      ...container.querySelectorAll(
        '.list__item--draggable:not(.list__item--draggable-dragging)'
      ),
    ];

    return draggableEls.reduce(
      (closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;
        if (offset < 0 && offset > closest.offset) {
          return { offset: offset, element: child };
        } else return closest;
      },
      { offset: Number.NEGATIVE_INFINITY }
    ).element;
  }

  // Form actions functions
  addListItem() {
    const markup = this._generateInputField();
    this._parentElement
      .querySelector('.list__shopping-list')
      .insertAdjacentHTML('beforeend', markup);
  }

  removeListItem(item) {
    this._parentElement.querySelector('.list__shopping-list').removeChild(item);
  }

  clearForm() {
    let listToClear = this._parentElement.querySelector('.list__shopping-list');
    listToClear.innerHTML = '';
    this.addListItem();
  }

  //Functions for rendering
  _generateMarkup() {
    return `
    <form>
    <h3 class="list__title list__title--form"><span><input placeholder="My shopping list" class="form__title" name="title" value="${
      this._data[0]
    }"></input></span></h3>

    
    <ul class="list__shopping-list">
      ${this._data
        .slice(1)
        .map(item => this._generateInputField(item))
        .join('')}
    </ul>
    </form>
    <div class="list__options form__buttons">
      <button class="btn--list list__btn-add">
        <svg class="list__icon list__icon--add">
          <use href="${icons}#icon-plus"></use>
        </svg>
      </button>
      <button class="btn--list list__btn-clear-form">
        <svg class="list__icon">
          <use href="${icons}#icon-bin"></use>
        </svg>
      </button>
      <button class="btn--list list__btn-submit">
        <svg class="list__icon">
          <use href="${icons}#icon-checkmark"></use>
        </svg>
      </button>
    </div>
    `;
  }

  _generateInputField(item = '') {
    return `
    <li class="list__item list__item--draggable" draggable="true">
      <input class="list__ing form__input" placeholder="Your item here" name="item" value="${item}"></input>
      <div class="list__item-buttons">
        <button class="btn--tiny btn--discard">
         <svg>
            <use href="${icons}#icon-minus"></use>
          </svg>
        </button>
      </div>
    </li>
    `;
  }
}
export default new FormView();
