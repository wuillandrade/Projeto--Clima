const WMO_WEATHER_CODES: Record<number, string> = {
  0: 'Céu limpo',
  1: 'Predominantemente limpo',
  2: 'Parcialmente nublado',
  3: 'Nublado',
  45: 'Nevoeiro',
  48: 'Nevoeiro',
  51: 'Chuvisco leve',
  53: 'Chuvisco moderado',
  55: 'Chuvisco intenso',
  56: 'Chuvisco congelante',
  57: 'Chuvisco congelante',
  61: 'Chuva fraca',
  63: 'Chuva moderada',
  65: 'Chuva forte',
  66: 'Chuva congelante',
  67: 'Chuva congelante',
  71: 'Neve fraca',
  73: 'Neve moderada',
  75: 'Neve forte',
  77: 'Grãos de neve',
  80: 'Pancadas de chuva',
  81: 'Pancadas de chuva',
  82: 'Pancadas de chuva',
  85: 'Pancadas de neve',
  86: 'Pancadas de neve',
  95: 'Trovoada fraca ou moderada',
  96: 'Trovoada com granizo',
  99: 'Trovoada com granizo',
}

export function getWeatherDescription(code: number): string {
  return WMO_WEATHER_CODES[code] ?? 'Condição não identificada'
}

export function getWeatherIcon(code: number, isDay = true): string {
  if (code === 0) {
    return isDay ? '☀️' : '🌙'
  }

  if (code === 1 || code === 2) {
    return isDay ? '🌤️' : '☁️'
  }

  if (code === 3) {
    return '☁️'
  }

  if (code === 45 || code === 48) {
    return '🌫️'
  }

  if (code >= 51 && code <= 67 || code >= 80 && code <= 82) {
    return '🌧️'
  }

  if (code >= 71 && code <= 77 || code >= 85 && code <= 86) {
    return '❄️'
  }

  if (code >= 95) {
    return '⛈️'
  }

  return '🌬️'
}

export function getCardinalDirection(degrees: number): string {
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW']
  const index = Math.round(((degrees % 360) + 360) % 360 / 22.5) % directions.length
  return directions[index]
}
