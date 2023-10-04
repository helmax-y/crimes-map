import events from '../mock/events.js';
import {
  CRIME_TYPES,
  LON_DIFFERENCE,
  LAT_DIFFERENCE,
  SOUTH_BORDER_LAT,
  WEST_BORDER_LON,
  INITIAL_CRIME_COUNT,
} from './constants.js';
import { state } from './index.js';
import { renderCount } from './filters.js';

const mapEl = document.querySelector('.map-inner-container');

const getPositioning = (lat, lon) => {
  const bottom = ((lat - SOUTH_BORDER_LAT) / LAT_DIFFERENCE) * 100;
  const left = ((lon - WEST_BORDER_LON) / LON_DIFFERENCE) * 100;

  return { left, bottom };
};

const getAvgCoordinates = (regionEvents) => {
  let eventsTotal = 0;
  const coordinatesTotal = regionEvents.reduce(
    (acc, el) => {
      if (!el.lat || !el.lon) {
        return acc;
      }

      eventsTotal++;

      return {
        totalLat: acc.totalLat + el.lat,
        totalLon: acc.totalLon + el.lon,
      };
    },
    {
      totalLat: 0,
      totalLon: 0,
    }
  );

  return {
    avgLat: coordinatesTotal.totalLat / eventsTotal,
    avgLon: coordinatesTotal.totalLon / eventsTotal,
  };
};

const getWidth = (count) => {
  if (count > 500) {
    return 60;
  }

  if (count > 250) {
    return 50;
  }

  if (count > 100) {
    return 40;
  }

  if (count > 5) {
    return 30;
  }

  return 20;
}

const highlightPoint = (pointEl, crimeType, crimeCount) => {
  if (state.checkedCrimeType !== crimeType) {
    pointEl.textContent = '';
    pointEl.style.zIndex = 0;

    return;
  }

  pointEl.textContent = crimeCount;
  pointEl.style.zIndex = 10;
}

const renderPoint = ({ avgLat: lat, avgLon: lon }, crimeType, crimeCount) => {
  const { left, bottom } = getPositioning(lat, lon);
  const pointEl = document.createElement('div');
  const width = getWidth(crimeCount);

  pointEl.classList.add('point', crimeType);
  pointEl.style.left = `${left}%`;
  pointEl.style.bottom = `${bottom}%`;
  pointEl.style.width = `${width}px`;
  pointEl.style.height = `${width}px`;
  pointEl.dataset.crimeCount = crimeCount;
  pointEl.dataset.crimeType = crimeType;

  highlightPoint(pointEl, crimeType, crimeCount)
  mapEl.appendChild(pointEl);
};

const animatePoints = (pointEls) => {
  pointEls.forEach((el) => {
    el.classList.add('scale-up-down');

    setTimeout(() => {
      el.classList.remove('scale-up-down');
    }, 600);
  });
};

export const renderRegionPoints = (events) => {
  const crimeTypes = Object.keys(CRIME_TYPES);

  crimeTypes.forEach((crimeType) => {
    const crimesByType = events.filter(
      (event) => event.affected_type === +crimeType
    );
    const crimeCount = crimesByType.length;
    const coordinates = getAvgCoordinates(crimesByType);

    state.crimeCount[CRIME_TYPES[crimeType]] += crimeCount;

    if (!coordinates.avgLat || !coordinates.avgLon) {
      return;
    }

    renderPoint(coordinates, CRIME_TYPES[crimeType], crimeCount);
  });
};

export const renderPoints = () => {
  const regions = Object.keys(events);

  regions.forEach((region) => {
    renderRegionPoints(events[region]);
  });

  renderCount();
};

export const rerenderPoints = (region) => {
  const pointEls = mapEl.querySelectorAll('.point');

  pointEls.forEach(el => {
    el.remove();
  })
  state.crimeCount = { ...INITIAL_CRIME_COUNT };

  if (region === 'all') {
    renderPoints();

    return;
  }

  renderRegionPoints(events[region]);
  renderCount();
};

export const refreshPoints = () => {
  const pointEls = mapEl.querySelectorAll('.point');

  animatePoints(pointEls);

  pointEls.forEach(pointEl => {
    const { crimeType, crimeCount } = pointEl.dataset;
    
    highlightPoint(pointEl, crimeType, crimeCount)
  })
};
