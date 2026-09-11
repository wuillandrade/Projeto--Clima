export function formatDateTime(dateText: string, timezone: string): string {
  const timeValue = new Date(dateText)

  if (Number.isNaN(timeValue.getTime())) {
    return 'Data indisponível'
  }

  return new Intl.DateTimeFormat('pt-BR', {
    timeZone: timezone,
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(timeValue)
}

export function formatTemperature(value: number, unit: string): string {
  return `${Math.round(value)}${unit}`
}

export function formatValue(value: number, unit: string): string {
  return `${Math.round(value)}${unit}`
}
