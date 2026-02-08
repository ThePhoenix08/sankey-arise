import {
  fetchCityCoordinates,
  fetchWeatherData
} from './api.js';

import {
  initializeState,
  setCurrentWeather,
  setLoading,
  setError,
  addToFavorites,
  removeFromFavorites,
  isFavorite,
  updateFavoriteWeather,
  getState
} from './state.js';

import {
  initializeUI,
  showLoading,
  hideLoading,
  showError,
  hideError,
  renderCurrentWeather,
  renderForecast,
  switchScreen,
  updateFavoriteButton,
  renderFavorites,
  getSearchValue,
  clearSearchInput,
  focusSearch,
  getElements
} from './ui.js';


let elements;


document.addEventListener('DOMContentLoaded', () => {

  console.log('🌤️ Weather App Starting...');

  initializeState();
  initializeUI();
  elements = getElements();
  setupEventListeners();

  focusSearch();

  console.log('✅ Weather App Ready!');
});

function setupEventListeners() {
  elements.searchBtn.addEventListener('click', handleSearch);

  elements.searchInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
      handleSearch();
    }
  });

  elements.favoriteBtn.addEventListener('click', handleToggleFavorite);

  elements.navTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const screenName = tab.dataset.screen;
      switchScreen(screenName);
    });
  });

  elements.favoritesGrid.addEventListener('click', handleFavoriteCardClick);

  console.log('Event listeners attached');
}

async function handleSearch() {

  const cityName = getSearchValue();

  if (!cityName) {
    showError('Please enter a city name');
    return;
  }

  try {
    showLoading();
    setLoading(true);
    hideError();

    console.log('Searching for:', cityName);
    const cityData = await fetchCityCoordinates(cityName);
    console.log('Found city:', cityData);

    const weatherData = await fetchWeatherData(cityData.latitude, cityData.longitude);
    console.log('Weather data received:', weatherData);
    setCurrentWeather(cityData, weatherData);

    renderCurrentWeather(cityData, weatherData);
    renderForecast(weatherData.forecast);

    clearSearchInput();

  } catch (error) {
    console.error('Search error:', error);
    setError(error.message);
    showError(error.message);

  } finally {
    hideLoading();
    setLoading(false);
  }
}

async function handleToggleFavorite() {
  const state = getState();
  const { currentCity, currentWeather, forecast } = state;

  if (!currentCity || !currentWeather) {
    console.warn('No city data to favorite');
    return;
  }

  const isCurrentlyFavorite = isFavorite(currentCity.name, currentCity.country);

  if (isCurrentlyFavorite) {
    const removed = removeFromFavorites(currentCity.name, currentCity.country);
    if (removed) {
      console.log('Removed from favorites');
      updateFavoriteButton(currentCity);
    }
  } else {
    const weatherData = { current: currentWeather, forecast };
    const added = addToFavorites(currentCity, weatherData);

    if (added) {
      console.log('Added to favorites');
      updateFavoriteButton(currentCity);
    }
  }
}

async function handleFavoriteCardClick(event) {
  const target = event.target;

  if (target.classList.contains('remove-favorite')) {
    event.stopPropagation();

    const cityName = target.dataset.name;
    const country = target.dataset.country;

    removeFromFavorites(cityName, country);
    renderFavorites();

    return;
  }

  const card = target.closest('.favorite-city-card');
  if (card) {
    const cityName = card.dataset.name;
    const country = card.dataset.country;
    const latitude = parseFloat(card.dataset.lat);
    const longitude = parseFloat(card.dataset.lng);

    try {
      showLoading();

      const cityData = {
        name: cityName,
        country: country,
        latitude: latitude,
        longitude: longitude,
        region: ''
      };

      const weatherData = await fetchWeatherData(latitude, longitude);

      setCurrentWeather(cityData, weatherData);
      updateFavoriteWeather(cityName, country, weatherData);

      switchScreen('home');
      renderCurrentWeather(cityData, weatherData);
      renderForecast(weatherData.forecast);

    } catch (error) {
      console.error('Error loading favorite city:', error);
      switchScreen('home');
      showError('Failed to load weather for this city');
    } finally {
      hideLoading();
    }
  }
}