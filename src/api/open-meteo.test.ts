import { afterEach, describe, expect, it, vi } from 'vitest'
import { fetchWeatherByLocation, searchCityByName } from './open-meteo'
import type { Location } from './types'

afterEach(() => {
  vi.restoreAllMocks()
})

describe('Open-Meteo integration', () => {
  it('normalizes the city response and sends encoded params', async () => {
    const fetchMock = vi.fn(async () => ({
      ok: true,
      json: async () => ({
        results: [
          {
            name: 'São Paulo',
            latitude: -23.55,
            longitude: -46.63,
            country_code: 'BR',
            admin1: 'São Paulo',
            timezone: 'America/Sao_Paulo',
          },
        ],
      }),
    }))

    vi.stubGlobal('fetch', fetchMock)

    const result = await searchCityByName('São Paulo')

    expect(result).toEqual({
      name: 'São Paulo',
      latitude: -23.55,
      longitude: -46.63,
      countryCode: 'BR',
      timezone: 'America/Sao_Paulo',
      stateCode: 'SP',
    })

    const requestUrl = (
      fetchMock.mock.calls as unknown as Array<[RequestInfo | URL, RequestInit?]>
    )[0]?.[0]

    expect(requestUrl).toBeDefined()

    const parsedUrl = new URL(String(requestUrl))
    expect(parsedUrl.searchParams.get('name')).toBe('São Paulo')
    expect(parsedUrl.searchParams.get('count')).toBe('1')
    expect(parsedUrl.searchParams.get('language')).toBe('pt')
    expect(parsedUrl.searchParams.get('format')).toBe('json')
  })

  it('normalizes forecast data and keeps weather units', async () => {
    const location: Location = {
      name: 'São Paulo',
      latitude: -23.55,
      longitude: -46.63,
      countryCode: 'BR',
      timezone: 'America/Sao_Paulo',
    }

    const fetchMock = vi.fn(async () => ({
      ok: true,
      json: async () => ({
        current: {
          time: '2024-01-15T12:00:00',
          temperature_2m: 28,
          relative_humidity_2m: 60,
          apparent_temperature: 30,
          is_day: 1,
          wind_speed_10m: 12,
          wind_direction_10m: 90,
          precipitation_probability: 20,
          weather_code: 2,
          precipitation: 0,
        },
        current_units: {
          temperature_2m: '°C',
          relative_humidity_2m: '%',
          apparent_temperature: '°C',
          wind_speed_10m: 'km/h',
          precipitation_probability: '%',
        },
      }),
    }))

    vi.stubGlobal('fetch', fetchMock)

    const result = await fetchWeatherByLocation(location)

    expect(result.location).toEqual(location)
    expect(result.current.temperature).toBe(28)
    expect(result.current.humidity).toBe(60)
    expect(result.current.windDirection).toBe(90)
    expect(result.current.isDay).toBe(true)
    expect(result.current.units.temperature).toBe('°C')
    expect(result.current.units.windSpeed).toBe('km/h')
  })
})
