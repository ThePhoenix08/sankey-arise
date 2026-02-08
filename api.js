const WEATHER_CODES = {
  0: { description: 'Clear Sky', icon: '☀️' },
  1: { description: 'Mainly Clear', icon: '🌤️' },
  2: { description: 'Partly Cloudy', icon: '⛅' },
  3: { description: 'Overcast', icon: '☁️' },
  45: { description: 'Foggy', icon: '🌫️' },
  48: { description: 'Depositing Rime Fog', icon: '🌫️' },
  51: { description: 'Light Drizzle', icon: '🌦️' },
  53: { description: 'Moderate Drizzle', icon: '🌦️' },
  55: { description: 'Dense Drizzle', icon: '🌧️' },
  61: { description: 'Slight Rain', icon: '🌧️' },
  63: { description: 'Moderate Rain', icon: '🌧️' },
  65: { description: 'Heavy Rain', icon: '⛈️' },
  71: { description: 'Slight Snow', icon: '🌨️' },
  73: { description: 'Moderate Snow', icon: '❄️' },
  75: { description: 'Heavy Snow', icon: '❄️' },
  77: { description: 'Snow Grains', icon: '🌨️' },
  80: { description: 'Slight Rain Showers', icon: '🌦️' },
  81: { description: 'Moderate Rain Showers', icon: '🌧️' },
  82: { description: 'Violent Rain Showers', icon: '⛈️' },
  85: { description: 'Slight Snow Showers', icon: '🌨️' },
  86: { description: 'Heavy Snow Showers', icon: '❄️' },
  95: { description: 'Thunderstorm', icon: '⛈️' },
  96: { description: 'Thunderstorm with Hail', icon: '⛈️' },
  99: { description: 'Thunderstorm with Heavy Hail', icon: '⛈️' }
};

export function getWeatherInfo(code) {
  return WEATHER_CODES[code] || { description: 'Unknown', icon: '🌡️' };
}

export async function fetchCityCoordinates(cityName) {
  try {
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cityName)}&count=1&language=en&format=json`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();

    if (!data.results || data.results.length === 0) {
      throw new Error('City not found. Please check spelling and try again.');
    }

    const { name, latitude, longitude, country, admin1 } = data.results[0];

    return {
      name,
      latitude,
      longitude,
      country,
      region: admin1 || ''
    };

  } catch (error) {
    console.error('Error fetching city coordinates:', error);
    throw new Error(error.message || 'Failed to fetch city data. Please try again.');
  }
}

export async function fetchWeatherData(latitude, longitude) {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&daily=temperature_2m_max,temperature_2m_min,weathercode&timezone=auto&current=temperature_2m,relative_humidity_2m,apparent_temperature,wind_speed_10m`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Weather API error! Status: ${response.status}`);
    }

    const data = await response.json();

    const { current_weather, daily, current } = data;

    return {
      current: {
        temperature: Math.round(current_weather.temperature),
        windSpeed: current_weather.windspeed,
        weatherCode: current_weather.weathercode,
        humidity: current?.relative_humidity_2m || 'N/A',
        feelsLike: current?.apparent_temperature ? Math.round(current.apparent_temperature) : current_weather.temperature,
        time: current_weather.time
      },

      forecast: daily.time.map((date, index) => ({
        date: date,
        maxTemp: Math.round(daily.temperature_2m_max[index]),
        minTemp: Math.round(daily.temperature_2m_min[index]),
        weatherCode: daily.weathercode[index]
      })).slice(1, 6) // Get only days 1-5 (skip today, take next 5)
    };

  } catch (error) {
    console.error('Error fetching weather data:', error);
    throw new Error('Failed to fetch weather data. Please try again.');
  }
}

export function formatDate(dateString) {
  const date = new Date(dateString);

  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });
}

export function getCurrentDateTime() {
  const now = new Date();
  return now.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}