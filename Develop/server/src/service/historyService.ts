import fs from 'node:fs/promises';
import { v4 as uuidv4 } from 'uuid';

// A City class with a name and id property
class City {
  name: string;
  id: string;

  constructor(name: string, id: string) {
    this.name = name;
    this.id = id;
  }
}

// This service class will read from and write to the searchHistory.json file
class HistoryService {
  // Read the searchHistory.json file and return the contents
  private async read() {
    return await fs.readFile('./db/searchHistory.json', {
      encoding: 'utf-8',
      flag: 'a+'
    });
  }

  // Writes the updated cities array to the searchHistory.json file
  private async write(cities: City[]) {
    try {
      await fs.writeFile('./db/searchHistory.json', JSON.stringify(cities, null, 2));
    } catch (error) {
      console.error(error);
    }
  }

  // getCities method that reads the cities from the searchHistory.json file and returns them as an array of City objects
  async getCities() {
    return await this.read().then((cities) => {
      let parsedCities: City[];

      try {
        parsedCities = [].concat(JSON.parse(cities));
      } catch (error) {
        parsedCities = [];
      }

      return parsedCities;
    });
  }

  // The addCity method that adds a city to the searchHistory.json file
  async addCity(city: string) {
    if (!city) {
      throw new Error('City name is required');
    }

    const newCity: City = {name: city, id: uuidv4()};

    return await this.getCities()
    .then((cities) => {
      if(cities.find((index) => index.name === city)) {
        return cities;
      }
      return [...cities, newCity];
    })
    .then((updatedCities) => this.write(updatedCities))
    .then(() => newCity);
  }

  // The removeCity method removes a city from the searchHistory.json file
  async removeCity(id: string) {
    return await this.getCities()
    .then((cities) => cities.filter((city) => city.id !== id))
    .then((updatedCities) => this.write(updatedCities));
  }
}

export default new HistoryService();
