# WeatherNow — Thiranex Task 4

Responsive, client-side weather dashboard demonstrating async JavaScript, REST APIs, nested JSON parsing, dynamic DOM updates, city search, and error handling.

## Features
- Search for a city and display current temperature, humidity, wind speed, feels-like temperature, weather condition, and icon.
- Uses the Fetch API with `async`/`await`.
- Uses Open-Meteo Geocoding API to find coordinates, then the Forecast API for current conditions.
- Handles unknown cities, network failures, HTTP errors, invalid JSON, and timeouts.
- Responsive layout, keyboard focus styles, skip link, and accessible status announcements.
- No API key required; internet access is required.

## Run locally
1. Extract the ZIP and open the folder in VS Code.
2. Open `index.html` with the Live Server extension.
3. Search for Hyderabad, London, Tokyo, or another city.

## APIs
- Geocoding: `https://geocoding-api.open-meteo.com/v1/search`
- Forecast: `https://api.open-meteo.com/v1/forecast`

## Structure
```text
thiranex_task4_weather_dashboard/
├── index.html
├── README.md
└── assets/
    ├── style.css
    └── script.js
```
