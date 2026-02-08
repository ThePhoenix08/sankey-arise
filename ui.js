import { getWeatherInfo, formatDate, getCurrentDateTime } from './api.js';
import { isFavorite, getFavorites } from './state.js';

const elements = {
  // Search
  searchInput: null,
  searchBtn: null,
  loadingIndicator: null,
  errorMessage: null,
  errorText: null,

  // Weather
  weatherDisplay: null,
  currentCity: null,
  currentDate: null,
  currentTemp: null,
  weatherIconMain: null,
  feelsLike: null,
  windSpeed: null,
  humidity: null,
  weatherCondition: null,
  favoriteBtn: null,
  forecastGrid: null,

  // pages
  screens: null,
  navTabs: null,

  // Favorite
  favoritesGrid: null,
  favoritesEmpty: null
};

export function initializeUI() {
  elements.searchInput = document.getElementById('city-search');
  elements.searchBtn = document.getElementById('search-btn');
  elements.loadingIndicator = document.getElementById('loading-indicator');
  elements.errorMessage = document.getElementById('error-message');
  elements.errorText = document.getElementById('error-text');

  elements.weatherDisplay = document.getElementById('weather-display');
  elements.currentCity = document.getElementById('current-city');
  elements.currentDate = document.getElementById('current-date');
  elements.currentTemp = document.getElementById('current-temp');
  elements.weatherIconMain = document.getElementById('weather-icon-main');
  elements.feelsLike = document.getElementById('feels-like');
  elements.windSpeed = document.getElementById('wind-speed');
  elements.humidity = document.getElementById('humidity');
  elements.weatherCondition = document.getElementById('weather-condition');
  elements.favoriteBtn = document.getElementById('favorite-btn');
  elements.forecastGrid = document.getElementById('forecast-grid');

  elements.screens = document.querySelectorAll('.screen');
  elements.navTabs = document.querySelectorAll('.nav-tab');

  elements.favoritesGrid = document.getElementById('favorites-grid');
  elements.favoritesEmpty = document.getElementById('favorites-empty');

  // console.log('UI initialized with DOM references');
}

export function showLoading() {
  elements.loadingIndicator.classList.remove('hidden');
  elements.errorMessage.classList.add('hidden');
  elements.weatherDisplay.classList.add('hidden');
}

export function hideLoading() {
  elements.loadingIndicator.classList.add('hidden');
}

export function showError(message) {
  elements.errorText.textContent = message;
  elements.errorMessage.classList.remove('hidden');
  elements.weatherDisplay.classList.add('hidden');
  hideLoading();
}

export function hideError() {
  elements.errorMessage.classList.add('hidden');
}

export function renderCurrentWeather(cityData, weatherData) {
  const { current } = weatherData;
  const weatherInfo = getWeatherInfo(current.weatherCode);

  elements.currentCity.textContent = `${cityData.name}, ${cityData.country}`;
  elements.currentDate.textContent = getCurrentDateTime();

  elements.currentTemp.textContent = current.temperature;

  elements.weatherIconMain.textContent = weatherInfo.icon;

  elements.feelsLike.textContent = `${current.feelsLike}°C`;
  elements.windSpeed.textContent = `${current.windSpeed} km/h`;
  elements.humidity.textContent = `${current.humidity}%`;
  elements.weatherCondition.textContent = weatherInfo.description;

  updateFavoriteButton(cityData);

  elements.weatherDisplay.classList.remove('hidden');
  hideLoading();
  hideError();
}

export function renderForecast(forecastData) {
  const forecastHTML = forecastData.map(day => {
    const weatherInfo = getWeatherInfo(day.weatherCode);
    const formattedDate = formatDate(day.date);

    return `
            <div class="forecast-card">
                <div class="forecast-date">${formattedDate}</div>
                <div class="forecast-icon">${weatherInfo.icon}</div>
                <div class="forecast-temps">
                    <span class="temp-high">${day.maxTemp}°</span>
                    <span class="temp-low">${day.minTemp}°</span>
                </div>
                <div class="forecast-condition">${weatherInfo.description}</div>
            </div>
        `;
  }).join('');

  elements.forecastGrid.innerHTML = forecastHTML;
}

export function updateFavoriteButton(cityData) {
  const isFav = isFavorite(cityData.name, cityData.country);
  elements.favoriteBtn.classList.toggle('active', isFav);
  elements.favoriteBtn.firstElementChild.innerText = isFav ? "★" : "☆";
  elements.favoriteBtn.title = isFav ? 'Remove from favorites' : 'Add to favorites';
}

export function switchScreen(screenName) {
  elements.screens.forEach(screen => {
    if (screen.id === `${screenName}-screen`) {
      screen.classList.add('active');
    } else {
      screen.classList.remove('active');
    }
  });

  elements.navTabs.forEach(tab => {
    if (tab.dataset.screen === screenName) {
      tab.classList.add('active');
    } else {
      tab.classList.remove('active');
    }
  });

  if (screenName === 'favorites') {
    renderFavorites();
  }
}

export function renderFavorites() {
  const favorites = getFavorites();

  if (favorites.length === 0) {
    elements.favoritesEmpty.classList.remove('hidden');
    elements.favoritesGrid.classList.add('hidden');
    return;
  }

  elements.favoritesEmpty.classList.add('hidden');
  elements.favoritesGrid.classList.remove('hidden');

  const favoritesHTML = favorites.map(fav => {
    const weatherInfo = getWeatherInfo(fav.weatherCode);

    return `
      <div class="favorite-city-card" 
            data-name="${fav.name}" 
            data-country="${fav.country}"
            data-lat="${fav.latitude}"
            data-lng="${fav.longitude}">
          <button class="remove-favorite" 
                  data-name="${fav.name}" 
                  data-country="${fav.country}"
                  title="Remove from favorites">✕</button>
          <div class="favorite-city-name">${fav.name}</div>
          <div class="favorite-temp">${fav.temperature}°C</div>
          <div class="favorite-icon">${weatherInfo.icon}</div>
          <div class="favorite-condition">${weatherInfo.description}</div>
      </div>
    `;
  }).join('');

  elements.favoritesGrid.innerHTML = favoritesHTML;
}

export function getSearchValue() {
  return elements.searchInput.value.trim();
}

export function clearSearchInput() {
  elements.searchInput.value = '';
}

export function focusSearch() {
  elements.searchInput.focus();
}

export function getElements() {
  return elements;
}
