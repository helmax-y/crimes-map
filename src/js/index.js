import events from '../mock/events.js';
import names from '../mock/names.js';

const crimesMapEl = document.querySelector('crimes-map');

crimesMapEl.setAttribute('events', JSON.stringify(events));
crimesMapEl.setAttribute('names', JSON.stringify(names));
