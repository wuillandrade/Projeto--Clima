import type { WeatherResult } from '../api/types'
import { formatDateTime, formatTemperature, formatValue } from '../weather/formatters'
import { getCardinalDirection, getWeatherDescription, getWeatherIcon } from '../weather/weather-code'

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

export function renderEmptyState(): string {
  return `
    <div class="empty-state">
      <p class="kicker">Clima agora</p>
      <h2>Pesquise uma cidade</h2>
      <p>Digite o nome de uma cidade para ver a temperatura, o vento e as condições atuais.</p>
    </div>
  `
}

export function renderLoadingState(cityName: string): string {
  return `
    <div class="loading-state">
      <div class="spinner" aria-hidden="true"></div>
      <p>Buscando clima para <strong>${escapeHtml(cityName)}</strong>...</p>
    </div>
  `
}

export function renderCityNotFoundState(): string {
  return `
    <div class="error-state">
      <h2>Cidade não encontrada</h2>
      <p>Não foi possível localizar essa cidade. Verifique o nome e tente novamente.</p>
    </div>
  `
}

export function renderWeatherUnavailableState(): string {
  return `
    <div class="error-state">
      <h2>Clima indisponível</h2>
      <p>A cidade foi localizada, mas os dados meteorológicos não estão disponíveis no momento.</p>
    </div>
  `
}

export function renderApiErrorState(): string {
  return `
    <div class="error-state">
      <h2>Não foi possível consultar o clima</h2>
      <p>O serviço está temporariamente indisponível. Tente novamente em alguns instantes.</p>
    </div>
  `
}

export function renderSuccessState(result: WeatherResult): string {
  const summaryTemperature = formatTemperature(result.current.temperature, result.current.units.temperature)
  const humidity = formatValue(result.current.humidity, result.current.units.humidity)
  const apparent = formatValue(result.current.apparentTemperature, result.current.units.apparentTemperature)
  const precipitation = formatValue(result.current.precipitationProbability, result.current.units.precipitationProbability)
  const wind = formatValue(result.current.windSpeed, result.current.units.windSpeed)
  const dateTime = formatDateTime(result.current.time, result.location.timezone)
  const weatherDescription = getWeatherDescription(result.current.weatherCode)
  const weatherIcon = getWeatherIcon(result.current.weatherCode, result.current.isDay)
  const dayNightIcon = result.current.isDay ? '☀️' : '🌙'
  const cardinalDirection = getCardinalDirection(result.current.windDirection)
  const cityLabel = result.location.stateCode
    ? `${result.location.name} - ${result.location.stateCode}`
    : result.location.name
  const mapDelta = 0.08
  const mapUrl = new URL('https://www.openstreetmap.org/export/embed.html')
  mapUrl.searchParams.set('bbox', [
    result.location.longitude - mapDelta,
    result.location.latitude - mapDelta,
    result.location.longitude + mapDelta,
    result.location.latitude + mapDelta,
  ].join(','))
  mapUrl.searchParams.set('layer', 'mapnik')
  mapUrl.searchParams.set('marker', `${result.location.latitude},${result.location.longitude}`)

  return `
    <div class="success-state">
      <div class="weather-layout">
        <aside class="weather-summary">
          <div class="temperature-row">
            <span class="weather-icon temperature-icon" role="img" aria-label="${escapeHtml(weatherDescription)}">${weatherIcon}</span>
            <div class="temperature">${escapeHtml(summaryTemperature)}</div>
          </div>
          <div class="city-name">${escapeHtml(cityLabel)}</div>
          <div class="country-code">${escapeHtml(result.location.countryCode)}</div>
          <div class="info-row"><span>Horário</span><strong>${escapeHtml(dateTime)}</strong></div>
          <div class="info-row"><span>Período</span><strong><span class="info-icon" aria-hidden="true">${dayNightIcon}</span> ${result.current.isDay ? 'Dia' : 'Noite'}</strong></div>
          <div class="info-row"><span>Condição</span><strong>${escapeHtml(weatherDescription)}</strong></div>
        </aside>

        <section class="weather-details">
          <div class="stats-grid">
            <article class="stat-card">
              <span><span class="stat-icon" aria-hidden="true">💧</span> Umidade</span>
              <strong>${escapeHtml(humidity)}</strong>
            </article>
            <article class="stat-card">
              <span><span class="stat-icon" aria-hidden="true">🌡️</span> Sensação térmica</span>
              <strong>${escapeHtml(apparent)}</strong>
            </article>
            <article class="stat-card">
              <span><span class="stat-icon" aria-hidden="true">🌧️</span> Chuva</span>
              <strong>${escapeHtml(precipitation)}</strong>
            </article>
            <article class="stat-card">
              <span><span class="stat-icon" aria-hidden="true">💨</span> Vento</span>
              <strong>${escapeHtml(wind)}</strong>
            </article>
            <article class="stat-card large-card">
              <span><span class="stat-icon" aria-hidden="true">🧭</span> Direção do vento</span>
              <strong>${escapeHtml(`${Math.round(result.current.windDirection)}° ${cardinalDirection}`)}</strong>
            </article>
          </div>
        </section>
        <section class="location-map" aria-labelledby="map-title">
          <div class="map-heading">
            <h2 id="map-title">Localização</h2>
            <span>${escapeHtml(cityLabel)}</span>
          </div>
          <iframe
            class="map-frame"
            src="${escapeHtml(mapUrl.toString())}"
            title="Mapa com a localização de ${escapeHtml(cityLabel)}"
            loading="lazy"
            referrerpolicy="no-referrer"
          ></iframe>
        </section>
      </div>
    </div>
  `
}
