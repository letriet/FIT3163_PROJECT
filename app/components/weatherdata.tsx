export type WeatherData = {
  index: number;
  date: string;
  rain: number;
  max_temperature: number;
  min_temperature: number;
};

export type WeatherStation = {
  name: string;
  latitude: number;
  longitude: number;
  data: WeatherData[];
};
