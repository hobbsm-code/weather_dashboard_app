import dotenv from 'dotenv';
dotenv.config();

// This interface will store the city's Coordinates returned by the geocode API
interface Coordinates {
  lat: number;
  lon: number;
}

// The Weather object will parse the response and hold the date, icon, 
// iconDescription, tempF, windSpeed, humidity values
class Weather {
  city: string;
  date: string;
  tempF: number;
  humidity: number;
  windSpeed: number;
  icon: string;
  iconDescription: string;

  constructor(city: string, date: string, tempF: number, humidity: number, 
              windSpeed: number, icon: string, iconDescription: string) {
    this.city = city;
    this.date = date;
    this.tempF = tempF;
    this.humidity = humidity;
    this.windSpeed = windSpeed;
    this.icon = icon;
    this.iconDescription = iconDescription;
  }
}

// The WeatherService class will handle the API calls to the geocode and weather APIs
// and return the weather data for the city
class WeatherService {
  private baseURL?: string;
  private apiKey?: string;
  private city: string;
  

  constructor() {
    this.baseURL = process.env.API_BASE_URL || '';
    this.apiKey = process.env.API_KEY || '';
    this.city = '';
  }

  // The fetchLocationData method will make a call to the geocode API
  private async fetchLocationData(query: string) {
    const response = await fetch(query);
    return await response.json();
  }

  // destructureLocationData method will extract the latitude and longitude from the response
  private destructureLocationData(locationData: any): Coordinates {
    const { lat, lon } = locationData[0];
    console.log(`Location data: ${JSON.stringify({ lat, lon })}`);
    return { lat, lon };
  }

  // Builds the geocode query from the input city and env values
  private buildGeocodeQuery(): string {
    return `${this.baseURL}/geo/1.0/direct?q=${this.city}&appid=${this.apiKey}`;
  }

  // Builds the weather query from the city coordinates and env values
  private buildWeatherQuery(coordinates: Coordinates): string {
    return `${this.baseURL}/data/2.5/weather?units=imperial&lat=${coordinates.lat}&lon=${coordinates.lon}&appid=${this.apiKey}`;
  }

  // Builds the forecast query from the city coordinates and env values  
  private buildForecastQuery(coordinates: Coordinates): string {
    return `${this.baseURL}/data/2.5/forecast?units=imperial&lat=${coordinates.lat}&lon=${coordinates.lon}&appid=${this.apiKey}`;
  }

  // Fetches the location data and destructures it
  private async fetchAndDestructureLocationData() {
    const locationData = await this.fetchLocationData(this.buildGeocodeQuery());
    return this.destructureLocationData(locationData);
  }

  // This method fetches the current and forecast weather data, parses it, and returns it
  // as an array of Weather objects
  private async fetchWeatherData(coordinates: Coordinates) {
    let currentWeatherResponse = await fetch(this.buildWeatherQuery(coordinates));
    currentWeatherResponse = await currentWeatherResponse.json();
    const current = this.parseCurrentWeather(currentWeatherResponse);
    let forecastResponse = await fetch(this.buildForecastQuery(coordinates));
    forecastResponse = (await forecastResponse.json()).list;
    let forecast = this.parseForecastWeather(forecastResponse);
    forecast = this.getForecastForDays(forecast);
    console.log(`Forecast Days: ${JSON.stringify(forecast)}`);
    return this.buildForecastArray(current, forecast);
  }

  // This method parses the response from the current weather API call
  private parseCurrentWeather(response: any) {
    return new Weather(
      this.city,
      this.convertUnixTimestamp(response.dt),
      response.main.temp,
      response.main.humidity,
      response.wind.speed,
      response.weather[0].icon,
      response.weather[0].description
    );
  }

  // This method parses the response from the forecast weather API call 
  // and returns an array of Weather objects
  private parseForecastWeather(response: any) { 
    let weatherForecast: Weather[] = [];
    weatherForecast = response.map((weather: any) => {
      return new Weather(
        this.city,
        this.convertUnixTimestamp(weather.dt),
        weather.main.temp,
        weather.main.humidity,
        weather.wind.speed,
        weather.weather[0].icon,
        weather.weather[0].description
      );
    });
    return weatherForecast;
  }

  // This method converts the Unix timestamp to a readable date format
  private convertUnixTimestamp(unixTimestamp: number) {
    const date = new Date(unixTimestamp * 1000);
    return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
  }

  // This method filters the first weather object for each day in the forecast
  private getForecastForDays(forecast: Weather[]) {
    let forecastDays: Weather[] = [];
    let current: string = forecast[0].date;
    forecast.forEach((weather: Weather) => {
      if (weather.date !== current) {
        forecastDays.push(weather);
        current = weather.date;
      }
    });
    return forecastDays;
  }

  // This method concatenates the current weather object with the forecast weather objects
  private buildForecastArray(currentWeather: Weather, weatherData: any[]) {
    let weatherArray: Weather[] = [];
    weatherArray[0] = currentWeather;
    weatherArray = weatherArray.concat(weatherData);
    return weatherArray;
  }

  // The main driver of the WeatherService class, this method initiates all the 
  // API calls and returns the weather data for the city
  async getWeatherForCity(city: string) {
    this.city = city;
    const coordinates = await this.fetchAndDestructureLocationData();
    const weatherData = await this.fetchWeatherData(coordinates);
    return weatherData;
  }
}

export default new WeatherService();
