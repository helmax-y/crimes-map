import { state } from './index.js';
import { refreshPoints, rerenderPoints } from './map.js';
import events from '../mock/events.js';

const formEl = document.querySelector('.form');

export const renderCount = () => {
  const crimeTypes = Object.keys(state.crimeCount);
  const crimeTypesEl = formEl.querySelector('.crime-types');

  crimeTypes.forEach((type) => {
    const countEl = crimeTypesEl.querySelector(`.${type} + .crime-count`);

    countEl.textContent = state.crimeCount[type];
  });

  const allEl = crimeTypesEl.querySelector('.all + .crime-count');
  const totalResultsEl = formEl.querySelector('.total-results-number');
  const total = Object.values(state.crimeCount).reduce(
    (sum, el) => el + sum,
    0
  );

  allEl.textContent = total;
  totalResultsEl.textContent = total;
};

const highlightCrimeTypePoint = (crimeType) => {
  const pointEls = document.querySelectorAll('.filter-point-option');

  pointEls.forEach((el) => {
    if (crimeType === el.dataset.crimeType || crimeType === 'all') {
      el.classList.add('checked');
    } else {
      el.classList.remove('checked');
    }
  });
};

const onCrimeTypeChange = (crimeType) => {
  state.checkedCrimeType = crimeType;
  refreshPoints();
};

const initializeCrimeTypeRadios = () => {
  const radioEls = formEl.querySelectorAll('.crime-types input[type=radio]');

  radioEls.forEach((el) => {
    el.addEventListener('change', (event) => {
      const { crimeType } = event.target.dataset;

      highlightCrimeTypePoint(crimeType);
      onCrimeTypeChange(crimeType);
    });
  });
};

const initializeCrimeTypePoints = () => {
  const pointEls = document.querySelectorAll('.filter-point-option');

  pointEls.forEach((pointEl) => {
    pointEl.addEventListener('click', (event) => {
      let { crimeType } = event.currentTarget.dataset;

      if (crimeType === state.checkedCrimeType) {
        crimeType = 'all';
      }

      const radioEl = formEl.querySelector(
        `.crime-types input[data-crime-type=${crimeType}]`
      );

      radioEl.checked = true;
      highlightCrimeTypePoint(crimeType);
      onCrimeTypeChange(crimeType);
    });
  });
};

const initializeRegionSelect = () => {
  const regionSelectEl = formEl.querySelector('.region-select');
  const regions = Object.keys(events);

  regions.forEach((region) => {
    regionSelectEl.insertAdjacentHTML(
      'beforeend',
      `<option value=${region}>${region}</option>`
    );
  });

  regionSelectEl.addEventListener('change', (event) => {
    rerenderPoints(event.target.value);
  });
};

const initializeResetButton = () => {
  const resetEl = formEl.querySelector('.reset-button');

  resetEl.addEventListener('click', () => {
    const radioEl = formEl.querySelector(
      `.crime-types input[data-crime-type=all]`
    );
    const regionSelectEl = formEl.querySelector('.region-select');

    regionSelectEl.value = 'all';
    radioEl.checked = true;
    highlightCrimeTypePoint('all');
    rerenderPoints('all');
    onCrimeTypeChange('all');
  });
}

export const setListeners = () => {
  initializeCrimeTypeRadios();
  initializeCrimeTypePoints();
  initializeRegionSelect();
  initializeResetButton();
};
