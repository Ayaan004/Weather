# AuraWeather ⛅
> Professional Real-Time Meteorological Dashboard powered by [WeatherAPI](https://www.weatherapi.com/)

AuraWeather is a high-performance, glassmorphic weather application designed with modern HTML5, CSS3, and Vanilla JavaScript. It delivers real-time weather analytics, 24-hour horizon forecasts, 7-day projections, air quality indexes (US-EPA), and solar/lunar ephemeris.

---

## ✨ Features

- **🌐 WeatherAPI Integration**: Real-time conditions, 7-day extended forecasts, hourly forecasts, severe weather alerts, and air quality telemetry.
- **✨ High-Fidelity Preview Mode**: Functions immediately out of the box with sample data if no API key is provided yet.
- **⚙️ Secure API Key Management**: Easily add and save your personal WeatherAPI key directly in the UI (stored securely in browser `localStorage`).
- **🔍 Intelligent Search & Autocomplete**: Real-time city search with keyboard navigation and instant autocomplete dropdown.
- **📍 GPS Geolocation**: One-click "Locate Me" button to detect current coordinates and fetch local weather instantly.
- **🌡️ Instant Unit Conversion**: Effortlessly switch between Celsius (°C) and Fahrenheit (°F), plus km/h and mph for wind.
- **🌟 Dynamic Ambient Themes**: The page atmosphere dynamically changes its color palette and particle canvas (Rain, Snow, Thunder, Clouds, Clear Day, Clear Night) based on local weather conditions.
- **🍃 Air Quality Index (AQI)**: US-EPA scale ratings with detailed breakdown of PM2.5, PM10, O₃, and NO₂ pollutants.
- **☀️ Solar & Lunar Ephemeris**: Interactive visual solar daylight arc tracking the sun's position, sunrise, sunset, moon phases, and illumination percentage.
- **⭐ Pinned Favorites**: Bookmark your favorite cities to quickly switch between them anytime.

---

## 🚀 Quick Start

### 1. View Directly in Browser
Simply open `index.html` in any modern web browser, or serve it using any local HTTP server:

```bash
# Using Python
python -m http.server 8080

# Or using Node.js / npx
npx serve .
```

Open **`http://localhost:8080`** in your browser.

### 2. Connect Your WeatherAPI Key
1. Get a free API key at [WeatherAPI.com Signup](https://www.weatherapi.com/signup.aspx).
2. Click the **Gear icon (Settings)** in the top right of AuraWeather.
3. Paste your API key and click **Save & Fetch Live Data**.
4. The status indicator dot will turn green, indicating active live API communication.

---

## 📁 File Structure

```text
Weather/
├── index.html       # Semantic HTML5 layout with glassmorphic cards
├── styles.css       # Dynamic CSS design system, themes, and animations
├── app.js           # WeatherAPI client, state management, particle engine
└── README.md        # Documentation and usage guide
```
