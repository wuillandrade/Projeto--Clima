# Projeto: Clima

Este projeto vai pegar o nome da cidade e com base nisso, consultar o clima daquele lugar, wxibindo as informações de clima, temperatura, humidade e etc.

### Aspéctos técnicos

O projeto vai ser feito em vite + vanilla + ypescript

### Informaçõe da API que será usada no projeto

Ele vai usar a API OpenMeteo, com os seguintes endpoints:


#### Para pegar latitude, longitude e timezone, baseado no nome da cidade, use a API abaixo:
https://geocoding-api.open-meteo.com/v1/search?name={NOME_DA_CIDADE}&count=1&language=pt&format=json

{NOME_DA_CIDADE} - nome da cidade que o usuário digitar.

Exemplo de resposta:
{
  "results": [
    {
      "id": 3399415,
      "name": "Fortaleza",
      "latitude": -3.71722,
      "longitude": -38.54306,
      "elevation": 18,
      "feature_code": "PPLA",
      "country_code": "BR",
      "admin1_id": 3402362,
      "admin2_id": 6320062,
      "timezone": "America/Fortaleza",
      "population": 2400000,
      "country_id": 3469034,
      "country": "Brasil",
      "admin1": "Ceará",
      "admin2": "Fortaleza"
    }
  ],
  "generationtime_ms": 1.2227297
}

Informações que precisamos: 
- Name
- Latitude
- Longitude
- Country_code
- Timezone

#### para pegar as informações de clima:
https://api.open-meteo.com/v1/forecast?latitude={LATITUDE}&longitude={LONGITUDE}&current=precipitation_probability,temperature_2m,relative_humidity_2m,is_day,apparent_temperature,wind_speed_10m,wind_direction_10m,precipitation,weather_code&timezone={TIMEZONE}


{LATITUDE} - Latitude
{LONGITUDE} - Longitde
{TIMEZONE} - Timezone

Exemplo de resposta:
{
  "latitude": 52.52,
  "longitude": 13.419998,
  "generationtime_ms": 0.201106071472168,
  "utc_offset_seconds": 0,
  "timezone": "GMT",
  "timezone_abbreviation": "GMT",
  "elevation": 38,
  "current_units": {
    "time": "iso8601",
    "interval": "seconds",
    "precipitation_probability": "%",
    "temperature_2m": "°C",
    "relative_humidity_2m": "%",
    "apparent_temperature": "°C",
    "is_day": "",
    "wind_speed_10m": "km/h",
    "wind_direction_10m": "°",
    "precipitation": "mm",
    "weather_code": "wmo code"
  },
  "current": {
    "time": "2026-09-04T21:45",
    "interval": 900,
    "precipitation_probability": 0,
    "temperature_2m": 17.6,
    "relative_humidity_2m": 76,
    "apparent_temperature": 16.1,
    "is_day": 0,
    "wind_speed_10m": 17.7,
    "wind_direction_10m": 276,
    "precipitation": 0,
    "weather_code": 3
  }
}

Infromações que precisamos: 
Na resposta, eu tenho 2 itens:
- current_units - tem as unidades de medidas das propriedades
- current - Tem os valores das propriedades

Propriedades obrigatórias:
- temperature_2m
- relative_humidity_2m
- apparent_temperature
- is_day
- wind_speed_10m
- precipitation_probability

#### Informação importante: 

Teremos um arquivo com as funções do OpenMeteo, para que o projeto não faça requisições diretas à API, mas sim use as funções desse arquivo.

Fluxo de pesquisa para receber o nome da cidade e pegar as informações do clima: 
- O usuário digita o nome da cidade.
- O projeto pega o nome da cidade e usa o OpenMeteo para pegar as informações de latitude, longitude e timezone da cidade.
- Ao pegar essas informações, o projeto as usa parafazera requisição e pegar as informações do clima daquele lugar.
- Caso não encontre as informações da cidade, se comportar como se não tivesse achado nada.
- Caso ache as informações da cida, mas não encontre as informações de clima, se comportar com se não tivesse achado nada.

A busca envolve as duas requisições (Buscar latitude/longitude/timezone e buscar clima). Mas para o usuário, será apenas uma, com loading.

As funções do OpenMeteo devem verificar se os parâmetros vieram, caso contrário, agir com se não tivesse vindo.

### Aspéctos visuais:

Tem que ter Empty state.

Teremosuma área superior centralizada que terá apenas o campo de busca da cidade.

O projeto terá um sidebar na esquerda com as seguintes infromações:
- Temperatura
- Nome da cidade, código do país
- Dia atual 
- Se é dia ou noite (baseado no is_day)
- Weather code

Na área principal teremos:
- Umidade relativa do ar
- Temperatura aparente
- Probabilidade de precipitação
- Velocidade e direção do vento

Designe geral:
- O projeto terá um fundo cinza escuro
- A parte superios não terá background, mas tanto sidebar quanto área principal ficarão dentro de umadiv com borda arredondada, fundo branco, centrlizado e co largura máxima de 800px.

Informações de interpretação do weather code:
WMO Weather interpretation codes (WW)
Code	Description
0	Clear sky
1, 2, 3	Mainly clear, partly cloudy, and overcast
45, 48	Fog and depositing rime fog
51, 53, 55	Drizzle: Light, moderate, and dense intensity
56, 57	Freezing Drizzle: Light and dense intensity
61, 63, 65	Rain: Slight, moderate and heavy intensity
66, 67	Freezing Rain: Light and heavy intensity
71, 73, 75	Snow fall: Slight, moderate, and heavy intensity
77	Snow grains
80, 81, 82	Rain showers: Slight, moderate, and violent
85, 86	Snow showers slight and heavy
95 *	Thunderstorm: Slight or moderate
96, 99 *	Thunderstorm with slight and heavy hail
