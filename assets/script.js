const API = {
  geocoding: "https://geocoding-api.open-meteo.com/v1/search",
  forecast: "https://api.open-meteo.com/v1/forecast"
};

const form = document.querySelector("#search-form");
const cityInput = document.querySelector("#city-input");
const searchButton = document.querySelector("#search-button");
const statusMessage = document.querySelector("#status");
const weatherPanel = document.querySelector("#weather-panel");
const ui = {
  city: document.querySelector("#city-name"), updated: document.querySelector("#updated-time"),
  icon: document.querySelector("#condition-icon"), temperature: document.querySelector("#temperature"),
  condition: document.querySelector("#condition-text"), feelsLike: document.querySelector("#feels-like"),
  humidity: document.querySelector("#humidity"), wind: document.querySelector("#wind-speed"),
  feelsMetric: document.querySelector("#feels-metric")
};

const weatherCodes = {
  0:["Clear sky","☀️"],1:["Mainly clear","🌤️"],2:["Partly cloudy","⛅"],3:["Overcast","☁️"],
  45:["Fog","🌫️"],48:["Rime fog","🌫️"],51:["Light drizzle","🌦️"],53:["Moderate drizzle","🌦️"],55:["Dense drizzle","🌧️"],
  56:["Light freezing drizzle","🌧️"],57:["Dense freezing drizzle","🌧️"],61:["Slight rain","🌦️"],63:["Moderate rain","🌧️"],65:["Heavy rain","🌧️"],
  66:["Light freezing rain","🌧️"],67:["Heavy freezing rain","🌧️"],71:["Slight snow","🌨️"],73:["Moderate snow","🌨️"],75:["Heavy snow","❄️"],77:["Snow grains","🌨️"],
  80:["Slight rain showers","🌦️"],81:["Moderate rain showers","🌧️"],82:["Violent rain showers","⛈️"],85:["Slight snow showers","🌨️"],86:["Heavy snow showers","❄️"],
  95:["Thunderstorm","⛈️"],96:["Thunderstorm with hail","⛈️"],99:["Thunderstorm with heavy hail","⛈️"]
};

function setStatus(message, type = "") {
  statusMessage.textContent = message;
  statusMessage.className = `status ${type}`.trim();
}

// Fetch JSON with explicit network, timeout, HTTP, and parsing error handling.
async function fetchJson(url) {
  let response;
  try {
    response = await fetch(url, { headers: { Accept: "application/json" }, signal: AbortSignal.timeout(12000) });
  } catch (error) {
    if (error.name === "TimeoutError") throw new Error("The request took too long. Please try again.");
    throw new Error("Network error. Check your internet connection and try again.");
  }
  if (!response.ok) throw new Error(`Weather service error (HTTP ${response.status}). Please try again later.`);
  try { return await response.json(); }
  catch { throw new Error("The weather service returned an unreadable response."); }
}

async function getCoordinates(city) {
  const params = new URLSearchParams({ name: city, count: "1", language: "en", format: "json" });
  const data = await fetchJson(`${API.geocoding}?${params}`);
  if (!Array.isArray(data.results) || data.results.length === 0) {
    throw new Error(`We couldn't find "${city}". Check the spelling or try another city.`);
  }
  return data.results[0];
}

async function getWeather(latitude, longitude) {
  const params = new URLSearchParams({
    latitude: String(latitude), longitude: String(longitude),
    current: "temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m",
    timezone: "auto"
  });
  return fetchJson(`${API.forecast}?${params}`);
}

function formatLocation(place) {
  return [place.name, place.admin1, place.country].filter(Boolean)
    .filter((part, index, all) => all.indexOf(part) === index).join(", ");
}

function renderWeather(place, data) {
  // Open-Meteo returns nested JSON; the current measurements are inside data.current.
  const current = data.current;
  if (!current || typeof current.temperature_2m !== "number") throw new Error("Weather data is incomplete. Please search again.");
  const [condition, icon] = weatherCodes[current.weather_code] || ["Unknown conditions", "🌡️"];
  const temperature = Math.round(current.temperature_2m);
  const feels = Math.round(current.apparent_temperature);
  ui.city.textContent = formatLocation(place);
  ui.updated.textContent = `Local time: ${String(current.time || "").replace("T", " ") || "Not available"}`;
  ui.icon.textContent = icon;
  ui.temperature.textContent = String(temperature);
  ui.condition.textContent = condition;
  ui.feelsLike.textContent = `Feels like ${feels}°C`;
  ui.humidity.textContent = Number.isFinite(current.relative_humidity_2m) ? String(current.relative_humidity_2m) : "—";
  ui.wind.textContent = Number.isFinite(current.wind_speed_10m) ? String(Math.round(current.wind_speed_10m * 10) / 10) : "—";
  ui.feelsMetric.textContent = String(feels);
  weatherPanel.hidden = false;
  setStatus("Weather updated successfully.", "success");
}

async function searchWeather(city) {
  const cleanCity = city.trim();
  if (!cleanCity) { setStatus("Please enter a city name.", "error"); cityInput.focus(); return; }
  searchButton.disabled = true;
  searchButton.textContent = "Loading…";
  setStatus(`Searching for weather in ${cleanCity}…`);
  try {
    const place = await getCoordinates(cleanCity);
    const weather = await getWeather(place.latitude, place.longitude);
    renderWeather(place, weather);
  } catch (error) {
    setStatus(error instanceof Error ? error.message : "Something went wrong. Please try again.", "error");
  } finally {
    searchButton.disabled = false;
    searchButton.textContent = "Search →";
  }
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  searchWeather(cityInput.value);
});

// Load an example on first visit so the dashboard is not empty.
searchWeather("Hyderabad");
