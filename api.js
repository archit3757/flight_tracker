//fetching the data from AirLabs API


const API = {
  base: "https://airlabs.co/api/v9",
  key: "2c1399c9-842b-4216-985e-c464ac436ba4"
};







// Caching
const cache = new Map();

const TTL = 5 * 60 * 1000; // 5 mins

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

  if (json.error) {
    throw new Error(`API error: ${json.error.message}`);
  }

  const data = json.response || [];

  setCache(key, data);

  return data;
}






//finding day on the date
function getDay(date) {
  const d = new Date(date);    //converts the date string into an usable object
  const index = d.getDay();   //getDay returns an index which is then checked in the list below

  const days = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

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
    status: (raw.arr_time && new Date(`${date}T${raw.arr_time}:00`) < new Date()) ? "landed" : "scheduled"
  };
}







// calling the fetch routes function
async function getFlights(from, to, date) {
  const routes = await fetchRoutes(from, to);

  const today = new Date().toISOString().split('T')[0];
  //here we get today as an object of date and time which is converted to string using iso string 
  // then using split it is split into two parts first is date and second is time then using indexing we compare today with date provided

  let schedules = [];

  if (date === today) {
    //schedules get data about delay and status for all the flights which are upcoming today or tommorrow
    schedules = await fetchSchedules(from, to);
  }


  //getting the date using date string 
  //for this we use getDay function 
  const day = getDay(date);



  //filtering the data based on days
  const filtered = routes.filter(r => {
    if (!r.days) return false;
    return r.days.includes(day);    //when i fetch the data it shows me all the flights in the week from the 'from' airport to the 'to' airport, then i filter those flights who have the required day in their weekly schedules
  });

  return filtered.map(r => {

    const match = schedules.find(s => s.flight_iata === r.flight_iata);

    const flight = normaliseFlight(r, date);

    if (match) {


      if (match.status && match.status !== "scheduled") {
        flight.status = match.status;
      }

      flight.departure.delay = match.dep_delayed || 0;
      flight.arrival.delay = match.arr_delayed || 0;
    }

    return flight;
  });
}




async function searchFlights(from, to, date) {
  try {
    return await getFlights(from, to, date);
  } catch (error) {
    console.error("Error fetching flights:", error);
    return [];
  }
}





//function for getting the delays, etc . real time 
async function fetchSchedules(from, to) {
  const url = `${API.base}/schedules?dep_iata=${from}&arr_iata=${to}&api_key=${API.key}`;

  const res = await fetch(url);

  if (!res.ok) {
    throw new Error(`API error: ${res.status} in schedules`);
  }

  const json = await res.json();

  if (json.error) {
    throw new Error(`API error: ${json.error.message}`);
  }

  return json.response || [];
}
