class WeatherWidget {
  constructor(containerId, options = {}) {
    this.container = document.getElementById(containerId);
    this.options = {
      latitude: options.latitude || 42.5295, // Brighton, MI
      longitude: options.longitude || -83.7802,
      locationName: options.locationName || 'Brighton, MI',
      temperatureUnit: options.temperatureUnit || 'fahrenheit',
      windspeedUnit: options.windspeedUnit || 'mph',
      updateInterval: options.updateInterval || 600000, // 10 minutes
      ...options
    };
    this.weatherCodes = {
      0: { description: 'Clear sky', icon: '☀️' },
      1: { description: 'Mainly clear', icon: '🌤️' },
      2: { description: 'Partly cloudy', icon: '⛅' },
      3: { description: 'Overcast', icon: '☁️' },
      45: { description: 'Foggy', icon: '🌫️' },
      48: { description: 'Rime fog', icon: '🌫️' },
      51: { description: 'Light drizzle', icon: '🌦️' },
      53: { description: 'Moderate drizzle', icon: '🌦️' },
      55: { description: 'Dense drizzle', icon: '🌧️' },
      61: { description: 'Slight rain', icon: '🌧️' },
      63: { description: 'Moderate rain', icon: '🌧️' },
      65: { description: 'Heavy rain', icon: '⛈️' },
      71: { description: 'Slight snow', icon: '🌨️' },
      73: { description: 'Moderate snow', icon: '❄️' },
      75: { description: 'Heavy snow', icon: '❄️' },
      77: { description: 'Snow grains', icon: '🌨️' },
      80: { description: 'Slight rain showers', icon: '🌦️' },
      81: { description: 'Moderate rain showers', icon: '🌧️' },
      82: { description: 'Violent rain showers', icon: '⛈️' },
      85: { description: 'Slight snow showers', icon: '🌨️' },
      86: { description: 'Heavy snow showers', icon: '❄️' },
      95: { description: 'Thunderstorm', icon: '⛈️' },
      96: { description: 'Thunderstorm w/ hail', icon: '⛈️' },
      99: { description: 'Thunderstorm w/ heavy hail', icon: '⛈️' }
    };
    this.init();
  }
  async init() {
    await this.fetchWeather();
    this.startAutoUpdate();
  }
  async fetchWeather() {
    const { latitude, longitude, temperatureUnit, windspeedUnit } = this.options;
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&temperature_unit=${temperatureUnit}&windspeed_unit=${windspeedUnit}&timezone=auto`;
    // Show loading
    const loadingDiv = this.container.querySelector('.weather-loading');
    if (loadingDiv) loadingDiv.style.display = '';
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      this.renderWeather(data.current_weather);
    } catch (error) {
      this.renderError(error.message);
    } finally {
      // Hide loading
      if (loadingDiv) loadingDiv.style.display = 'none';
    }
  }
  renderWeather(weather) {
    const weatherInfo = this.weatherCodes[weather.weathercode] || { description: 'Unknown', icon: '❓' };
    const tempUnit = this.options.temperatureUnit === 'fahrenheit' ? '°F' : '°C';
    const windUnit = this.options.windspeedUnit === 'mph' ? 'mph' : 'km/h';
    // Only update the weather display, not the location selector
    let weatherDisplay = this.container.querySelector('.weather-display');
    if (!weatherDisplay) {
      weatherDisplay = document.createElement('div');
      weatherDisplay.className = 'weather-display';
      this.container.appendChild(weatherDisplay);
    }
    weatherDisplay.innerHTML = `
      <div class="weather-header">
        <span class="weather-time">${new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
      </div>
      <div class="weather-main">
        <span class="weather-temp">${Math.round(weather.temperature)}${tempUnit}</span>
        <span class="weather-icon">${weatherInfo.icon}</span>
      </div>
      <div class="weather-description">${weatherInfo.description}</div>
      <div class="weather-details">
        <span class="weather-detail">💨 ${weather.windspeed} ${windUnit}</span>
        <span class="weather-detail">🧭 ${this.getWindDirection(weather.winddirection)}</span>
      </div>
    `;
  }
  renderError(message) {
    let weatherDisplay = this.container.querySelector('.weather-display');
    if (!weatherDisplay) {
      weatherDisplay = document.createElement('div');
      weatherDisplay.className = 'weather-display';
      this.container.appendChild(weatherDisplay);
    }
    weatherDisplay.innerHTML = `
      <div class="weather-error">
        <strong>Weather unavailable</strong>
        <div>${message}</div>
      </div>
    `;
  }
  getWindDirection(degrees) {
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    return directions[Math.round(degrees / 45) % 8];
  }
  startAutoUpdate() {
    setInterval(() => { this.fetchWeather(); }, this.options.updateInterval);
  }
  refresh() { this.fetchWeather(); }
}
document.addEventListener('DOMContentLoaded', () => {
  const weatherWidget = new WeatherWidget('weather-widget', {
    latitude: 42.5295,
    longitude: -83.7802,
    locationName: 'Brighton, MI',
    temperatureUnit: 'fahrenheit'
  });
  window.weatherWidget = weatherWidget;
});
