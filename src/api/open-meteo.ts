import type { CurrentWeather, Location, WeatherResult } from './types'

export class AppError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'AppError'
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message)
    this.name = 'ValidationError'
  }
}

export class CityNotFoundError extends AppError {
  constructor() {
    super('Cidade não encontrada.')
    this.name = 'CityNotFoundError'
  }
}

export class WeatherUnavailableError extends AppError {
  constructor() {
    super('Clima indisponível no momento.')
    this.name = 'WeatherUnavailableError'
  }
}

export class ApiRequestError extends AppError {
  constructor() {
    super('Não foi possível consultar os dados meteorológicos.')
    this.name = 'ApiRequestError'
  }
}

function toNumber(value: unknown, fallback: number): number {
  const numberValue = typeof value === 'number' ? value : Number(value)

  if (!Number.isFinite(numberValue)) {
    return fallback
  }

  return numberValue
}

function getString(value: unknown): string | null {
  return typeof value === 'string' && value.trim() ? value.trim() : null
}

function readCurrentValue(rawCurrent: Record<string, unknown>, key: string): number {
  const value = rawCurrent[key]
  return toNumber(value, Number.NaN)
}

const BRAZILIAN_STATE_CODES: Record<string, string> = {
  Acre: 'AC',
  Alagoas: 'AL',
  Amapá: 'AP',
  Amazonas: 'AM',
  Bahia: 'BA',
  Ceará: 'CE',
  'Distrito Federal': 'DF',
  'Espírito Santo': 'ES',
  Goiás: 'GO',
  Maranhão: 'MA',
  'Mato Grosso': 'MT',
  'Mato Grosso do Sul': 'MS',
  'Minas Gerais': 'MG',
  Pará: 'PA',
  Paraíba: 'PB',
  Paraná: 'PR',
  Pernambuco: 'PE',
  Piauí: 'PI',
  'Rio de Janeiro': 'RJ',
  'Rio Grande do Norte': 'RN',
  'Rio Grande do Sul': 'RS',
  Rondônia: 'RO',
  Roraima: 'RR',
  'Santa Catarina': 'SC',
  'São Paulo': 'SP',
  Sergipe: 'SE',
  Tocantins: 'TO',
}

function normalizeLocation(raw: Record<string, unknown>): Location {
  const name = getString(raw.name)
  const latitude = toNumber(raw.latitude, Number.NaN)
  const longitude = toNumber(raw.longitude, Number.NaN)
  const countryCode = getString(raw.country_code) ?? 'BR'
  const timezone = getString(raw.timezone) ?? 'UTC'
  const stateName = getString(raw.admin1)
  const stateCode = countryCode === 'BR' && stateName ? BRAZILIAN_STATE_CODES[stateName] : undefined

  if (!name || !Number.isFinite(latitude) || !Number.isFinite(longitude) || !timezone) {
    throw new CityNotFoundError()
  }

  return {
    name,
    latitude,
    longitude,
    countryCode,
    timezone,
    stateCode,
  }
}

function normalizeWeatherUnits(rawUnits: Record<string, unknown>): CurrentWeather['units'] {
  return {
    temperature: getString(rawUnits.temperature_2m) ?? '°C',
    humidity: getString(rawUnits.relative_humidity_2m) ?? '%',
    apparentTemperature: getString(rawUnits.apparent_temperature) ?? '°C',
    windSpeed: getString(rawUnits.wind_speed_10m) ?? 'km/h',
    precipitationProbability: getString(rawUnits.precipitation_probability) ?? '%',
  }
}

export async function searchCityByName(name: string, signal?: AbortSignal): Promise<Location> {
  const trimmedName = name.trim()

  if (!trimmedName) {
    throw new ValidationError('Informe o nome da cidade.')
  }

  const params = new URLSearchParams({
    name: trimmedName,
    count: '1',
    language: 'pt',
    format: 'json',
  })

  const url = new URL('https://geocoding-api.open-meteo.com/v1/search')
  url.search = params.toString()

  const response = await fetch(url, { signal })

  if (!response.ok) {
    throw new ApiRequestError()
  }

  const result = (await response.json()) as { results?: unknown[] }

  if (!Array.isArray(result.results) || result.results.length === 0) {
    throw new CityNotFoundError()
  }

  const firstResult = result.results[0]

  if (!firstResult || typeof firstResult !== 'object') {
    throw new CityNotFoundError()
  }

  return normalizeLocation(firstResult as Record<string, unknown>)
}

export async function fetchWeatherByLocation(location: Location, signal?: AbortSignal): Promise<WeatherResult> {
  const params = new URLSearchParams({
    latitude: String(location.latitude),
    longitude: String(location.longitude),
    current: 'precipitation_probability,temperature_2m,relative_humidity_2m,is_day,apparent_temperature,wind_speed_10m,wind_direction_10m,precipitation,weather_code',
    timezone: location.timezone,
  })

  const url = new URL('https://api.open-meteo.com/v1/forecast')
  url.search = params.toString()

  const response = await fetch(url, { signal })

  if (!response.ok) {
    throw new ApiRequestError()
  }

  const payload = (await response.json()) as {
    current?: Record<string, unknown>
    current_units?: Record<string, unknown>
  }

  const current = payload.current

  if (!current || typeof current !== 'object') {
    throw new WeatherUnavailableError()
  }

  const requiredFields = [
    'temperature_2m',
    'relative_humidity_2m',
    'apparent_temperature',
    'is_day',
    'wind_speed_10m',
    'precipitation_probability',
  ]

  const hasRequiredFields = requiredFields.every((field) => field in current)

  if (!hasRequiredFields) {
    throw new WeatherUnavailableError()
  }

  const temperature = readCurrentValue(current, 'temperature_2m')
  const humidity = readCurrentValue(current, 'relative_humidity_2m')
  const apparentTemperature = readCurrentValue(current, 'apparent_temperature')
  const windSpeed = readCurrentValue(current, 'wind_speed_10m')
  const windDirection = readCurrentValue(current, 'wind_direction_10m')
  const precipitationProbability = readCurrentValue(current, 'precipitation_probability')
  const weatherCode = readCurrentValue(current, 'weather_code')
  const isDay = Number(current.is_day) === 1
  const time = getString(current.time) ?? new Date().toISOString()

  if (!Number.isFinite(temperature) || !Number.isFinite(humidity) || !Number.isFinite(apparentTemperature) || !Number.isFinite(windSpeed) || !Number.isFinite(precipitationProbability) || !Number.isFinite(weatherCode)) {
    throw new WeatherUnavailableError()
  }

  return {
    location,
    current: {
      time,
      temperature,
      humidity,
      apparentTemperature,
      isDay,
      windSpeed,
      windDirection,
      precipitationProbability,
      weatherCode,
      units: normalizeWeatherUnits((payload.current_units ?? {}) as Record<string, unknown>),
    },
  }
}

export async function getWeatherByCityName(cityName: string, signal?: AbortSignal): Promise<WeatherResult> {
  const location = await searchCityByName(cityName, signal)
  return fetchWeatherByLocation(location, signal)
}
