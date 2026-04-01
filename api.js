//fetching the data from AirLabs API


const API = {
  base: "https://airlabs.co/api/v9",
  key: "YOUR_API_KEY"
};


// Caching
const cache = new Map();

const TTL = 5 * 60 * 1000; // 5 min

function setCache(key, data) {
  cache.set(key, {
    data,
    time: Date.now()
  });
}

function getCache(key) {
  const entry = cache.get(key);

  if (!entry) return null;

  if (Date.now() - entry.time > TTL) {
    cache.delete(key);
    return null;
  }

  return entry.data;
}

//caching finished


// fetching routes
async function fetchRoutes(from, to) {
  const key = `routes:${from}-${to}`;

  const cached = getCache(key); //here getCache is called and checks if the data is still valid or has expired
  if (cached) return cached;

  const url = `${API.base}/routes?dep_iata=${from}&arr_iata=${to}&api_key=${API.key}`;

  const res = await fetch(url);

  //.ok compares the output status and checks if the status if between 200 and 299 or beyond 299 and gives response accordingly 
  if (!res.ok) {
    throw new Error(`API error: ${res.status}`);
  }

  const json = await res.json();

  const data = json.response || [];

  setCache(key, data);

  return data;
}

//finding day on the date
function getDay(date) {
  const d = new Date(date);    //converts the date string into an usable object
  const index = d.getDay();   //getDay returns an index which is then checked in the list below

  const days = ["sun","mon","tue","wed","thu","fri","sat"];

  return days[index];
}


//polishing the data fetched
function normaliseFlight(raw, date) {
  return {
    flight: {
      iata: raw.flight_iata || ""
    },
    departure: {
      iata: raw.dep_iata || "",
      scheduled: raw.dep_time ? `${date}T${raw.dep_time}:00` : ""
    },
    arrival: {
      iata: raw.arr_iata || "",
      scheduled: raw.arr_time ? `${date}T${raw.arr_time}:00` : ""
    },
    airline: {
      iata: raw.airline_iata || ""
    },
    aircraft: {
      iata: raw.aircraft_icao || ""
    },
    status: "scheduled"
  };
}


// calling the fetch routes function
async function getFlights(from, to, date) {
  const routes = await fetchRoutes(from, to);

  const day = getDay(date);

  //filtering the data based on days
  const filtered = routes.filter(r => {
    if (!r.days) return false;
    return r.days.includes(day);    //when i fetch the data it shows me all the flights in the week from the 'from' airport to the 'to' airport
  });

  return filtered.map(r => normaliseFlight(r, date));
}



async function searchFlights(from, to, date) {
  return getFlights(from, to, date);
}
