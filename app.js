/**
 * AuraWeather - Professional Meteorological Dashboard Logic
 * Powered by WeatherAPI (https://www.weatherapi.com/)
 */

// --- Application State ---
const state = {
  apiKey: localStorage.getItem('aura_weather_api_key') || '',
  currentCity: localStorage.getItem('aura_last_city') || 'London',
  tempUnit: localStorage.getItem('aura_temp_unit') || 'c', // 'c' | 'f'
  windUnit: localStorage.getItem('aura_wind_unit') || 'kph', // 'kph' | 'mph'
  weatherData: null,
  pinnedCities: JSON.parse(localStorage.getItem('aura_pinned_cities') || '["London", "Tokyo", "New York"]'),
  isDemoMode: false,
};

// --- WeatherAPI Endpoints ---
const API_BASE = 'https://api.weatherapi.com/v1';

// --- Comprehensive Fallback / Demo Dataset (WeatherAPI Schema) ---
const DEMO_WEATHER_DATA = {
  location: {
    name: "London",
    region: "City of London, Greater London",
    country: "United Kingdom",
    lat: 51.52,
    lon: -0.11,
    tz_id: "Europe/London",
    localtime_epoch: Math.floor(Date.now() / 1000),
    localtime: new Date().toISOString().slice(0, 16).replace('T', ' ')
  },
  current: {
    last_updated: "Just now",
    temp_c: 19.4,
    temp_f: 66.9,
    is_day: 1,
    condition: {
      text: "Partly Cloudy",
      icon: "https://cdn.weatherapi.com/weather/64x64/day/116.png",
      code: 1003
    },
    wind_mph: 9.8,
    wind_kph: 15.8,
    wind_degree: 220,
    wind_dir: "SW",
    pressure_mb: 1018.0,
    pressure_in: 30.06,
    precip_mm: 0.0,
    precip_in: 0.0,
    humidity: 62,
    cloud: 42,
    feelslike_c: 18.8,
    feelslike_f: 65.8,
    vis_km: 10.0,
    vis_miles: 6.0,
    uv: 4.0,
    gust_mph: 13.5,
    gust_kph: 21.7,
    air_quality: {
      co: 245.2,
      no2: 14.8,
      o3: 48.0,
      so2: 2.1,
      pm2_5: 8.2,
      pm10: 14.1,
      "us-epa-index": 1,
      "gb-defra-index": 1
    }
  },
  forecast: {
    forecastday: [
      {
        date: new Date().toISOString().slice(0, 10),
        day: {
          maxtemp_c: 22.5,
          maxtemp_f: 72.5,
          mintemp_c: 13.8,
          mintemp_f: 56.8,
          avgtemp_c: 18.1,
          maxwind_kph: 20.2,
          totalprecip_mm: 0.1,
          daily_chance_of_rain: 20,
          condition: {
            text: "Partly Cloudy",
            icon: "https://cdn.weatherapi.com/weather/64x64/day/116.png"
          },
          uv: 4.0
        },
        astro: {
          sunrise: "06:45 AM",
          sunset: "06:12 PM",
          moonrise: "03:15 PM",
          moonset: "02:45 AM",
          moon_phase: "Waxing Gibbous",
          moon_illumination: "78"
        },
        hour: Array.from({ length: 24 }, (_, i) => {
          const hourNum = i.toString().padStart(2, '0');
          const isDay = i >= 6 && i <= 18 ? 1 : 0;
          return {
            time: `2026-10-07 ${hourNum}:00`,
            temp_c: Math.round((14 + Math.sin(i / 3.8) * 7.5) * 10) / 10,
            temp_f: Math.round(((14 + Math.sin(i / 3.8) * 7.5) * 1.8 + 32) * 10) / 10,
            is_day: isDay,
            condition: {
              text: isDay ? (i % 3 === 0 ? "Partly Cloudy" : "Sunny") : "Clear",
              icon: isDay
                ? (i % 3 === 0 ? "https://cdn.weatherapi.com/weather/64x64/day/116.png" : "https://cdn.weatherapi.com/weather/64x64/day/113.png")
                : "https://cdn.weatherapi.com/weather/64x64/night/113.png"
            },
            chance_of_rain: Math.round(Math.max(5, Math.sin(i / 2) * 30)),
            wind_kph: Math.round(10 + Math.random() * 8)
          };
        })
      },
      {
        date: new Date(Date.now() + 86400000).toISOString().slice(0, 10),
        day: {
          maxtemp_c: 21.0,
          maxtemp_f: 69.8,
          mintemp_c: 12.5,
          mintemp_f: 54.5,
          condition: { text: "Sunny", icon: "https://cdn.weatherapi.com/weather/64x64/day/113.png" },
          daily_chance_of_rain: 10
        }
      },
      {
        date: new Date(Date.now() + 86400000 * 2).toISOString().slice(0, 10),
        day: {
          maxtemp_c: 19.2,
          maxtemp_f: 66.5,
          mintemp_c: 11.0,
          mintemp_f: 51.8,
          condition: { text: "Patchy rain", icon: "https://cdn.weatherapi.com/weather/64x64/day/176.png" },
          daily_chance_of_rain: 65
        }
      },
      {
        date: new Date(Date.now() + 86400000 * 3).toISOString().slice(0, 10),
        day: {
          maxtemp_c: 18.0,
          maxtemp_f: 64.4,
          mintemp_c: 10.2,
          mintemp_f: 50.4,
          condition: { text: "Light rain shower", icon: "https://cdn.weatherapi.com/weather/64x64/day/353.png" },
          daily_chance_of_rain: 75
        }
      },
      {
        date: new Date(Date.now() + 86400000 * 4).toISOString().slice(0, 10),
        day: {
          maxtemp_c: 20.4,
          maxtemp_f: 68.7,
          mintemp_c: 11.8,
          mintemp_f: 53.2,
          condition: { text: "Overcast", icon: "https://cdn.weatherapi.com/weather/64x64/day/122.png" },
          daily_chance_of_rain: 25
        }
      },
      {
        date: new Date(Date.now() + 86400000 * 5).toISOString().slice(0, 10),
        day: {
          maxtemp_c: 23.1,
          maxtemp_f: 73.6,
          mintemp_c: 14.0,
          mintemp_f: 57.2,
          condition: { text: "Sunny", icon: "https://cdn.weatherapi.com/weather/64x64/day/113.png" },
          daily_chance_of_rain: 5
        }
      },
      {
        date: new Date(Date.now() + 86400000 * 6).toISOString().slice(0, 10),
        day: {
          maxtemp_c: 24.0,
          maxtemp_f: 75.2,
          mintemp_c: 15.2,
          mintemp_f: 59.4,
          condition: { text: "Clear / Sunny", icon: "https://cdn.weatherapi.com/weather/64x64/day/113.png" },
          daily_chance_of_rain: 0
        }
      }
    ]
  },
  alerts: {
    alert: []
  }
};

// --- DOM References ---
const el = {
  searchInput: document.getElementById('searchInput'),
  searchSpinner: document.getElementById('searchSpinner'),
  suggestionsDropdown: document.getElementById('suggestionsDropdown'),
  geoBtn: document.getElementById('geoBtn'),
  unitCelsius: document.getElementById('unitCelsius'),
  unitFahrenheit: document.getElementById('unitFahrenheit'),
  favoritesBtn: document.getElementById('favoritesBtn'),
  settingsBtn: document.getElementById('settingsBtn'),
  apiStatusDot: document.getElementById('apiStatusDot'),
  chipsList: document.getElementById('chipsList'),
  alertBanner: document.getElementById('alertBanner'),
  alertHeadline: document.getElementById('alertHeadline'),
  alertDesc: document.getElementById('alertDesc'),
  alertCloseBtn: document.getElementById('alertCloseBtn'),

  // Hero
  locationTitle: document.getElementById('locationTitle'),
  pinToggleBtn: document.getElementById('pinToggleBtn'),
  localTime: document.getElementById('localTime'),
  coordinates: document.getElementById('coordinates'),
  conditionBadge: document.getElementById('conditionBadge'),
  conditionText: document.getElementById('conditionText'),
  tempMain: document.getElementById('tempMain'),
  tempUnitIndicator: document.getElementById('tempUnitIndicator'),
  weatherIconLarge: document.getElementById('weatherIconLarge'),
  todayMaxTemp: document.getElementById('todayMaxTemp'),
  todayMinTemp: document.getElementById('todayMinTemp'),
  feelsLikeTemp: document.getElementById('feelsLikeTemp'),
  heroPrecip: document.getElementById('heroPrecip'),
  heroGusts: document.getElementById('heroGusts'),
  heroClouds: document.getElementById('heroClouds'),
  heroHumidity: document.getElementById('heroHumidity'),

  // Hourly
  hourlyTrack: document.getElementById('hourlyTrack'),
  hourlyPrev: document.getElementById('hourlyPrev'),
  hourlyNext: document.getElementById('hourlyNext'),

  // Forecast
  forecastList: document.getElementById('forecastList'),

  // AQI
  aqiBadge: document.getElementById('aqiBadge'),
  aqiNumber: document.getElementById('aqiNumber'),
  aqiFillBar: document.getElementById('aqiFillBar'),
  aqiSummary: document.getElementById('aqiSummary'),
  polPM25: document.getElementById('polPM25'),
  polPM10: document.getElementById('polPM10'),
  polO3: document.getElementById('polO3'),
  polNO2: document.getElementById('polNO2'),

  // Wind & UV
  compassNeedle: document.getElementById('compassNeedle'),
  windSpeed: document.getElementById('windSpeed'),
  windUnit: document.getElementById('windUnit'),
  windDirText: document.getElementById('windDirText'),
  uvIndexVal: document.getElementById('uvIndexVal'),
  uvStatus: document.getElementById('uvStatus'),
  uvFillBar: document.getElementById('uvFillBar'),

  // Vitals
  vitalHumidity: document.getElementById('vitalHumidity'),
  vitalDew: document.getElementById('vitalDew'),
  vitalVisibility: document.getElementById('vitalVisibility'),
  vitalVisDesc: document.getElementById('vitalVisDesc'),
  vitalPressure: document.getElementById('vitalPressure'),
  vitalPressureTrend: document.getElementById('vitalPressureTrend'),
  vitalRainChance: document.getElementById('vitalRainChance'),
  vitalPrecipVol: document.getElementById('vitalPrecipVol'),

  // Astronomy
  moonPhaseName: document.getElementById('moonPhaseName'),
  sunriseTime: document.getElementById('sunriseTime'),
  sunsetTime: document.getElementById('sunsetTime'),
  daylightDuration: document.getElementById('daylightDuration'),
  sunOrb: document.getElementById('sunOrb'),
  moonriseTime: document.getElementById('moonriseTime'),
  moonsetTime: document.getElementById('moonsetTime'),
  moonIllum: document.getElementById('moonIllum'),

  // Modals & UI
  settingsModal: document.getElementById('settingsModal'),
  modalCloseBtn: document.getElementById('modalCloseBtn'),
  settingsForm: document.getElementById('settingsForm'),
  apiKeyInput: document.getElementById('apiKeyInput'),
  toggleKeyVisibility: document.getElementById('toggleKeyVisibility'),
  defaultUnitSelect: document.getElementById('defaultUnitSelect'),
  defaultWindSelect: document.getElementById('defaultWindSelect'),
  useDemoKeyBtn: document.getElementById('useDemoKeyBtn'),
  favoritesModal: document.getElementById('favoritesModal'),
  favModalCloseBtn: document.getElementById('favModalCloseBtn'),
  favList: document.getElementById('favList'),
  toastNotification: document.getElementById('toastNotification'),
  toastMessage: document.getElementById('toastMessage'),
  refreshBtn: document.getElementById('refreshBtn'),
  lastUpdatedNotice: document.getElementById('lastUpdatedNotice'),
  weatherCanvas: document.getElementById('weatherCanvas')
};

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
  setupEventListeners();
  setupCanvasParticles();
  applySavedPreferences();

  if (state.apiKey) {
    updateApiStatus(true);
    fetchWeatherData(state.currentCity);
  } else {
    updateApiStatus(false);
    // Load Demo data immediately for a responsive experience
    state.isDemoMode = true;
    state.weatherData = DEMO_WEATHER_DATA;
    renderAll();
    showToast("Loaded preview demo. Add your WeatherAPI key in Settings for worldwide live updates!");
  }
});

// --- Preference & State Restorations ---
function applySavedPreferences() {
  el.apiKeyInput.value = state.apiKey;
  el.defaultUnitSelect.value = state.tempUnit;
  el.defaultWindSelect.value = state.windUnit;

  if (state.tempUnit === 'f') {
    el.unitCelsius.classList.remove('active');
    el.unitFahrenheit.classList.add('active');
  } else {
    el.unitCelsius.classList.add('active');
    el.unitFahrenheit.classList.remove('active');
  }
}

function updateApiStatus(isActive) {
  if (isActive) {
    el.apiStatusDot.classList.remove('inactive');
    el.apiStatusDot.title = "Live WeatherAPI Active";
  } else {
    el.apiStatusDot.classList.add('inactive');
    el.apiStatusDot.title = "Demo Preview Mode (Click to add API key)";
  }
}

// --- WeatherAPI Network Client ---
async function fetchWeatherData(query) {
  if (!query) return;

  if (!state.apiKey) {
    showSpinner(true);
    try {
      // 1. Live Geocoding via Open-Meteo
      const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=1`);
      const geoData = await geoRes.json();
      if (!geoData.results || geoData.results.length === 0) {
        throw new Error("Location not found");
      }
      const loc = geoData.results[0];

      // 2. Live Weather via Open-Meteo
      const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${loc.latitude}&longitude=${loc.longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,cloud_cover,surface_pressure,wind_speed_10m,wind_direction_10m,wind_gusts_10m,uv_index&hourly=temperature_2m,precipitation_probability,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,precipitation_probability_max,uv_index_max&timezone=auto`);
      const w = await weatherRes.json();

      // 3. Map to WeatherAPI schema using DEMO_WEATHER_DATA as template
      const data = JSON.parse(JSON.stringify(DEMO_WEATHER_DATA));

      data.location.name = loc.name;
      data.location.region = loc.admin1 || "";
      data.location.country = loc.country || "";
      data.location.lat = loc.latitude;
      data.location.lon = loc.longitude;
      data.location.tz_id = loc.timezone;
      data.location.localtime = w.current.time.replace('T', ' ');

      data.current.temp_c = w.current.temperature_2m;
      data.current.temp_f = (w.current.temperature_2m * 9 / 5) + 32;
      data.current.condition.text = getWmoText(w.current.weather_code);
      data.current.condition.icon = getWmoIcon(w.current.weather_code, w.current.time);
      data.current.wind_kph = w.current.wind_speed_10m;
      data.current.wind_mph = w.current.wind_speed_10m * 0.621371;
      data.current.wind_degree = w.current.wind_direction_10m;
      data.current.pressure_mb = w.current.surface_pressure;
      data.current.precip_mm = w.current.precipitation;
      data.current.humidity = w.current.relative_humidity_2m;
      data.current.cloud = w.current.cloud_cover;
      data.current.feelslike_c = w.current.apparent_temperature;
      data.current.feelslike_f = (w.current.apparent_temperature * 9 / 5) + 32;
      data.current.uv = w.current.uv_index;
      data.current.gust_kph = w.current.wind_gusts_10m;
      data.current.gust_mph = w.current.wind_gusts_10m * 0.621371;

      // 7 Days
      const days = [];
      for (let i = 0; i < 7; i++) {
        days.push({
          date: w.daily.time[i],
          day: {
            maxtemp_c: w.daily.temperature_2m_max[i],
            maxtemp_f: (w.daily.temperature_2m_max[i] * 9 / 5) + 32,
            mintemp_c: w.daily.temperature_2m_min[i],
            mintemp_f: (w.daily.temperature_2m_min[i] * 9 / 5) + 32,
            daily_chance_of_rain: w.daily.precipitation_probability_max[i],
            condition: {
              text: getWmoText(w.daily.weather_code[i]),
              icon: getWmoIcon(w.daily.weather_code[i], "12:00") // Force day icon for daily
            },
            uv: w.daily.uv_index_max[i]
          },
          astro: {
            sunrise: formatWmoTime(w.daily.sunrise[i]),
            sunset: formatWmoTime(w.daily.sunset[i]),
            moon_phase: "Waxing Gibbous",
            moon_illumination: "50"
          },
          hour: Array.from({ length: 24 }, (_, h) => {
            const idx = i * 24 + h;
            return {
              time: w.hourly.time[idx].replace('T', ' '),
              temp_c: w.hourly.temperature_2m[idx],
              temp_f: (w.hourly.temperature_2m[idx] * 9 / 5) + 32,
              chance_of_rain: w.hourly.precipitation_probability[idx],
              condition: {
                text: getWmoText(w.hourly.weather_code[idx]),
                icon: getWmoIcon(w.hourly.weather_code[idx], w.hourly.time[idx])
              }
            };
          })
        });
      }
      data.forecast.forecastday = days;

      state.isDemoMode = true;
      state.weatherData = data;
      state.currentCity = data.location.name;
      localStorage.setItem('aura_last_city', state.currentCity);
      renderAll();
      showToast(`Live weather fetched for ${state.currentCity} (Free Mode)`);
    } catch (err) {
      console.error(err);
      showToast(`Error: ${err.message}`);
    } finally {
      showSpinner(false);
    }
    return;
  }

  showSpinner(true);
  try {
    const url = `${API_BASE}/forecast.json?key=${encodeURIComponent(state.apiKey)}&q=${encodeURIComponent(query)}&days=7&aqi=yes&alerts=yes`;
    const response = await fetch(url);

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      const msg = errData?.error?.message || `API error: ${response.status} ${response.statusText}`;
      throw new Error(msg);
    }

    const data = await response.json();
    state.weatherData = data;
    state.isDemoMode = false;
    state.currentCity = data.location.name;
    localStorage.setItem('aura_last_city', state.currentCity);
    updateApiStatus(true);
    renderAll();
    showToast(`Weather updated for ${data.location.name}`);
  } catch (error) {
    console.error("Fetch error:", error);
    showToast(`Failed: ${error.message}`);
    // If live API key failed, fall back safely
    if (!state.weatherData) {
      state.weatherData = DEMO_WEATHER_DATA;
      renderAll();
    }
  } finally {
    showSpinner(false);
  }
}

// --- Autocomplete Search ---
let debounceTimer;
async function fetchAutocomplete(query) {
  if (!query || query.length < 2) {
    el.suggestionsDropdown.innerHTML = '';
    el.suggestionsDropdown.classList.add('hidden');
    return;
  }

  if (!state.apiKey) {
    // Open-Meteo Geocoding
    try {
      const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=6`);
      if (geoRes.ok) {
        const geoData = await geoRes.json();
        if (geoData.results) {
          const mapped = geoData.results.map(r => ({
            name: r.name,
            region: r.admin1 || "",
            country: r.country || ""
          }));
          renderSuggestions(mapped);
          return;
        }
      }
    } catch (err) {
      console.error("Geocoding search error:", err);
    }
    renderSuggestions([]);
    return;
  }

  try {
    const url = `${API_BASE}/search.json?key=${encodeURIComponent(state.apiKey)}&q=${encodeURIComponent(query)}`;
    const res = await fetch(url);
    if (res.ok) {
      const suggestions = await res.json();
      renderSuggestions(suggestions);
    }
  } catch (err) {
    console.error("Autocomplete search error:", err);
  }
}

function renderSuggestions(list) {
  if (!list || list.length === 0) {
    el.suggestionsDropdown.innerHTML = `<div class="suggestion-item"><span>No matching locations</span></div>`;
    el.suggestionsDropdown.classList.remove('hidden');
    return;
  }

  el.suggestionsDropdown.innerHTML = list.map(item => `
    <div class="suggestion-item" data-search="${item.name}">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
        <circle cx="12" cy="10" r="3"></circle>
      </svg>
      <div class="suggestion-text">
        <span class="suggestion-city">${item.name}</span>
        <span class="suggestion-region">${item.region ? `${item.region}, ` : ''}${item.country}</span>
      </div>
    </div>
  `).join('');

  el.suggestionsDropdown.classList.remove('hidden');
}

// --- Geolocation ---
function handleGeolocation() {
  if (!navigator.geolocation) {
    showToast("Geolocation is not supported by your browser");
    return;
  }

  showToast("Locating your coordinates...");
  showSpinner(true);
  navigator.geolocation.getCurrentPosition(
    (position) => {
      const { latitude, longitude } = position.coords;
      const coordsQuery = `${latitude.toFixed(4)},${longitude.toFixed(4)}`;
      fetchWeatherData(coordsQuery);
    },
    (err) => {
      showSpinner(false);
      showToast(`Location error: ${err.message}`);
    },
    { timeout: 10000, enableHighAccuracy: true }
  );
}

// --- Rendering Engine ---
function renderAll() {
  if (!state.weatherData) return;
  const data = state.weatherData;

  renderDynamicTheme(data);
  renderHero(data);
  renderHourly(data);
  renderForecast(data);
  renderAQI(data);
  renderWindAndUV(data);
  renderVitals(data);
  renderAstronomy(data);
  renderAlerts(data);
  updatePinnedStatus();

  const now = new Date();
  el.lastUpdatedNotice.textContent = `Last updated: ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
}

// --- Dynamic Ambient Theme ---
function renderDynamicTheme(data) {
  const code = data.current?.condition?.code || 1000;
  const isDay = data.current?.is_day !== 0;

  // Weather codes: 1000 = Sunny/Clear, 1003 = Partly cloudy, 1006/1009 = Cloudy/Overcast, 1063/1180+ = Rain, 1066/1210+ = Snow, 1087/1273+ = Thunder
  let themeClass = isDay ? 'theme-clear-day' : 'theme-clear-night';

  if ([1087, 1273, 1276, 1279, 1282].includes(code)) {
    themeClass = 'theme-thunder';
  } else if ([1066, 1114, 1210, 1213, 1216, 1219, 1222, 1225, 1255, 1258].includes(code)) {
    themeClass = 'theme-snowy';
  } else if ([1063, 1150, 1153, 1180, 1183, 1186, 1189, 1192, 1195, 1240, 1243, 1246].includes(code)) {
    themeClass = 'theme-rainy';
  } else if ([1006, 1009, 1030, 1135, 1147].includes(code)) {
    themeClass = 'theme-cloudy';
  }

  document.body.className = themeClass;
}

// --- Hero Card ---
function renderHero(data) {
  const isC = state.tempUnit === 'c';
  const curr = data.current;
  const loc = data.location;
  const todayForecast = data.forecast?.forecastday?.[0]?.day;

  el.locationTitle.textContent = `${loc.name}, ${loc.country}`;
  el.localTime.textContent = `${formatLocalTime(loc.localtime)} • Local Time`;
  el.coordinates.textContent = `Lat ${loc.lat}° • Lon ${loc.lon}° • ${loc.tz_id}`;

  el.conditionText.textContent = curr.condition.text;

  // High quality icon fix
  let iconUrl = curr.condition.icon;
  if (iconUrl.startsWith('//')) iconUrl = 'https:' + iconUrl;
  el.weatherIconLarge.src = iconUrl;
  el.weatherIconLarge.alt = curr.condition.text;

  const tempVal = isC ? Math.round(curr.temp_c) : Math.round(curr.temp_f);
  el.tempMain.textContent = tempVal;
  el.tempUnitIndicator.textContent = isC ? '°C' : '°F';

  if (todayForecast) {
    const max = isC ? Math.round(todayForecast.maxtemp_c) : Math.round(todayForecast.maxtemp_f);
    const min = isC ? Math.round(todayForecast.mintemp_c) : Math.round(todayForecast.mintemp_f);
    el.todayMaxTemp.textContent = `${max}°`;
    el.todayMinTemp.textContent = `${min}°`;
  }

  const feelsLike = isC ? Math.round(curr.feelslike_c) : Math.round(curr.feelslike_f);
  el.feelsLikeTemp.textContent = `${feelsLike}°${isC ? 'C' : 'F'}`;

  // Footer stats
  el.heroPrecip.textContent = `${curr.precip_mm || 0} mm`;
  el.heroGusts.textContent = `${state.windUnit === 'kph' ? curr.gust_kph : curr.gust_mph} ${state.windUnit}`;
  el.heroClouds.textContent = `${curr.cloud}%`;
  el.heroHumidity.textContent = `${curr.humidity}%`;
}

// --- Hourly Forecast ---
function renderHourly(data) {
  const isC = state.tempUnit === 'c';
  const hours = data.forecast?.forecastday?.[0]?.hour || [];
  if (!hours.length) return;

  const nowEpoch = data.location?.localtime_epoch || Math.floor(Date.now() / 1000);
  const currentHourStr = new Date(nowEpoch * 1000).getHours();

  el.hourlyTrack.innerHTML = hours.map((h) => {
    const dateObj = new Date(h.time.replace(' ', 'T'));
    const hourVal = dateObj.getHours();
    const isCurrentHour = hourVal === currentHourStr;
    const timeFormatted = hourVal === 0 ? '12 AM' : hourVal === 12 ? '12 PM' : hourVal > 12 ? `${hourVal - 12} PM` : `${hourVal} AM`;

    let iconUrl = h.condition.icon;
    if (iconUrl.startsWith('//')) iconUrl = 'https:' + iconUrl;
    const tempVal = isC ? Math.round(h.temp_c) : Math.round(h.temp_f);

    return `
      <div class="hourly-item ${isCurrentHour ? 'now' : ''}">
        <span class="h-time">${isCurrentHour ? 'Now' : timeFormatted}</span>
        <img class="h-icon" src="${iconUrl}" alt="${h.condition.text}" loading="lazy">
        <span class="h-temp">${tempVal}°</span>
        <span class="h-rain">💧 ${h.chance_of_rain}%</span>
      </div>
    `;
  }).join('');
}

// --- 7-Day Forecast ---
function renderForecast(data) {
  const isC = state.tempUnit === 'c';
  const days = data.forecast?.forecastday || [];
  if (!days.length) return;

  // Find min and max across all days for proportional range bar
  let globalMin = 999;
  let globalMax = -999;
  days.forEach(d => {
    const min = isC ? d.day.mintemp_c : d.day.mintemp_f;
    const max = isC ? d.day.maxtemp_c : d.day.maxtemp_f;
    if (min < globalMin) globalMin = min;
    if (max > globalMax) globalMax = max;
  });
  const spread = Math.max(1, globalMax - globalMin);

  el.forecastList.innerHTML = days.map((d, index) => {
    const dateObj = new Date(d.date + 'T00:00:00');
    const dayName = index === 0 ? 'Today' : dateObj.toLocaleDateString('en-US', { weekday: 'short' });

    let iconUrl = d.day.condition.icon;
    if (iconUrl.startsWith('//')) iconUrl = 'https:' + iconUrl;

    const min = isC ? Math.round(d.day.mintemp_c) : Math.round(d.day.mintemp_f);
    const max = isC ? Math.round(d.day.maxtemp_c) : Math.round(d.day.maxtemp_f);

    // Bar styling percentages
    const leftPct = Math.max(0, Math.min(100, ((min - globalMin) / spread) * 100));
    const widthPct = Math.max(15, Math.min(100, ((max - min) / spread) * 100));

    return `
      <div class="forecast-row">
        <span class="f-day">${dayName}</span>
        <div class="f-condition">
          <img class="f-icon" src="${iconUrl}" alt="${d.day.condition.text}" loading="lazy">
          <span class="f-text" title="${d.day.condition.text}">${d.day.condition.text}</span>
        </div>
        <div class="f-bar-wrap">
          <span class="f-min">${min}°</span>
          <div class="f-bar-track">
            <div class="f-bar-fill" style="left: ${leftPct}%; width: ${widthPct}%;"></div>
          </div>
          <span class="f-max">${max}°</span>
        </div>
        <span class="f-rain-chance">
          💧 ${d.day.daily_chance_of_rain || 0}%
        </span>
      </div>
    `;
  }).join('');
}

// --- Air Quality Index (AQI) ---
function renderAQI(data) {
  const aqi = data.current?.air_quality;
  if (!aqi) {
    el.aqiBadge.textContent = "N/A";
    el.aqiNumber.textContent = "--";
    el.aqiSummary.textContent = "Air quality data is currently not reported for this location.";
    return;
  }

  // EPA Standard Index (1 to 6)
  const epaIndex = aqi["us-epa-index"] || 1;
  const epaMap = {
    1: { name: "Good", class: "", score: "25", summary: "Air quality is considered satisfactory, and air pollution poses little or no risk.", pct: "16%" },
    2: { name: "Moderate", class: "mod", score: "55", summary: "Air quality is acceptable; however, sensitive groups may experience minor effects.", pct: "35%" },
    3: { name: "Unhealthy for Sensitive", class: "mod", score: "115", summary: "Members of sensitive groups may experience health effects. General public not affected.", pct: "55%" },
    4: { name: "Unhealthy", class: "unhealthy", score: "160", summary: "Everyone may begin to experience adverse effects; sensitive groups may experience more serious effects.", pct: "75%" },
    5: { name: "Very Unhealthy", class: "unhealthy", score: "220", summary: "Health alert: everyone may experience more serious health effects.", pct: "90%" },
    6: { name: "Hazardous", class: "unhealthy", score: "310", summary: "Health warning of emergency conditions. The entire population is likely affected.", pct: "98%" },
  };

  const currentEPA = epaMap[epaIndex] || epaMap[1];

  el.aqiBadge.textContent = currentEPA.name;
  el.aqiBadge.className = `aqi-level-badge ${currentEPA.class}`;
  el.aqiNumber.textContent = currentEPA.score;
  el.aqiFillBar.style.left = currentEPA.pct;
  el.aqiSummary.textContent = currentEPA.summary;

  el.polPM25.textContent = `${(aqi.pm2_5 || 0).toFixed(1)} µg/m³`;
  el.polPM10.textContent = `${(aqi.pm10 || 0).toFixed(1)} µg/m³`;
  el.polO3.textContent = `${(aqi.o3 || 0).toFixed(1)} µg/m³`;
  el.polNO2.textContent = `${(aqi.no2 || 0).toFixed(1)} µg/m³`;
}

// --- Wind & UV ---
function renderWindAndUV(data) {
  const curr = data.current;
  const isKph = state.windUnit === 'kph';

  const speedVal = isKph ? curr.wind_kph : curr.wind_mph;
  el.windSpeed.innerHTML = `${speedVal} <small id="windUnit">${state.windUnit}</small>`;
  el.windDirText.textContent = `From ${curr.wind_dir} (${curr.wind_degree}°)`;
  el.compassNeedle.style.transform = `rotate(${curr.wind_degree}deg)`;

  // UV
  const uv = curr.uv || 0;
  el.uvIndexVal.textContent = uv;
  let uvText = "Low Risk";
  let uvPct = (uv / 11) * 100;
  if (uvPct > 100) uvPct = 100;

  if (uv >= 11) uvText = "Extreme Risk";
  else if (uv >= 8) uvText = "Very High Risk";
  else if (uv >= 6) uvText = "High Risk";
  else if (uv >= 3) uvText = "Moderate Risk";

  el.uvStatus.textContent = uvText;
  el.uvFillBar.style.width = `${uvPct}%`;
}

// --- Atmospheric Vitals ---
function renderVitals(data) {
  const curr = data.current;
  const isC = state.tempUnit === 'c';

  el.vitalHumidity.textContent = `${curr.humidity}%`;
  // Simple Dew point estimation: T - ((100 - RH) / 5)
  const temp = isC ? curr.temp_c : (curr.temp_f - 32) * (5 / 9);
  const dewC = Math.round(temp - ((100 - curr.humidity) / 5));
  const dewVal = isC ? dewC : Math.round(dewC * 1.8 + 32);
  el.vitalDew.textContent = `Dew pt ${dewVal}°${isC ? 'C' : 'F'}`;

  // Visibility
  const vis = state.windUnit === 'kph' ? `${curr.vis_km} km` : `${curr.vis_miles} mi`;
  el.vitalVisibility.textContent = vis;
  el.vitalVisDesc.textContent = curr.vis_km >= 10 ? 'Optimal visibility' : 'Haze or mist detected';

  // Pressure
  el.vitalPressure.textContent = `${curr.pressure_mb} mb`;
  el.vitalPressureTrend.textContent = curr.pressure_mb > 1013 ? 'High pressure (Clear)' : 'Low pressure (Precip)';

  // Precipitation chance
  const rainChance = data.forecast?.forecastday?.[0]?.day?.daily_chance_of_rain || 0;
  el.vitalRainChance.textContent = `${rainChance}%`;
  el.vitalPrecipVol.textContent = `${curr.precip_mm || 0} mm / 24h`;
}

// --- Astronomy ---
function renderAstronomy(data) {
  const astro = data.forecast?.forecastday?.[0]?.astro;
  if (!astro) return;

  el.moonPhaseName.textContent = astro.moon_phase || "Waxing Gibbous";
  el.sunriseTime.textContent = astro.sunrise || "06:30 AM";
  el.sunsetTime.textContent = astro.sunset || "06:30 PM";
  el.moonriseTime.textContent = astro.moonrise || "--";
  el.moonsetTime.textContent = astro.moonset || "--";
  el.moonIllum.textContent = `${astro.moon_illumination || 50}%`;

  // Calculate daylight duration & sun orb position
  calculateSunArcPosition(astro.sunrise, astro.sunset, data.location?.localtime);
}

function calculateSunArcPosition(sunriseStr, sunsetStr, localTimeStr) {
  try {
    const parseTimeToMins = (tStr) => {
      if (!tStr) return 0;
      const [time, modifier] = tStr.trim().split(' ');
      let [hours, minutes] = time.split(':').map(Number);
      if (modifier === 'PM' && hours < 12) hours += 12;
      if (modifier === 'AM' && hours === 12) hours = 0;
      return hours * 60 + minutes;
    };

    const sunriseMins = parseTimeToMins(sunriseStr);
    const sunsetMins = parseTimeToMins(sunsetStr);
    const daylightTotal = Math.max(1, sunsetMins - sunriseMins);

    const hrs = Math.floor(daylightTotal / 60);
    const mins = daylightTotal % 60;
    el.daylightDuration.textContent = `${hrs}h ${mins}m daylight`;

    let currentMins = 0;
    if (localTimeStr) {
      const parts = localTimeStr.split(' ')[1]?.split(':') || [12, 0];
      currentMins = Number(parts[0]) * 60 + Number(parts[1]);
    } else {
      const now = new Date();
      currentMins = now.getHours() * 60 + now.getMinutes();
    }

    // Relative angle along arc: 0 (sunrise) to 1 (sunset)
    let progress = (currentMins - sunriseMins) / daylightTotal;
    if (progress < 0) progress = 0;
    if (progress > 1) progress = 1;

    // Arc path: M 30,120 A 120,120 0 0,1 270,120 -> center (150, 120), radius 120
    // Angle runs from Math.PI (180deg) to 0 (0deg)
    const angle = Math.PI - progress * Math.PI;
    const orbX = 150 + 120 * Math.cos(angle);
    const orbY = 120 - 120 * Math.sin(angle);

    el.sunOrb.setAttribute('cx', orbX.toFixed(1));
    el.sunOrb.setAttribute('cy', orbY.toFixed(1));
  } catch (err) {
    console.error("Arc math error:", err);
  }
}

// --- Weather Alerts ---
function renderAlerts(data) {
  const alerts = data.alerts?.alert;
  if (alerts && alerts.length > 0) {
    const alert = alerts[0];
    el.alertHeadline.textContent = alert.headline || alert.event || "Meteorological Advisory";
    el.alertDesc.textContent = alert.desc || alert.instruction || "Take precautions due to severe localized weather conditions.";
    el.alertBanner.classList.remove('hidden');
  } else {
    el.alertBanner.classList.add('hidden');
  }
}

// --- Pinned / Favorites System ---
function updatePinnedStatus() {
  const isPinned = state.pinnedCities.includes(state.currentCity);
  if (isPinned) {
    el.pinToggleBtn.classList.add('pinned');
    el.pinToggleBtn.title = "Remove from Pinned";
  } else {
    el.pinToggleBtn.classList.remove('pinned');
    el.pinToggleBtn.title = "Pin to Favorites";
  }
}

function togglePinCity() {
  const city = state.currentCity;
  const index = state.pinnedCities.indexOf(city);
  if (index > -1) {
    state.pinnedCities.splice(index, 1);
    showToast(`Unpinned ${city}`);
  } else {
    state.pinnedCities.push(city);
    showToast(`Pinned ${city} to Favorites`);
  }
  localStorage.setItem('aura_pinned_cities', JSON.stringify(state.pinnedCities));
  updatePinnedStatus();
  renderFavoritesList();
}

function renderFavoritesList() {
  if (!state.pinnedCities.length) {
    el.favList.innerHTML = `<div class="empty-fav-message">No locations pinned yet. Click the star icon on any city to bookmark it here!</div>`;
    return;
  }

  el.favList.innerHTML = state.pinnedCities.map(city => `
    <div class="fav-item" data-city="${city}">
      <div class="fav-city-info">
        <span class="fav-name">${city}</span>
        <span class="fav-region">Saved Location</span>
      </div>
      <button class="fav-remove-btn" data-remove="${city}" title="Remove">&times;</button>
    </div>
  `).join('');
}

// --- Interactive Event Listeners ---
function setupEventListeners() {
  // Search input typing (debounced)
  el.searchInput.addEventListener('input', (e) => {
    clearTimeout(debounceTimer);
    const val = e.target.value.trim();
    debounceTimer = setTimeout(() => fetchAutocomplete(val), 320);
  });

  // Search input enter key
  el.searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const val = el.searchInput.value.trim();
      if (val) {
        el.suggestionsDropdown.classList.add('hidden');
        fetchWeatherData(val);
      }
    }
  });

  // Click suggestion
  el.suggestionsDropdown.addEventListener('click', (e) => {
    const item = e.target.closest('.suggestion-item');
    if (item && item.dataset.search) {
      el.searchInput.value = item.dataset.search;
      el.suggestionsDropdown.classList.add('hidden');
      fetchWeatherData(item.dataset.search);
    }
  });

  // Close suggestions if clicked outside
  document.addEventListener('click', (e) => {
    if (!el.suggestionsDropdown.contains(e.target) && !el.searchInput.contains(e.target)) {
      el.suggestionsDropdown.classList.add('hidden');
    }
  });

  // Geolocation button
  el.geoBtn.addEventListener('click', handleGeolocation);

  // Unit toggles
  el.unitCelsius.addEventListener('click', () => {
    if (state.tempUnit !== 'c') {
      state.tempUnit = 'c';
      localStorage.setItem('aura_temp_unit', 'c');
      el.unitCelsius.classList.add('active');
      el.unitFahrenheit.classList.remove('active');
      renderAll();
    }
  });

  el.unitFahrenheit.addEventListener('click', () => {
    if (state.tempUnit !== 'f') {
      state.tempUnit = 'f';
      localStorage.setItem('aura_temp_unit', 'f');
      el.unitFahrenheit.classList.add('active');
      el.unitCelsius.classList.remove('active');
      renderAll();
    }
  });

  // Quick Chips
  el.chipsList.addEventListener('click', (e) => {
    const chip = e.target.closest('.chip');
    if (chip && chip.dataset.city) {
      fetchWeatherData(chip.dataset.city);
    }
  });

  // Pin star button
  el.pinToggleBtn.addEventListener('click', togglePinCity);

  // Favorites Modal
  el.favoritesBtn.addEventListener('click', () => {
    renderFavoritesList();
    el.favoritesModal.classList.remove('hidden');
  });

  el.favModalCloseBtn.addEventListener('click', () => {
    el.favoritesModal.classList.add('hidden');
  });

  el.favList.addEventListener('click', (e) => {
    const removeBtn = e.target.closest('.fav-remove-btn');
    if (removeBtn && removeBtn.dataset.remove) {
      e.stopPropagation();
      const city = removeBtn.dataset.remove;
      state.pinnedCities = state.pinnedCities.filter(c => c !== city);
      localStorage.setItem('aura_pinned_cities', JSON.stringify(state.pinnedCities));
      updatePinnedStatus();
      renderFavoritesList();
      return;
    }

    const item = e.target.closest('.fav-item');
    if (item && item.dataset.city) {
      el.favoritesModal.classList.add('hidden');
      fetchWeatherData(item.dataset.city);
    }
  });

  // Settings Modal
  el.settingsBtn.addEventListener('click', () => {
    el.settingsModal.classList.remove('hidden');
  });

  el.modalCloseBtn.addEventListener('click', () => {
    el.settingsModal.classList.add('hidden');
  });

  el.toggleKeyVisibility.addEventListener('click', () => {
    el.apiKeyInput.type = el.apiKeyInput.type === 'password' ? 'text' : 'password';
  });

  el.useDemoKeyBtn.addEventListener('click', () => {
    state.apiKey = '';
    localStorage.removeItem('aura_weather_api_key');
    el.apiKeyInput.value = '';
    updateApiStatus(false);
    el.settingsModal.classList.add('hidden');
    state.isDemoMode = true;
    state.weatherData = DEMO_WEATHER_DATA;
    renderAll();
    showToast("Loaded offline high-fidelity demo dataset!");
  });

  el.settingsForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const key = el.apiKeyInput.value.trim();
    state.apiKey = key;
    if (key) {
      localStorage.setItem('aura_weather_api_key', key);
    } else {
      localStorage.removeItem('aura_weather_api_key');
    }

    state.tempUnit = el.defaultUnitSelect.value;
    state.windUnit = el.defaultWindSelect.value;
    localStorage.setItem('aura_temp_unit', state.tempUnit);
    localStorage.setItem('aura_wind_unit', state.windUnit);

    applySavedPreferences();
    el.settingsModal.classList.add('hidden');
    fetchWeatherData(state.currentCity || 'London');
  });

  // Alert banner close
  el.alertCloseBtn.addEventListener('click', () => {
    el.alertBanner.classList.add('hidden');
  });

  // Hourly track scroll buttons
  el.hourlyPrev.addEventListener('click', () => {
    const container = document.getElementById('hourlyTrackContainer');
    container.scrollBy({ left: -260, behavior: 'smooth' });
  });

  el.hourlyNext.addEventListener('click', () => {
    const container = document.getElementById('hourlyTrackContainer');
    container.scrollBy({ left: 260, behavior: 'smooth' });
  });

  // Refresh button
  el.refreshBtn.addEventListener('click', () => {
    fetchWeatherData(state.currentCity);
  });
}

// --- Particle Background Canvas Engine ---
function setupCanvasParticles() {
  const canvas = el.weatherCanvas;
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  // Particles array
  const particleCount = 45;
  const particles = Array.from({ length: particleCount }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    radius: Math.random() * 2 + 0.8,
    speedY: Math.random() * 0.4 + 0.1,
    speedX: (Math.random() - 0.5) * 0.2,
    alpha: Math.random() * 0.5 + 0.2
  }));

  function animate() {
    ctx.clearRect(0, 0, width, height);

    // Weather type check
    const isRain = document.body.classList.contains('theme-rainy');
    const isSnow = document.body.classList.contains('theme-snowy');

    for (let p of particles) {
      if (isRain) {
        // Rain drop streaks
        ctx.strokeStyle = `rgba(186, 230, 253, ${p.alpha * 0.7})`;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x - 2, p.y + 12);
        ctx.stroke();

        p.y += p.speedY * 18 + 6;
        p.x -= 2;
      } else if (isSnow) {
        // Soft snow crystals
        ctx.fillStyle = `rgba(255, 255, 255, ${p.alpha})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius * 1.5, 0, Math.PI * 2);
        ctx.fill();

        p.y += p.speedY * 1.5 + 0.5;
        p.x += Math.sin(p.y * 0.02) * 0.6;
      } else {
        // Ambient soft atmospheric floaters
        ctx.fillStyle = `rgba(255, 255, 255, ${p.alpha * 0.35})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();

        p.y -= p.speedY * 0.4;
        p.x += p.speedX;
      }

      // Wrap around bounds
      if (p.y > height) p.y = -10;
      if (p.y < -10) p.y = height + 5;
      if (p.x > width) p.x = 0;
      if (p.x < 0) p.x = width;
    }

    requestAnimationFrame(animate);
  }

  animate();
}

// --- Utilities ---
function showToast(message) {
  el.toastMessage.textContent = message;
  el.toastNotification.classList.remove('hidden');
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => {
    el.toastNotification.classList.add('hidden');
  }, 4000);
}

function showSpinner(show) {
  if (show) el.searchSpinner.classList.remove('hidden');
  else el.searchSpinner.classList.add('hidden');
}

function formatLocalTime(str) {
  if (!str) return 'Live Observatory';
  try {
    const d = new Date(str.replace(' ', 'T'));
    return d.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return str;
  }
}

// --- WMO Weather Code Mappers ---
function getWmoText(code) {
  const map = {
    0: "Sunny", 1: "Mainly Sunny", 2: "Partly Cloudy", 3: "Overcast",
    45: "Fog", 48: "Depositing Rime Fog", 51: "Light Drizzle",
    53: "Moderate Drizzle", 55: "Dense Drizzle", 61: "Slight Rain",
    63: "Moderate Rain", 65: "Heavy Rain", 71: "Slight Snow",
    73: "Moderate Snow", 75: "Heavy Snow", 77: "Snow Grains",
    80: "Slight Rain Showers", 81: "Moderate Rain Showers",
    82: "Violent Rain Showers", 85: "Slight Snow Showers",
    86: "Heavy Snow Showers", 95: "Thunderstorm",
    96: "Thunderstorm with Slight Hail", 99: "Thunderstorm with Heavy Hail",
  };
  return map[code] || "Partly Cloudy";
}

function getWmoIcon(code, timeStr) {
  // Determine if it's day or night from timeStr (e.g., '2026-10-07T14:00' or '14:00')
  let isDay = true;
  if (timeStr) {
    const hour = parseInt(timeStr.includes('T') ? timeStr.split('T')[1].split(':')[0] : (timeStr.includes(':') ? timeStr.split(':')[0] : "12"));
    if (hour < 6 || hour >= 18) isDay = false;
  }
  const dayStr = isDay ? "day" : "night";
  const iconMap = {
    0: 113, 1: 113, 2: 116, 3: 122, 45: 143, 48: 143,
    51: 266, 53: 266, 55: 296, 61: 296, 63: 302, 65: 308,
    71: 326, 73: 332, 75: 338, 77: 338, 80: 353, 81: 356,
    82: 359, 85: 368, 86: 371, 95: 389, 96: 392, 99: 395
  };
  const iconCode = iconMap[code] || 116;
  return `https://cdn.weatherapi.com/weather/64x64/${dayStr}/${iconCode}.png`;
}

function formatWmoTime(isoStr) {
  if (!isoStr) return "--:--";
  try {
    const d = new Date(isoStr);
    let h = d.getHours();
    let m = d.getMinutes();
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12;
    h = h ? h : 12;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')} ${ampm}`;
  } catch (e) {
    return isoStr;
  }
}

