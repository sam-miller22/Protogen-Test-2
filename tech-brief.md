# Tech Brief: Implementing Open-Meteo Weather Widget

## Overview
This document outlines the implementation of a weather widget using the Open-Meteo API for a static HTML/CSS website hosted on Vercel. Open-Meteo provides free, unlimited weather data without requiring API keys, making it ideal for client-side implementations.

## Technology Stack
- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **API**: Open-Meteo Weather API
- **Hosting**: Vercel
- **Data Format**: JSON
- **HTTP Method**: GET requests via Fetch API

## Open-Meteo API Benefits
- ✅ **No API Key Required**: Eliminates security concerns with client-side code
- ✅ **Unlimited Requests**: No rate limiting on free tier
- ✅ **Comprehensive Data**: Current weather, forecasts, historical data
- ✅ **Global Coverage**: Worldwide weather data
- ✅ **Fast Response**: Optimized for performance
- ✅ **CORS Enabled**: Works directly from browser
- ✅ **Open Source**: Transparent and reliable

## API Endpoint Structure
```
https://api.open-meteo.com/v1/forecast?
  latitude={lat}&
  longitude={lon}&
  current_weather=true&
  temperature_unit={fahrenheit|celsius}&
  windspeed_unit={mph|kmh}&
  timezone=auto
```

## Data Response Format
```json
{
  "current_weather": {
    "temperature": 68.5,
    "windspeed": 12.3,
    "winddirection": 245,
    "weathercode": 1,
    "time": "2025-11-04T15:00"
  }
}
```

## Weather Code Mapping
Open-Meteo uses WMO weather codes (0-99) which need to be mapped to user-friendly descriptions and appropriate icons.

## Technical Considerations
- **Geolocation**: Can use browser geolocation API or hardcoded coordinates
- **Error Handling**: Network failures, invalid coordinates, API downtime
- **Caching**: Consider localStorage for reducing API calls
- **Responsive Design**: Widget should work on all screen sizes
- **Accessibility**: Proper ARIA labels and semantic HTML

---

# Step-by-Step Implementation Plan

## Phase 1: Project Setup & Planning (30 minutes)

### Step 1.1: Define Requirements
- [ ] Determine target location(s) for weather data
- [ ] Choose temperature units (Fahrenheit/Celsius)
- [ ] Decide on widget placement and size
- [ ] Select design theme/colors

### Step 1.2: Create Project Structure
```
your-website/
├── index.html
├── styles/
│   └── weather-widget.css
├── scripts/
│   └── weather.js
└── assets/
    └── weather-icons/ (optional)
```

## Phase 2: Core Implementation (1-2 hours)

### Step 2.1: HTML Structure
Create the basic HTML container for the weather widget:

```html
<!-- Add to your existing HTML -->
<div id="weather-widget" class="weather-widget">
  <div class="weather-loading">
    <div class="loading-spinner"></div>
    <p>Loading weather...</p>
  </div>
</div>
```

### Step 2.2: CSS Styling
Create `styles/weather-widget.css`:

```css
.weather-widget {
  background: linear-gradient(135deg, #74b9ff 0%, #0984e3 100%);
  color: white;
  padding: 20px;
  border-radius: 15px;
  max-width: 320px;
  margin: 20px auto;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.weather-widget:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
}

.weather-loading {
  text-align: center;
  padding: 20px;
}

.loading-spinner {
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top: 3px solid white;
  width: 30px;
  height: 30px;
  animation: spin 1s linear infinite;
  margin: 0 auto 10px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.weather-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.weather-location {
  font-size: 18px;
  font-weight: 600;
  margin: 0;
}

.weather-time {
  font-size: 12px;
  opacity: 0.8;
}

.weather-main {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 15px;
}

.weather-temp {
  font-size: 48px;
  font-weight: 300;
  line-height: 1;
}

.weather-icon {
  font-size: 48px;
}

.weather-description {
  font-size: 16px;
  text-transform: capitalize;
  margin-bottom: 15px;
  opacity: 0.9;
}

.weather-details {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  font-size: 14px;
}

.weather-detail {
  display: flex;
  align-items: center;
  gap: 5px;
}

.weather-error {
  text-align: center;
  padding: 20px;
  background: #e74c3c;
  border-radius: 10px;
}

@media (max-width: 480px) {
  .weather-widget {
    margin: 10px;
    max-width: none;
  }
  
  .weather-temp {
    font-size: 36px;
  }
  
  .weather-details {
    grid-template-columns: 1fr;
  }
}
```

### Step 2.3: JavaScript Implementation
Create `scripts/weather.js`:

```javascript
class WeatherWidget {
  constructor(containerId, options = {}) {
    this.container = document.getElementById(containerId);
    this.options = {
      latitude: options.latitude || 47.6062, // Default: Seattle
      longitude: options.longitude || -122.3321,
      locationName: options.locationName || 'Seattle, WA',
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
      48: { description: 'Depositing rime fog', icon: '🌫️' },
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
      96: { description: 'Thunderstorm with slight hail', icon: '⛈️' },
      99: { description: 'Thunderstorm with heavy hail', icon: '⛈️' }
    };
    
    this.init();
  }
  
  async init() {
    await this.fetchWeather();
    this.startAutoUpdate();
  }
  
  async fetchWeather() {
    const { latitude, longitude, temperatureUnit, windspeedUnit } = this.options;
    
    const url = `https://api.open-meteo.com/v1/forecast?` +
      `latitude=${latitude}&` +
      `longitude=${longitude}&` +
      `current_weather=true&` +
      `temperature_unit=${temperatureUnit}&` +
      `windspeed_unit=${windspeedUnit}&` +
      `timezone=auto`;
    
    try {
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      this.renderWeather(data.current_weather);
      
    } catch (error) {
      console.error('Weather fetch error:', error);
      this.renderError(error.message);
    }
  }
  
  renderWeather(weather) {
    const weatherInfo = this.weatherCodes[weather.weathercode] || 
      { description: 'Unknown', icon: '❓' };
    
    const tempUnit = this.options.temperatureUnit === 'fahrenheit' ? '°F' : '°C';
    const windUnit = this.options.windspeedUnit === 'mph' ? 'mph' : 'km/h';
    
    this.container.innerHTML = `
      <div class="weather-header">
        <h3 class="weather-location">${this.options.locationName}</h3>
        <div class="weather-time">${new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
      </div>
      
      <div class="weather-main">
        <div class="weather-temp">${Math.round(weather.temperature)}${tempUnit}</div>
        <div class="weather-icon">${weatherInfo.icon}</div>
      </div>
      
      <div class="weather-description">${weatherInfo.description}</div>
      
      <div class="weather-details">
        <div class="weather-detail">
          <span>💨</span>
          <span>${weather.windspeed} ${windUnit}</span>
        </div>
        <div class="weather-detail">
          <span>🧭</span>
          <span>${this.getWindDirection(weather.winddirection)}</span>
        </div>
      </div>
    `;
  }
  
  renderError(message) {
    this.container.innerHTML = `
      <div class="weather-error">
        <h4>Unable to load weather</h4>
        <p>Please try again later</p>
        <small>${message}</small>
      </div>
    `;
  }
  
  getWindDirection(degrees) {
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    return directions[Math.round(degrees / 45) % 8];
  }
  
  startAutoUpdate() {
    setInterval(() => {
      this.fetchWeather();
    }, this.options.updateInterval);
  }
  
  // Public method to manually refresh
  refresh() {
    this.fetchWeather();
  }
}

// Initialize weather widget when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  const weatherWidget = new WeatherWidget('weather-widget', {
    latitude: 47.6062,
    longitude: -122.3321,
    locationName: 'Seattle, WA',
    temperatureUnit: 'fahrenheit'
  });
  
  // Make it globally accessible for manual refresh
  window.weatherWidget = weatherWidget;
});
```

## Phase 3: Integration & Testing (30 minutes)

### Step 3.1: Update Your Main HTML
Add the necessary links to your existing HTML:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Your Website</title>
    <!-- Your existing styles -->
    <link rel="stylesheet" href="styles/weather-widget.css">
</head>
<body>
    <!-- Your existing content -->
    
    <!-- Weather Widget -->
    <section class="weather-section">
        <div id="weather-widget" class="weather-widget">
            <div class="weather-loading">
                <div class="loading-spinner"></div>
                <p>Loading weather...</p>
            </div>
        </div>
    </section>
    
    <!-- Your existing scripts -->
    <script src="scripts/weather.js"></script>
</body>
</html>
```

### Step 3.2: Local Testing
- [ ] Test on different browsers (Chrome, Firefox, Safari)
- [ ] Test responsive design on mobile devices
- [ ] Test error handling (disconnect internet temporarily)
- [ ] Verify auto-refresh functionality

### Step 3.3: Deploy to Vercel
```bash
# Commit your changes
git add .
git commit -m "Add Open-Meteo weather widget"
git push origin main

# Vercel will automatically deploy
```

## Phase 4: Enhancement & Optimization (Optional)

### Step 4.1: Add Geolocation Support
```javascript
// Add this method to WeatherWidget class
async requestGeolocation() {
  if ('geolocation' in navigator) {
    try {
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
      });
      
      this.options.latitude = position.coords.latitude;
      this.options.longitude = position.coords.longitude;
      this.options.locationName = 'Your Location';
      
      await this.fetchWeather();
    } catch (error) {
      console.log('Geolocation denied, using default location');
    }
  }
}
```

### Step 4.2: Add Local Storage Caching
```javascript
// Add caching methods to reduce API calls
cacheWeatherData(data) {
  const cacheData = {
    weather: data,
    timestamp: Date.now()
  };
  localStorage.setItem('weather-cache', JSON.stringify(cacheData));
}

getCachedWeatherData() {
  const cached = localStorage.getItem('weather-cache');
  if (cached) {
    const data = JSON.parse(cached);
    // Cache valid for 10 minutes
    if (Date.now() - data.timestamp < 600000) {
      return data.weather;
    }
  }
  return null;
}
```

### Step 4.3: Add Multiple Locations
```javascript
// Initialize multiple widgets
const locations = [
  { id: 'weather-seattle', lat: 47.6062, lon: -122.3321, name: 'Seattle, WA' },
  { id: 'weather-nyc', lat: 40.7128, lon: -74.0060, name: 'New York, NY' }
];

locations.forEach(location => {
  new WeatherWidget(location.id, {
    latitude: location.lat,
    longitude: location.lon,
    locationName: location.name
  });
});
```

## Testing Checklist

- [ ] Widget loads correctly on page load
- [ ] Weather data displays accurately
- [ ] Error handling works (test with invalid coordinates)
- [ ] Responsive design works on mobile
- [ ] Auto-refresh updates data every 10 minutes
- [ ] Loading state shows while fetching data
- [ ] CSS animations work smoothly
- [ ] No console errors
- [ ] Works in incognito/private browsing mode
- [ ] Performance is acceptable (< 2 second load time)

## Deployment Notes

1. **No Build Process Required**: Pure HTML/CSS/JS works directly on Vercel
2. **No Environment Variables**: Open-Meteo doesn't require API keys
3. **HTTPS Compatible**: Open-Meteo API supports HTTPS
4. **CDN Friendly**: Static files cache well on Vercel's CDN

This implementation provides a robust, maintainable weather widget that can be easily customized and extended based on your specific needs.