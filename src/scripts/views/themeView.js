class ThemeView {
	_parentElement = document.documentElement;
	_sliderBtn = document.querySelector('.slider__circle');
  
	setTheme(theme) {
	  document.documentElement.dataset.theme = theme;
	  document.querySelector('.slider__circle').style.left =
		theme === 'dark' ? '4.5rem' : '1rem';
	}
	addHandlerChangeTheme(handler) {
	  document.querySelector('.slider').addEventListener('click', function () {
		const actualTheme = document.documentElement.dataset.theme;
		//   console.log(actualTheme);
		handler(actualTheme);
	  });
	}
  }
  
  export default new ThemeView();
  