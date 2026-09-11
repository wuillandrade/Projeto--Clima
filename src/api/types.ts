export type Location = {
  name: string
  latitude: number
  longitude: number
  countryCode: string
  timezone: string
  stateCode?: string
}

export type CurrentWeather = {
  time: string
  temperature: number
  humidity: number
  apparentTemperature: number
  isDay: boolean
  windSpeed: number
  windDirection: number
  precipitationProbability: number
  weatherCode: number
  units: {
    temperature: string
    humidity: string
    apparentTemperature: string
    windSpeed: string
    precipitationProbability: string
  }
}

export type WeatherResult = {
  location: Location
  current: CurrentWeather
}
