import { describe, expect, it } from 'vitest'
import { getCardinalDirection, getWeatherDescription, getWeatherIcon } from './weather-code'

describe('weather code helpers', () => {
  it('converts the main WMO codes into Portuguese descriptions', () => {
    expect(getWeatherDescription(0)).toBe('Céu limpo')
    expect(getWeatherDescription(3)).toBe('Nublado')
    expect(getWeatherDescription(95)).toBe('Trovoada fraca ou moderada')
    expect(getWeatherDescription(999)).toBe('Condição não identificada')
  })

  it('maps wind direction degrees to cardinal directions', () => {
    expect(getCardinalDirection(0)).toBe('N')
    expect(getCardinalDirection(90)).toBe('E')
    expect(getCardinalDirection(180)).toBe('S')
    expect(getCardinalDirection(270)).toBe('W')
  })

  it('chooses an icon for the current weather condition', () => {
    expect(getWeatherIcon(0, true)).toBe('☀️')
    expect(getWeatherIcon(0, false)).toBe('🌙')
    expect(getWeatherIcon(63)).toBe('🌧️')
    expect(getWeatherIcon(3)).toBe('☁️')
  })
})
