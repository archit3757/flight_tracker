const fromInput = document.getElementById('from-input');
const toInput = document.getElementById('to-input');
const dateInput = document.getElementById('date-input');
const searchBtn = document.getElementById('search-btn');
const sortBtn = document.getElementById('sort-btn');
const timeFilter = document.getElementById('time-filter');
const output = document.getElementById('output');

let allFlights = [];      // unfiltered results from API
let currentFlights = [];   // after time filter is applied
let currentSort = "time-asc";

setupAutocomplete(fromInput);
setupAutocomplete(toInput);

searchBtn.addEventListener('click', handleSearch);

sortBtn.addEventListener('click', function () {
  if (currentSort === "time-asc") {
    currentSort = "time-desc";
    sortBtn.textContent = "Sort: Time ↓";
  } else {
    currentSort = "time-asc";
    sortBtn.textContent = "Sort: Time ↑";
  }

  applySort();
  renderFlights(currentFlights);
});

timeFilter.addEventListener('change', function () {
  currentFlights = applyTimeFilter(allFlights);
  applySort();
  renderFlights(currentFlights);
});

async function handleSearch() {
  const from = fromInput.value.trim().toUpperCase();
  const to = toInput.value.trim().toUpperCase();
  const date = dateInput.value;

  if (!from || !to || !date || from === to) {
    output.textContent = "Invalid input";
    return;
  }

  searchBtn.disabled = true;
  output.textContent = "Loading...";

  try {
    const flights = await searchFlights(from, to, date);

    allFlights = flights;
    currentFlights = applyTimeFilter(allFlights);

    applySort();
    renderFlights(currentFlights);

  } catch (err) {
    output.textContent = "Something went wrong";
  } finally {
    searchBtn.disabled = false;
  }
}

// Returns a filtered copy of flights based on the selected time period
function applyTimeFilter(flights) {
  const period = timeFilter.value;

  if (period === "all") return flights.slice();

  // Define the hour ranges for each period
  const ranges = {
    morning: { start: 6, end: 12 },
    afternoon: { start: 12, end: 18 },
    evening: { start: 18, end: 24 },
    night: { start: 0, end: 6 }
  };

  const range = ranges[period];

  return flights.filter(function (f) {
    const dep = f.departure.scheduled;
    if (!dep) return false;

    // Extract the hour from the ISO-like datetime string (e.g. "2026-04-11T14:30:00")
    const hour = parseInt(dep.split('T')[1].split(':')[0], 10);

    return hour >= range.start && hour < range.end;
  });
}

function applySort() {
  if (currentSort === "time-asc") {
    currentFlights.sort(function (a, b) {
      return new Date(a.departure.scheduled) - new Date(b.departure.scheduled);
    });
  } else {
    currentFlights.sort(function (a, b) {
      return new Date(b.departure.scheduled) - new Date(a.departure.scheduled);
    });
  }
}

function formatTime(datetime) {
  if (!datetime) return "--:--";

  const parts = datetime.split('T')[1].split(':');

  const hours = parts[0];
  const minutes = parts[1];

  return hours + ":" + minutes;
}

function renderFlights(flights) {
  output.innerHTML = "";

  if (!flights || flights.length === 0) {
    output.textContent = "No flights found";
    return;
  }

  for (let i = 0; i < flights.length; i++) {
    const f = flights[i];

    const div = document.createElement("div");
    div.className = "flight-card";

    const depTime = formatTime(f.departure.scheduled);
    const arrTime = formatTime(f.arrival.scheduled);

    const depDelay = f.departure.delay ? `<span class="delay">+${f.departure.delay}min</span>` : "";
    const arrDelay = f.arrival.delay ? `<span class="delay">+${f.arrival.delay}min</span>` : "";

    div.innerHTML = `
      <div class="flight-number">${f.flight.iata}</div>

      <div class="route">
        <span class="airport">${f.departure.iata}</span>
        <span class="time">${depTime}</span> ${depDelay}
        <span class="arrow">→</span>
        <span class="airport">${f.arrival.iata}</span>
        <span class="time">${arrTime}</span> ${arrDelay}
      </div>

      <div class="status ${f.status}">
        ${f.status.toUpperCase()}
      </div>
    `;

    output.appendChild(div);
  }
}

function setupAutocomplete(input) {
  const box = document.createElement("div");
  box.className = "suggestions";

  input.parentNode.style.position = "relative";

  input.parentNode.appendChild(box);

  input.addEventListener("input", function () {
    const value = input.value.toUpperCase();

    box.innerHTML = "";

    if (!value) {
      return;
    }

    let count = 0;

    for (let i = 0; i < airports.length; i++) {
      const a = airports[i];

      const matchIata = a.iata.includes(value);
      const matchCity = a.city.toUpperCase().includes(value);

      if (matchIata || matchCity) {
        const item = document.createElement("div");
        item.textContent = a.iata + " - " + a.city;

        item.addEventListener("click", function () {
          input.value = a.iata;
          box.innerHTML = "";
        });

        box.appendChild(item);

        count = count + 1;

        if (count === 5) {
          break;
        }
      }
    }
  });
}

document.addEventListener('click', function (e) {
  if (e.target !== fromInput && e.target !== toInput) {
    document.querySelectorAll('.suggestions').forEach(b => b.innerHTML = "");
  }
});