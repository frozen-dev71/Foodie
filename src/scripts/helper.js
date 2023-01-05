import { TIMEOUT_SEC } from './config.js';
import { MS_PER_DAY } from './config.js';

import { async } from 'regenerator-runtime';

const timeout = function (s) {
  return new Promise(function (_, reject) {
    setTimeout(function () {
      reject(new Error(`Request took too long! Timeout after ${s} second`));
    }, s * 1000);
  });
};

export const AJAX = async function (
  url,
  uploadData = undefined,
  contentType = undefined
) {
  try {
    const fetchPro = uploadData
      ? fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': contentType,
          },
          body:
            contentType === `application/json`
              ? JSON.stringify(uploadData)
              : new URLSearchParams(uploadData),
        })
      : fetch(url);

    const response = await Promise.race([fetchPro, timeout(TIMEOUT_SEC)]);
    const data = await response.json();

    if (!response.ok) throw new Error(`${data.message} ${response.status}`);

    return data;
  } catch (err) {
    throw err;
  }
};

export const formatIngredientsArr = function (newRecipe) {
  const ingredientsDataArr = Object.entries(newRecipe)
    .filter(entry => entry[0].startsWith('ingredient'))
    .map(ingData => {
      const ingIndex = +ingData[0].split('-').slice(-2, -1) - 1;
      const [ingType] = ingData[0].split('-').slice(-1);
      const ingValue = ingData[1];
      return [ingIndex, ingType, ingValue];
    });
  const ingQuantity = ingredientsDataArr.filter(curr => curr[1] === 'quantity');
  const ingUnit = ingredientsDataArr.filter(curr => curr[1] === 'unit');
  const ingDescription = ingredientsDataArr.filter(
    curr => curr[1] === 'description'
  );
  const ingredients = [];
  for (let i = 0; i < 8; i++) {
    if (
      ingQuantity[i][2] === '' &&
      ingUnit[i][2] === '' &&
      ingDescription[i][2] === ''
    )
      break;
    ingredients.push({
      quantity: ingQuantity[i][2] ? +ingQuantity[i][2] : null,
      unit: ingUnit[i][2],
      description: ingDescription[i][2],
    });
  }
  return ingredients;
};

export const maxFourWords = function (string) {
  const words = string.split(' ');
  if (words.length <= 4) return string;
  if (words.length > 4) return words.filter((_, i) => i < 4).join(' ') + '...';
};

export const calcDaysPassed = function (date1, date2) {
  return Math.abs(date2 - date1) / MS_PER_DAY;
};

/**
 * Formats a date using the Internalization API
 * @param {String | Object} date result of new Date()
 */
export const formatDate = function () {
  const options = {
    day: 'numeric',
    weekday: 'long',
    month: 'long',
    year: 'numeric',
  };
  return new Intl.DateTimeFormat('en-US', options).format(new Date());
};