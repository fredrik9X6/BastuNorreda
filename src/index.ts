import flatpickr from 'flatpickr';
import { Swedish } from 'flatpickr/dist/l10n/sv.js';

import type { Event } from './types';

const getEvents = (): Event[] => {
  const scripts = document.querySelectorAll<HTMLScriptElement>('[data-element="event-data"]');
  const events = [...scripts].map((script) => {
    const event: Event = JSON.parse(script.textContent!);
    event.start = new Date(event.start);
    event.end = new Date(event.end);

    return event;
  });

  // Get the last part of the current URL
  const currentUrl = window.location.href;
  const lastPart = currentUrl.substr(currentUrl.lastIndexOf('/') + 1);

  // Filter items where "stugaid" matches the last part of the URL
  const filteredEvents = events.filter((event) => event.stugaid === lastPart);

  return filteredEvents;
};

const getBookedDates = (lodge: string): string[] => {
  return getEvents()
    .filter((event) => event.lodge === lodge)
    .map((event) => {
      const startDate = new Date(event.start);
      startDate.setDate(startDate.getDate() + 1); // Shift the startDate by one day later
      return startDate.toISOString().split('T')[0];
    });
};

window.Webflow ||= [];
window.Webflow.push(() => {
  const events = getEvents();
  console.log(events);

  const lodgeRates = {
    sportstugan: {
      weekdayRate: 1050,
      weekendRate: 1550,
    },
    torpet: {
      weekdayRate: 800,
      weekendRate: 1300,
    },
    ladan: {
      weekdayRate: 500,
      weekendRate: 650,
    },
    visthusetnedre: {
      weekdayRate: 200,
      weekendRate: 250,
    },
    visthusetovre: {
      weekdayRate: 150,
      weekendRate: 200,
    },
    sovstugan: {
      weekdayRate: 250,
      weekendRate: 300,
    },
    bastun: {
      weekdayRate: 100,
      weekendRate: 100,
    },
  };

  const fp = flatpickr('#bastun', {
    mode: 'multiple',
    dateFormat: 'Y-m-d',
    minDate: new Date().fp_incr(14),
    disable: getBookedDates('bastun'),
    onChange: function (selectedDates) {
      const memberDiscount = document.getElementById('member-discount').checked;

      const totalPrice = calculateTotalPrice(selectedDates, memberDiscount, lodgeRates['bastun']);
      document.getElementById('total-price').textContent = totalPrice.toString();

      appendPriceInput(totalPrice);
    },
  });
  function appendPriceInput(totalPrice) {
    const priceInput = document.getElementById('price-input');
    priceInput.value = totalPrice.toString();
  }
  const calculateTotalPrice = (selectedDates, memberDiscount, lodgeRate) => {
    let totalPrice = 0;

    selectedDates.forEach((selectedDate) => {
      const date = new Date(selectedDate);
      const isWeekend = date.getDay() === 5 || date.getDay() === 4;
      const nightlyRate = isWeekend ? lodgeRate.weekendRate : lodgeRate.weekdayRate;

      if (memberDiscount) {
        totalPrice += nightlyRate * 0.7;
      } else {
        totalPrice += nightlyRate;
      }
    });

    return totalPrice;
  };
});

flatpickr.localize(Swedish);
