const body = document.body;
const searchForm = document.getElementById('searchForm');
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');

const weatherDisplay = document.getElementById('weatherDisplay');
const skeleton = document.getElementById('skeleton');
const errorMessage = document.getElementById('errorMessage');
const errorText = document.getElementById('errorText');
const emptyState = document.getElementById('emptyState');

const tempValue = document.getElementById('tempValue');
const feelsLike = document.getElementById('feelsLike');
const description = document.getElementById('description');
const weatherIcon = document.getElementById('weatherIcon');
const city = document.getElementById('city');
const country = document.getElementById('country');
const tempMin = document.getElementById('tempMin');
const tempMax = document.getElementById('tempMax');
const humidity = document.getElementById('humidity');
const windSpeed = document.getElementById('windSpeed');
const pressure = document.getElementById('pressure');
const visibility = document.getElementById('visibility');
const clouds = document.getElementById('clouds');
const windDirection = document.getElementById('windDirection');
const sunrise = document.getElementById('sunrise');
const sunset = document.getElementById('sunset');

function degreesToCardinal(deg) {
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  const index = Math.round(deg / 22.5) % 16;
  return directions[index];
}

function formatTime(unixTimestamp, timezoneOffset) {
  const date = new Date((unixTimestamp + timezoneOffset) * 1000);
  const hours = date.getUTCHours().toString().padStart(2, '0');
  const minutes = date.getUTCMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}

function formatVisibility(meters) {
  return meters >= 1000 ? `${(meters / 1000).toFixed(0)} km` : `${meters} m`;
}

function show(element) {
  element.classList.remove('hidden');
}

function hide(element) {
  element.classList.add('hidden');
}

function showError(msg) {
  errorText.textContent = msg;
  hide(weatherDisplay);
  hide(skeleton);
  hide(emptyState);
  show(errorMessage);
}

async function fetchWeather(cityName) {
  hide(errorMessage);
  hide(emptyState);
  hide(weatherDisplay);
  show(skeleton);

  try {
    const response = await fetch(`/api/weather?city=${encodeURIComponent(cityName)}`);

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.error || 'Erro ao buscar dados do clima.');
    }

    const json = await response.json();

    const isNight = json.weather[0].icon.endsWith('n');
    body.className = isNight ? 'night' : 'day';

    const timezoneOffset = json.timezone || 0;

    city.textContent = json.name;
    country.textContent = json.sys.country || '--';

    const iconCode = json.weather[0].icon;
    weatherIcon.src = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
    weatherIcon.alt = json.weather[0].description;

    description.textContent = json.weather[0].description;
    tempValue.textContent = Math.round(json.main.temp);

    const feels = Math.round(json.main.feels_like);
    feelsLike.textContent = `Sensação: ${feels}°C`;

    tempMin.textContent = `${Math.round(json.main.temp_min)}°`;
    tempMax.textContent = `${Math.round(json.main.temp_max)}°`;
    humidity.textContent = `${json.main.humidity}%`;

    const windKmh = (json.wind.speed * 3.6).toFixed(1);
    windSpeed.textContent = `${windKmh} km/h`;

    pressure.textContent = `${json.main.pressure} hPa`;
    visibility.textContent = formatVisibility(json.visibility || 0);
    clouds.textContent = `${json.clouds?.all || 0}%`;

    if (json.wind.deg !== undefined) {
      windDirection.textContent = degreesToCardinal(json.wind.deg);
    } else {
      windDirection.textContent = '--';
    }

    if (json.sys.sunrise && json.sys.sunset) {
      sunrise.textContent = formatTime(json.sys.sunrise, timezoneOffset);
      sunset.textContent = formatTime(json.sys.sunset, timezoneOffset);
    } else {
      sunrise.textContent = '--:--';
      sunset.textContent = '--:--';
    }

    hide(skeleton);
    show(weatherDisplay);
  } catch (err) {
    hide(skeleton);
    showError(err.message);
  }
}

searchForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const value = searchInput.value.trim();
  if (!value) {
    showError('Digite o nome de uma cidade para buscar.');
    return;
  }
  fetchWeather(value);
});

searchInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    searchForm.dispatchEvent(new Event('submit'));
  }
});
