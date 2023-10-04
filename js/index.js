import { setListeners } from './filters.js';
import { renderPoints } from './map.js';
import { INITIAL_CRIME_COUNT } from './constants.js';

export const state = {
  crimeCount: { ...INITIAL_CRIME_COUNT },
  checkedCrimeType: 'all',
};

setListeners();
renderPoints();
