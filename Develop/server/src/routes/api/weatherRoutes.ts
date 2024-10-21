import { Router, type Request, type Response } from 'express';
const router = Router();

import HistoryService from '../../service/historyService.js';
import WeatherService from '../../service/weatherService.js';

// POST Request with city name in the message body to retrieve weather data
router.post('/', async (req: Request, res: Response) => {
  // Call the weather service to get the weather data for the city
  try {
    const weatherData = await WeatherService.getWeatherForCity(req.body.cityName);
    console.log(`Weather data array: ${JSON.stringify(weatherData)}`); 
    res.json(weatherData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error getting weather data' });
  }
  // Call the history service to add the city to the search history
  HistoryService.addCity(req.body.cityName);
});

// Retrieve search history
router.get('/history', async (_req: Request, res: Response) => {
  try {
    const cities = await HistoryService.getCities();
    res.json(cities);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error getting search history' });
  }
});

// Delete a city from search history
router.delete('/history/:id', async (req: Request, res: Response) => {
  try {
    HistoryService.removeCity(req.params.id);
    res.json({ message: 'City removed from search history' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error removing city from search history' });
  }
});

export default router;
