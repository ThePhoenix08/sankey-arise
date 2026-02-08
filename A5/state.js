const state = {
  currentCity: null,
  currentWeather: null,
  forecast: [],
  favorites: [],
  isLoading: false,
  error: null
};

const FAVORITES_KEY = 'weatherapp_favorites';

export function initializeState() {
  try {
    const savedFavorites = localStorage.getItem(FAVORITES_KEY);

    if (savedFavorites) {
      state.favorites = JSON.parse(savedFavorites);
    }

    console.log('State initialized with favorites:', state.favorites);

  } catch (error) {
    console.error('Error loading favorites from localStorage:', error);
    state.favorites = [];
  }
}


export function getState() {
  return { ...state };
}

export function setCurrentWeather(cityData, weatherData) {
  state.currentCity = cityData;
  state.currentWeather = weatherData.current;
  state.forecast = weatherData.forecast;
  state.error = null;

  console.log('State updated with weather for:', cityData.name);
}

export function setLoading(loading) {
  state.isLoading = loading;
}

export function setError(errorMessage) {
  state.error = errorMessage;
}

export function addToFavorites(cityData, weatherData) {
  const alreadyExists = state.favorites.some(
    fav => fav.name === cityData.name && fav.country === cityData.country
  );

  if (alreadyExists) {
    console.log('City already in favorites');
    return false;
  }

  const favorite = {
    name: cityData.name,
    country: cityData.country,
    region: cityData.region,
    latitude: cityData.latitude,
    longitude: cityData.longitude,
    temperature: weatherData.current.temperature,
    weatherCode: weatherData.current.weatherCode,
    addedAt: new Date().toISOString()
  };

  state.favorites.push(favorite);

  saveFavoritesToStorage();

  console.log('Added to favorites:', favorite.name);
  return true;
}

export function removeFromFavorites(cityName, country) {
  const index = state.favorites.findIndex(
    fav => fav.name === cityName && fav.country === country
  );

  if (index === -1) {
    console.log('City not found in favorites');
    return false;
  }

  state.favorites.splice(index, 1);

  saveFavoritesToStorage();

  console.log('Removed from favorites:', cityName);
  return true;
}

export function isFavorite(cityName, country) {
  return state.favorites.some(
    fav => fav.name === cityName && fav.country === country
  );
}

export function getFavorites() {
  return [...state.favorites];
}

function saveFavoritesToStorage() {
  try {
    const favoritesJSON = JSON.stringify(state.favorites);

    localStorage.setItem(FAVORITES_KEY, favoritesJSON);

    console.log('Favorites saved to localStorage');

  } catch (error) {
    console.error('Error saving favorites to localStorage:', error);
  }
}

export function clearFavorites() {
  state.favorites = [];

  try {
    localStorage.removeItem(FAVORITES_KEY);
    console.log('Favorites cleared');
    return true;
  } catch (error) {
    console.error('Error clearing favorites:', error);
    return false;
  }
}

export function updateFavoriteWeather(cityName, country, weatherData) {
  const favorite = state.favorites.find(
    fav => fav.name === cityName && fav.country === country
  );

  if (!favorite) {
    return false;
  }

  favorite.temperature = weatherData.current.temperature;
  favorite.weatherCode = weatherData.current.weatherCode;
  favorite.lastUpdated = new Date().toISOString();

  saveFavoritesToStorage();

  return true;
}
