const fromInput = document.getElementById('from-input');
const toInput = document.getElementById('to-input');
const dateInput = document.getElementById('date-input');
const searchBtn = document.getElementById('search-btn');
const sortBtn = document.getElementById('sort-btn');
const timeFilter = document.getElementById('time-filter');
const output = document.getElementById('output');

let allFlights = [];      
let currentFlights = [];   
let currentSort = "time-asc";

// Set default date to today
document.addEventListener('DOMContentLoaded', () => {
  const today = new Date().toISOString().split('T')[0];
  dateInput.value = today;
  lucide.createIcons();
});

setupAutocomplete(fromInput);
setupAutocomplete(toInput);

// Debounce the search to prevent accidental double-clicks
searchBtn.addEventListener('click', debounce(handleSearch, 300));

sortBtn.addEventListener('click', function () {
  if (allFlights.length === 0) return;

  if (currentSort === "time-asc") {
    currentSort = "time-desc";
    sortBtn.innerHTML = `<i data-lucide="arrow-down" size="18"></i> Sort: Latest`;
  } else {
    currentSort = "time-asc";
    sortBtn.innerHTML = `<i data-lucide="arrow-up" size="18"></i> Sort: Earliest`;
  }

  applySort();
  renderFlights(currentFlights);
  lucide.createIcons();
});

timeFilter.addEventListener('change', function () {
  // Only apply filter if a search has already been performed
  if (allFlights.length === 0) return;

  currentFlights = applyTimeFilter(allFlights);
  applySort();
  renderFlights(currentFlights);
  lucide.createIcons();
});

async function handleSearch() {
  const from = fromInput.value.trim().toUpperCase();
  const to = toInput.value.trim().toUpperCase();
  const date = dateInput.value;

  if (!from || !to || !date || from === to) {
    showFeedback("Please provide a valid route and date.", "error");
    return;
  }

  searchBtn.disabled = true;
  output.innerHTML = `
    <div class="empty-state">
      <div class="loading-spinner"></div>
      <p>Searching for the best routes...</p>
    </div>
  `;

  try {
    const flights = await searchFlights(from, to, date);

    allFlights = flights;
    currentFlights = applyTimeFilter(allFlights);

    applySort();
    renderFlights(currentFlights);

  } catch (err) {
    showFeedback("Unable to fetch flight data. Please try again later.", "error");
  } finally {
    searchBtn.disabled = false;
    lucide.createIcons();
  }
}

function showFeedback(message, type) {
  output.innerHTML = `
    <div class="empty-state">
      <i data-lucide="alert-circle" size="48" style="margin-bottom: 1rem; color: ${type === 'error' ? 'var(--status-delayed)' : 'var(--text-muted)'};"></i>
      <p>${message}</p>
    </div>
  `;
  lucide.createIcons();
}

function applyTimeFilter(flights) {
  const period = timeFilter.value;
  if (period === "all") return [...flights];

  const ranges = {
    morning: { start: 6, end: 12 },
    afternoon: { start: 12, end: 18 },
    evening: { start: 18, end: 24 },
    night: { start: 0, end: 6 }
  };

  const range = ranges[period];

  return flights.filter(f => {
    const dep = f.departure.scheduled;
    if (!dep) return false;
    const hour = parseInt(dep.split('T')[1].split(':')[0], 10);
    return hour >= range.start && hour < range.end;
  });
}

function applySort() {
  if (currentSort === "time-asc") {
    currentFlights.sort((a, b) => new Date(a.departure.scheduled) - new Date(b.departure.scheduled));
  } else {
    currentFlights.sort((a, b) => new Date(b.departure.scheduled) - new Date(a.departure.scheduled));
  }
}

function formatTime(datetime) {
  if (!datetime) return "--:--";
  const timeStr = datetime.split('T')[1];
  return timeStr.substring(0, 5);
}

function renderFlights(flights) {
  output.innerHTML = "";

  if (!flights || flights.length === 0) {
    showFeedback("No flights found for this route and time.", "info");
    return;
  }

  flights.forEach((f, index) => {
    const card = document.createElement("div");
    card.className = "flight-card";
    card.style.animationDelay = `${index * 0.05}s`;

    const depTime = formatTime(f.departure.scheduled);
    const arrTime = formatTime(f.arrival.scheduled);
    const depDelay = f.departure.delay ? `<span class="delay-text">+${f.departure.delay}m</span>` : "";
    const arrDelay = f.arrival.delay ? `<span class="delay-text">+${f.arrival.delay}m</span>` : "";
    
    // Status Logic
    let statusIcon = "calendar";
    if (f.status === "landed") statusIcon = "check-circle";
    if (f.departure.delay > 15) statusIcon = "clock";

    card.innerHTML = `
      <div class="flight-info departure">
        <span class="airport-code">${f.departure.iata}</span>
        <div class="flight-time">${depTime} ${depDelay}</div>
      </div>

      <div class="plane-icon">
        <i data-lucide="plane" size="24"></i>
      </div>

      <div class="flight-info arrival" style="text-align: right;">
        <span class="airport-code">${f.arrival.iata}</span>
        <div class="flight-time">${arrTime} ${arrDelay}</div>
      </div>

      <div class="flight-meta">
        <div class="flight-number-badge">${f.flight.iata}</div>
        <div class="flight-status ${f.status}">
          <i data-lucide="${statusIcon}" size="12"></i>
          ${f.status}
        </div>
      </div>
    `;

    output.appendChild(card);
  });
}

// Debounce utility — delays execution until user stops typing
function debounce(fn, delay) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

function setupAutocomplete(input) {
  const container = input.closest('.input-wrapper');
  const box = document.createElement("div");
  box.className = "suggestions";
  container.appendChild(box);

  const handleInput = debounce(function () {
    const value = input.value.toUpperCase();
    box.innerHTML = "";

    if (!value) return;

    const matches = airports.filter(a => 
      a.iata.includes(value) || a.city.toUpperCase().includes(value)
    ).slice(0, 6);

    matches.forEach(a => {
      const item = document.createElement("div");
      item.className = "suggestion-item";
      item.innerHTML = `
        <span class="city">${a.city}</span>
        <span class="iata">${a.iata}</span>
      `;

      item.addEventListener("click", () => {
        input.value = a.iata;
        box.innerHTML = "";
      });

      box.appendChild(item);
    });
  }, 200);

  input.addEventListener("input", handleInput);
}

// Global click to close suggestions
document.addEventListener('click', (e) => {
  if (!e.target.closest('.input-wrapper')) {
    document.querySelectorAll('.suggestions').forEach(b => b.innerHTML = "");
  }
});

// Theme Toggle
const themeButton = document.getElementById('theme-toggle');

themeButton.addEventListener('click', function() {
  document.body.classList.toggle('dark-mode');
  updateIcon();
});

function updateIcon() {
  const isDark = document.body.classList.contains('dark-mode');
  
  if (isDark) {
    themeButton.innerHTML = '<i data-lucide="sun"></i>';
  } else {
    themeButton.innerHTML = '<i data-lucide="moon"></i>';
  }
  
  if (window.lucide) {
    lucide.createIcons();
  }
}

document.addEventListener('DOMContentLoaded', updateIcon);