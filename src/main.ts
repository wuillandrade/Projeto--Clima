import './style.css'
import {
  ApiRequestError,
  CityNotFoundError,
  ValidationError,
  WeatherUnavailableError,
  getWeatherByCityName,
} from './api/open-meteo'
import {
  renderApiErrorState,
  renderCityNotFoundState,
  renderEmptyState,
  renderLoadingState,
  renderSuccessState,
  renderWeatherUnavailableState,
} from './ui/render'

type SearchState = 'empty' | 'loading' | 'success' | 'not-found' | 'weather-unavailable' | 'api-error'

const app = document.querySelector<HTMLDivElement>('#app')

if (!app) {
  throw new Error('Elemento #app não encontrado.')
}

let activeController: AbortController | null = null
let currentState: SearchState = 'empty'

app.innerHTML = `
  <div class="page-shell">
    <header class="topbar">
      <form id="weather-form" class="search-form" novalidate>
        <label for="city-input">Cidade</label>
        <div class="input-row">
          <input id="city-input" name="city" type="text" placeholder="Digite uma cidade" maxlength="80" autocomplete="off" />
          <button id="search-button" type="submit">Buscar</button>
        </div>
        <p id="field-error" class="field-error" aria-live="polite"></p>
      </form>
    </header>

    <main id="result-panel" class="result-panel" aria-live="polite"></main>
  </div>
`

const form = document.querySelector<HTMLFormElement>('#weather-form')!
const cityInput = document.querySelector<HTMLInputElement>('#city-input')!
const searchButton = document.querySelector<HTMLButtonElement>('#search-button')!
const resultPanel = document.querySelector<HTMLElement>('#result-panel')!
const fieldError = document.querySelector<HTMLParagraphElement>('#field-error')!

function setFieldError(message: string): void {
  fieldError.textContent = message
}

function clearFieldError(): void {
  fieldError.textContent = ''
}

function setLoadingState(value: boolean): void {
  searchButton.disabled = value
  cityInput.disabled = value
  currentState = value ? 'loading' : currentState
}

function renderCurrentState(): void {
  if (currentState === 'empty') {
    resultPanel.innerHTML = renderEmptyState()
    return
  }

  if (currentState === 'loading') {
    resultPanel.innerHTML = renderLoadingState(cityInput.value.trim() || 'cidade')
    return
  }

  if (currentState === 'not-found') {
    resultPanel.innerHTML = renderCityNotFoundState()
    return
  }

  if (currentState === 'weather-unavailable') {
    resultPanel.innerHTML = renderWeatherUnavailableState()
    return
  }

  if (currentState === 'api-error') {
    resultPanel.innerHTML = renderApiErrorState()
    return
  }

  resultPanel.innerHTML = renderEmptyState()
}

form.addEventListener('submit', async (event) => {
  event.preventDefault()
  clearFieldError()

  const cityName = cityInput.value.trim()

  if (!cityName) {
    setFieldError('Digite o nome da cidade antes de buscar.')
    currentState = 'empty'
    renderCurrentState()
    return
  }

  if (activeController) {
    activeController.abort()
  }

  activeController = new AbortController()
  currentState = 'loading'
  setLoadingState(true)
  renderCurrentState()

  try {
    const weatherResult = await getWeatherByCityName(cityName, activeController.signal)
    currentState = 'success'
    resultPanel.innerHTML = renderSuccessState(weatherResult)
    searchButton.disabled = false
    cityInput.disabled = false
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      return
    }

    if (error instanceof ValidationError) {
      setFieldError(error.message)
      currentState = 'empty'
    } else if (error instanceof CityNotFoundError) {
      currentState = 'not-found'
    } else if (error instanceof WeatherUnavailableError) {
      currentState = 'weather-unavailable'
    } else if (error instanceof ApiRequestError) {
      currentState = 'api-error'
    } else {
      currentState = 'api-error'
    }

    renderCurrentState()
    searchButton.disabled = false
    cityInput.disabled = false
  } finally {
    activeController = null
    searchButton.disabled = currentState === 'loading'
    cityInput.disabled = currentState === 'loading'
  }
})

renderCurrentState()
