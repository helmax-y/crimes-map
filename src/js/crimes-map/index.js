import { styles, initialHTML } from './html.js';
import {
  INITIAL_CRIME_COUNT,
  CRIME_TYPES,
  LON_DIFFERENCE,
  LAT_DIFFERENCE,
  SOUTH_BORDER_LAT,
  WEST_BORDER_LON,
} from './constants.js';

class CrimesMap extends HTMLElement {
  constructor() {
    super();

    const shadowRoot = this.attachShadow({ mode: 'open' });

    shadowRoot.innerHTML = styles + initialHTML;

    this.state = {
      crimeCount: { ...INITIAL_CRIME_COUNT },
      selectedRegion: 'all',
      checkedCrimeType: 'all',
      currentView: 'map',
    };
    this.events = JSON.parse(this.getAttribute('events') || '{}');
    this.names = JSON.parse(this.getAttribute('names') || '{}');

    this.setListeners();
    this.renderPoints();
  }

  get mapEl() {
    return this.shadowRoot.querySelector('.map-outer-container');
  }

  get formEl() {
    return this.shadowRoot.querySelector('.form');
  }

  get listEl() {
    return this.shadowRoot.querySelector('.list');
  }

  getPositioning(lat, lon) {
    const bottom = ((lat - SOUTH_BORDER_LAT) / LAT_DIFFERENCE) * 100;
    const left = ((lon - WEST_BORDER_LON) / LON_DIFFERENCE) * 100;

    return { left, bottom };
  }

  getAvgCoordinates(regionEvents) {
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
  }

  getWidth(count) {
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

  highlightPoint(pointEl, crimeType, crimeCount) {
    if (this.state.checkedCrimeType !== crimeType) {
      pointEl.textContent = '';
      pointEl.style.zIndex = 0;

      return;
    }

    pointEl.textContent = crimeCount;
    pointEl.style.zIndex = 10;
  }

  renderPoint({ avgLat: lat, avgLon: lon }, crimeType, crimeCount) {
    const mapContainerEl = this.mapEl.querySelector('.map-inner-container');
    const { left, bottom } = this.getPositioning(lat, lon);
    const pointEl = document.createElement('div');
    const width = this.getWidth(crimeCount);

    pointEl.classList.add('point', crimeType);
    pointEl.style.left = `${left}%`;
    pointEl.style.bottom = `${bottom}%`;
    pointEl.style.width = `${width}px`;
    pointEl.style.height = `${width}px`;
    pointEl.dataset.crimeCount = crimeCount;
    pointEl.dataset.crimeType = crimeType;

    this.highlightPoint(pointEl, crimeType, crimeCount);
    mapContainerEl.appendChild(pointEl);
  }

  animatePoints(pointEls) {
    pointEls.forEach((el) => {
      el.classList.add('scale-up-down');

      setTimeout(() => {
        el.classList.remove('scale-up-down');
      }, 600);
    });
  }

  renderRegionPoints(events) {
    const crimeTypes = Object.keys(CRIME_TYPES);

    crimeTypes.forEach((crimeType) => {
      const crimesByType = events.filter(
        (event) => event.affected_type === +crimeType
      );
      const crimeCount = crimesByType.length;
      const coordinates = this.getAvgCoordinates(crimesByType);

      this.state.crimeCount[CRIME_TYPES[crimeType]] += crimeCount;

      if (!coordinates.avgLat || !coordinates.avgLon) {
        return;
      }

      this.renderPoint(coordinates, CRIME_TYPES[crimeType], crimeCount);
    });
  }

  renderPoints() {
    const regions = Object.keys(this.events);

    regions.forEach((region) => {
      this.renderRegionPoints(this.events[region]);
    });

    this.renderCount();
  }

  rerenderPoints(region) {
    const pointEls = this.mapEl.querySelectorAll('.point');

    pointEls.forEach((el) => {
      el.remove();
    });
    this.state.crimeCount = { ...INITIAL_CRIME_COUNT };

    if (region === 'all') {
      this.renderPoints();

      return;
    }

    this.renderRegionPoints(this.events[region]);
    this.renderCount();

    const pointEl = this.mapEl.querySelector('.point');

    pointEl?.scrollIntoView({
      behavior: 'smooth',
      inline: 'center',
      block: 'end',
    });
  }

  refreshPoints() {
    const pointEls = this.mapEl.querySelectorAll('.point');

    this.animatePoints(pointEls);

    pointEls.forEach((pointEl) => {
      const { crimeType, crimeCount } = pointEl.dataset;

      this.highlightPoint(pointEl, crimeType, crimeCount);
    });
  }

  renderCount() {
    const crimeTypes = Object.keys(this.state.crimeCount);
    const crimeTypesEl = this.formEl.querySelector('.crime-types');

    crimeTypes.forEach((type) => {
      const countEl = crimeTypesEl.querySelector(`.${type} + .crime-count`);

      countEl.textContent = this.state.crimeCount[type];
    });

    const allEl = crimeTypesEl.querySelector('.all + .crime-count');
    const totalResultsEl = this.formEl.querySelector('.total-results-number');
    const total = Object.values(this.state.crimeCount).reduce(
      (sum, el) => el + sum,
      0
    );

    allEl.textContent = total;
    totalResultsEl.textContent = total;
  }

  highlightCrimeTypePoint(crimeType) {
    const pointEls = this.mapEl.querySelectorAll('.filter-point-option');

    pointEls.forEach((el) => {
      if (crimeType === el.dataset.crimeType || crimeType === 'all') {
        el.classList.add('checked');
      } else {
        el.classList.remove('checked');
      }
    });
  }

  onCrimeTypeChange(crimeType) {
    const badgeEl = this.formEl.querySelector('.badge.crime-type');
    let crimeTypeLabel = this.formEl.querySelector(
      `.radio-line > .${crimeType}`
    ).textContent;

    if (crimeType === 'all') {
      crimeTypeLabel = 'All Crime Types';
    }

    badgeEl.textContent = crimeTypeLabel;
    badgeEl.className = `badge crime-type ${crimeType}`;

    this.state.checkedCrimeType = crimeType;
    this.highlightCrimeTypePoint(crimeType);
    this.refreshPoints();
    this.renderListByTypeAndRegion();
  }

  onRegionChange(region) {
    const badgeEl = this.formEl.querySelector('.badge.region');
    const regionLabel = region === 'all' ? 'All States' : region;

    this.state.selectedRegion = region;
    badgeEl.textContent = regionLabel;
    this.rerenderPoints(region);
    this.renderListByTypeAndRegion();
  }

  initializeCrimeTypeRadios() {
    const radioEls = this.formEl.querySelectorAll(
      '.crime-types input[type=radio]'
    );

    radioEls.forEach((el) => {
      el.addEventListener('change', (event) => {
        const { crimeType } = event.target.dataset;

        this.onCrimeTypeChange(crimeType);
      });
    });
  }

  selectCrimeTypeRadio(crimeType) {
    const radioEl = this.formEl.querySelector(
      `.crime-types input[data-crime-type=${crimeType}]`
    );

    radioEl.checked = true;
  }

  selectRegion(region) {
    const regionSelectEl = this.formEl.querySelector('.region-select');

    regionSelectEl.value = region;
  }

  initializeCrimeTypePoints() {
    const pointEls = this.mapEl.querySelectorAll('.filter-point-option');

    pointEls.forEach((pointEl) => {
      pointEl.addEventListener('click', (event) => {
        let { crimeType } = event.currentTarget.dataset;

        if (crimeType === this.state.checkedCrimeType) {
          crimeType = 'all';
        }

        this.selectCrimeTypeRadio(crimeType);
        this.onCrimeTypeChange(crimeType);
      });
    });
  }

  initializeRegionSelect() {
    const regionSelectEl = this.formEl.querySelector('.region-select');
    const regions = Object.keys(this.events);

    regions.forEach((region) => {
      regionSelectEl.insertAdjacentHTML(
        'beforeend',
        `<option value=${region}>${region}</option>`
      );
    });

    regionSelectEl.addEventListener('change', (event) => {
      this.onRegionChange(event.target.value);
    });
  }

  initializeResetButton() {
    const resetEl = this.formEl.querySelector('.reset-button');

    resetEl.addEventListener('click', () => {
      this.selectCrimeTypeRadio('all');
      this.onCrimeTypeChange('all');

      if (
        this.state.currentView === 'map' &&
        this.state.selectedRegion !== 'all'
      ) {
        this.selectRegion('all');
        this.onRegionChange('all');
      }
    });
  }

  initializeToggleFormButton() {
    const filtersEl = this.shadowRoot.querySelector('.filters');
    const buttonEl = filtersEl.querySelector('.toggle-button');
    const iconEl = buttonEl.firstElementChild;

    buttonEl.addEventListener('click', () => {
      const { isOpen } = buttonEl.dataset;

      if (isOpen === 'true') {
        filtersEl.style.top = '88%';
        buttonEl.dataset.isOpen = false;
        iconEl.src = './src/assets/icons/open.svg';
      } else {
        filtersEl.style.top = '10%';
        buttonEl.dataset.isOpen = true;
        iconEl.src = './src/assets/icons/close.svg';
      }
    });
  }

  onListMountUnmount(isMounted) {
    const allOptionEl = this.formEl.querySelector(
      '.region-select > option[value=all]'
    );

    allOptionEl.disabled = isMounted;

    if (isMounted && this.state.selectedRegion === 'all') {
      const regionOne = Object.keys(this.events)[0];

      this.selectRegion(regionOne);
      this.onRegionChange(regionOne);
    }

    this.renderListByTypeAndRegion();
  }

  renderListByTypeAndRegion() {
    const { checkedCrimeType: crimeType, selectedRegion: region } = this.state;

    if (region === 'all') {
      return;
    }

    this.state.crimeCount = { ...INITIAL_CRIME_COUNT };

    const events = this.events[region].filter(
      ({ affected_type: affectedType }) => {
        if (!affectedType) {
          return false;
        }

        this.state.crimeCount[CRIME_TYPES[affectedType]]++;

        return crimeType === 'all' || CRIME_TYPES[affectedType] === crimeType;
      }
    );

    this.listEl.innerHTML = '';

    events.forEach(({ event, affected_type: affectedType }) => {
      const title = this.names[0].event?.[event] || '';
      const crimeType = this.names[0].affected_type?.[affectedType] || '';

      this.listEl.insertAdjacentHTML(
        'beforeend',
        `
        <section class="list-card">
          <h3>${title}</h3>
          <h4>Crime Type:</h4>
          <p>${crimeType}</p>
        </section>
      `
      );
    });

    if (!events.length) {
      this.listEl.insertAdjacentHTML(
        'beforeend',
        `
        <p>No Events</p>
      `
      );
    }

    this.renderCount();
  }

  initializeNavigation() {
    const listButtonEl = this.shadowRoot.querySelector('.list-button');
    const mapButtonEl = this.shadowRoot.querySelector('.map-button');
    const mobileListTogglerEl = this.shadowRoot.querySelector(
      '.mobile-list-toggler'
    );

    const onListOpen = () => {
      if (this.state.currentView === 'list') {
        return;
      }

      this.onListMountUnmount(true);

      this.mapEl.style.display = 'none';
      this.listEl.style.display = 'grid';
      this.state.currentView = 'list';
      mobileListTogglerEl.firstElementChild.src =
        './src/assets/icons/locator.svg';
    };

    const onMapOpen = () => {
      if (this.state.currentView === 'map') {
        return;
      }

      this.onListMountUnmount(false);

      this.mapEl.style.display = 'block';
      this.listEl.style.display = 'none';
      this.state.currentView = 'map';
      mobileListTogglerEl.firstElementChild.src = './src/assets/icons/list.svg';

      this.rerenderPoints(this.state.selectedRegion);
    };

    listButtonEl.addEventListener('click', onListOpen);
    mapButtonEl.addEventListener('click', onMapOpen);
    mobileListTogglerEl.addEventListener('click', () => {
      if (this.state.currentView === 'list') {
        onMapOpen();
      } else {
        onListOpen();
      }
    });
  }

  setListeners() {
    this.initializeCrimeTypeRadios();
    this.initializeCrimeTypePoints();
    this.initializeRegionSelect();
    this.initializeResetButton();
    this.initializeToggleFormButton();
    this.initializeNavigation();
  }
}

customElements.define('crimes-map', CrimesMap);
