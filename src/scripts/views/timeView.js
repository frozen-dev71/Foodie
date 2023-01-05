import View from './View';
import { formatDate } from '../helpers.js';

class TimeView extends View {
  _parentElement = document.querySelector('.planner__date');

  addHandlerRenderDate(handler) {
    window.addEventListener('load', handler);
  }

  _generateMarkup() {
    return `
    <div class="planner__date-label">
        <div class="planner__date-text">${formatDate()}</div>
    </div>
    `;
  }
}

export default new TimeView();
