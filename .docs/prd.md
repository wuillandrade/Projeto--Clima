# PRD — Clima

## 1. Visão do produto

O Clima é uma aplicação web responsiva que permite pesquisar uma cidade e visualizar as condições meteorológicas atuais daquele local. A pessoa usuária informa o nome da cidade uma única vez; a aplicação coordena internamente a busca da localização e, em seguida, a busca do clima na Open-Meteo.

O produto deve ser simples, rápido e legível: a busca fica no topo, o resultado ocupa um painel central com uma coluna de resumo à esquerda e os indicadores detalhados na área principal.

## 2. Objetivos

- Permitir pesquisar o clima atual por nome de cidade.
- Exibir temperatura, sensação térmica, umidade, chuva, vento, período do dia e condição meteorológica.
- Manter as requisições à Open-Meteo isoladas em um módulo próprio.
- Informar claramente os estados vazio, carregando, sucesso e erro.
- Oferecer uma experiência acessível em desktop e dispositivos móveis.

### 2.1 Fora de escopo da primeira versão

- Previsão por hora ou por vários dias.
- Histórico de pesquisas, favoritos ou geolocalização automática.
- Alteração de unidade de medida.
- Autenticação, backend ou persistência de dados.
- Tradução para outros idiomas além da interface em português.

## 3. Público e cenário principal

Uma pessoa que quer consultar rapidamente o clima atual de uma cidade, sem precisar interpretar uma resposta técnica da API.

### Fluxo principal

1. A pessoa abre a aplicação e vê o empty state.
2. Digita o nome de uma cidade no campo de busca.
3. Pressiona Enter ou aciona o botão de busca.
4. A aplicação mostra um loading enquanto executa as duas requisições.
5. Se a cidade e o clima forem encontrados, exibe o painel meteorológico.
6. Se qualquer etapa não encontrar dados ou falhar, exibe um estado de erro recuperável.

## 4. Requisitos funcionais

### RF01 — Busca de cidade

- Deve existir um campo de texto no topo da página.
- O campo deve aceitar o nome da cidade e remover espaços excedentes nas extremidades antes da consulta.
- Uma busca vazia não deve disparar requisição; deve mostrar uma mensagem de validação próxima ao campo.
- A busca deve ser acionada por Enter e por um botão com ação explícita.
- Enquanto a busca estiver em andamento, o controle deve indicar carregamento e impedir submissões duplicadas.

### RF02 — Consulta de localização

O módulo de integração deve consultar:

```text
GET https://geocoding-api.open-meteo.com/v1/search
  ?name={nome codificado}
  &count=1
  &language=pt
  &format=json
```

Devem ser extraídos do primeiro item de `results`:

- `name`
- `latitude`
- `longitude`
- `country_code`
- `timezone`

Se `results` não existir ou estiver vazio, a busca deve ser tratada como cidade não encontrada.

### RF03 — Consulta meteorológica

Com latitude, longitude e timezone válidos, o módulo deve consultar:

```text
GET https://api.open-meteo.com/v1/forecast
  ?latitude={latitude}
  &longitude={longitude}
  &current=precipitation_probability,temperature_2m,relative_humidity_2m,is_day,apparent_temperature,wind_speed_10m,wind_direction_10m,precipitation,weather_code
  &timezone={timezone codificado}
```

O contrato mínimo esperado é:

- `current_units`: unidades retornadas pela API para os valores exibidos.
- `current`: valores atuais.
- Campos obrigatórios de `current`: `temperature_2m`, `relative_humidity_2m`, `apparent_temperature`, `is_day`, `wind_speed_10m` e `precipitation_probability`.
- `wind_direction_10m` e `weather_code` também devem ser solicitados para completar a interface.

Se a resposta não tiver `current` ou algum campo obrigatório, a aplicação deve exibir erro e não montar um resultado parcial.

### RF04 — Orquestração

- A camada de UI não deve montar URLs nem chamar `fetch` diretamente.
- Uma função de alto nível deve receber o nome da cidade, consultar a geocodificação e então consultar o clima.
- Parâmetros ausentes ou inválidos devem resultar em um erro controlado, sem chamada à API.
- Erros de rede, HTTP ou formato devem ser convertidos em um resultado de erro consumível pela UI.
- A resposta deve incluir cidade, localização e clima normalizados para que a interface não dependa do formato bruto da API.

### RF05 — Exibição do resultado

#### Resumo lateral

- Temperatura atual em destaque, com unidade.
- Nome da cidade e código do país.
- Data e horário atuais, formatados no timezone retornado para a cidade.
- Indicação textual de `Dia` ou `Noite`, baseada em `is_day`.
- Descrição textual do `weather_code`.

#### Área principal

- Umidade relativa do ar.
- Temperatura aparente.
- Probabilidade de precipitação.
- Velocidade do vento.
- Direção do vento em graus e, preferencialmente, direção cardeal calculada para facilitar a leitura.

As unidades devem vir de `current_units` sempre que disponíveis. A interface pode usar valores padrão coerentes (`°C`, `%` e `km/h`) apenas como fallback visual, nunca alterando o valor recebido.

### RF06 — Interpretação do código meteorológico

A aplicação deve manter um mapa local de códigos WMO para descrição em português:

| Código | Descrição |
| --- | --- |
| 0 | Céu limpo |
| 1, 2, 3 | Predominantemente limpo, parcialmente nublado e nublado |
| 45, 48 | Nevoeiro |
| 51, 53, 55 | Chuvisco: leve, moderado e intenso |
| 56, 57 | Chuvisco congelante |
| 61, 63, 65 | Chuva: fraca, moderada e forte |
| 66, 67 | Chuva congelante |
| 71, 73, 75 | Neve: fraca, moderada e forte |
| 77 | Grãos de neve |
| 80, 81, 82 | Pancadas de chuva |
| 85, 86 | Pancadas de neve |
| 95 | Trovoada fraca ou moderada |
| 96, 99 | Trovoada com granizo |

Código não mapeado deve ser exibido como `Condição não identificada`, sem quebrar a tela.

## 5. Estados da aplicação

O estado da busca deve ser explícito e mutuamente exclusivo:

- **Vazio:** nenhum resultado foi consultado. Exibir orientação curta para pesquisar uma cidade.
- **Carregando:** requisições em andamento. Exibir indicador visual, manter o campo preenchido e bloquear nova submissão.
- **Sucesso:** exibir o painel completo do clima.
- **Cidade não encontrada:** informar que não foi possível localizar a cidade e permitir nova busca.
- **Clima indisponível:** informar que a cidade foi localizada, mas os dados meteorológicos não estão disponíveis.
- **Erro de rede/API:** informar falha temporária e oferecer nova tentativa.

Mensagens de erro não devem expor URL, stack trace ou detalhes técnicos para a pessoa usuária.

## 6. Arquitetura técnica

### Stack

- Vite.
- TypeScript.
- JavaScript/DOM nativo, sem framework de UI.
- CSS nativo.
- Open-Meteo Geocoding API e Forecast API.

### Organização recomendada

```text
src/
  api/
    open-meteo.ts       # chamadas HTTP e validação de respostas
    types.ts            # tipos da API e tipos normalizados
  weather/
    weather-code.ts     # mapa WMO e conversão de direção do vento
    formatters.ts       # data, hora, números e unidades
  ui/
    render.ts           # renderização dos estados e dados
  main.ts               # eventos e orquestração da aplicação
  style.css             # estilos globais e responsivos
```

Os nomes podem ser ajustados ao estilo final do projeto, mas a responsabilidade de requisição deve permanecer separada da renderização.

### Tipos normalizados sugeridos

```ts
type Location = {
  name: string
  latitude: number
  longitude: number
  countryCode: string
  timezone: string
}

type CurrentWeather = {
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

type WeatherResult = {
  location: Location
  current: CurrentWeather
}
```

Os tipos devem usar `unknown` na entrada externa e validação antes de converter para tipos internos. Não assumir que a API sempre retornará todos os campos.

## 7. Diretrizes visuais

### Composição

- A página deve usar fundo cinza escuro.
- A área de busca fica no topo, centralizada e fora do painel de resultado.
- O resultado fica dentro de um contêiner branco, centralizado, com largura máxima de `800px`.
- O contêiner de resultado deve ter bordas arredondadas e conter duas áreas: sidebar à esquerda e conteúdo principal à direita.
- O empty state ocupa o espaço disponível de forma equilibrada e orienta a primeira ação sem parecer uma tela quebrada.

### Layout de sucesso

- Desktop: sidebar estreita e área principal mais larga, em duas colunas.
- Mobile: sidebar acima do conteúdo principal, em uma única coluna.
- Os indicadores da área principal devem ser apresentados em uma grade de cartões ou blocos informativos, sem excesso de decoração.
- A temperatura deve ser o maior elemento tipográfico do resumo; os demais dados devem seguir uma hierarquia clara.

### Estilo

- Usar variáveis CSS para cores, espaçamentos, raios e sombras.
- Garantir contraste suficiente entre texto, fundo branco e fundo da página.
- Usar ícones simples e consistentes para umidade, temperatura, chuva e vento, sempre acompanhados de texto ou rótulo acessível.
- Diferenciar dia e noite com texto e ícone, nunca somente por cor.
- Evitar que valores longos, nomes de cidades ou mensagens quebrem o layout.
- Respeitar `prefers-reduced-motion` caso sejam adicionadas transições.

### Responsividade

- O painel deve caber na viewport sem rolagem horizontal.
- Em telas estreitas, reduzir padding e transformar a grade de indicadores em uma coluna ou duas colunas estáveis conforme o espaço disponível.
- O campo e o botão de busca devem permanecer utilizáveis com toque, com área de interação mínima de aproximadamente `44px`.
- A largura deve ser fluida até o limite de `800px`, com margens laterais seguras.

## 8. Acessibilidade

- Usar `lang="pt-BR"` no documento.
- Associar um `label` visível ou acessível ao campo de cidade.
- Usar `form` para a busca e `button type="submit"` para o acionamento.
- Aplicar `aria-live="polite"` na região de status para anunciar carregamento e resultado.
- Garantir foco visível e ordem de tabulação lógica.
- Não usar apenas cor para comunicar estados ou período do dia.
- Fornecer `alt` descritivo quando houver imagens; ícones decorativos devem ser ignorados por leitores de tela.
- Usar `Intl.DateTimeFormat` com o timezone da cidade ao formatar data e hora.

## 9. Segurança, rede e desempenho

- Usar `URLSearchParams` ou `URL` para codificar parâmetros, principalmente nome da cidade e timezone.
- Não inserir valores vindos da API com `innerHTML` sem escape; preferir `textContent` ou uma camada de renderização segura.
- Tratar somente respostas HTTP bem-sucedidas como válidas.
- Usar `AbortController` para cancelar uma busca anterior quando uma nova for iniciada.
- Não criar cache persistente na primeira versão; a consulta deve sempre refletir uma nova busca.
- O bundle deve permanecer pequeno, sem adicionar biblioteca apenas para formatar ou renderizar os dados.

## 10. Critérios de aceite

- [ ] Ao abrir a aplicação, o empty state e o campo de busca são exibidos.
- [ ] Uma cidade válida dispara geocodificação e, depois, consulta meteorológica com os parâmetros corretos.
- [ ] A UI exibe loading durante todo o fluxo das duas requisições.
- [ ] O sucesso exibe temperatura, cidade, país, data/hora, dia/noite, condição, umidade, sensação térmica, chuva e vento.
- [ ] O código WMO é convertido para uma descrição em português, incluindo fallback para código desconhecido.
- [ ] Busca vazia não chama a API e mostra validação.
- [ ] Cidade inexistente mostra estado de não encontrado sem quebrar a interface.
- [ ] Falha na segunda requisição mostra erro de clima indisponível.
- [ ] Erros de rede e respostas inválidas são tratados com mensagem recuperável.
- [ ] Enter e botão executam a mesma ação de busca.
- [ ] O layout funciona sem rolagem horizontal em viewport móvel e desktop.
- [ ] O projeto passa em `npm run build`.

## 11. Testes recomendados

### Unitários

- Validação de parâmetros da camada Open-Meteo.
- Normalização das respostas de geocodificação e forecast.
- Mapeamento de todos os códigos WMO listados.
- Conversão de graus para direção cardeal.
- Formatação da data usando timezone diferente do timezone local do navegador.

### Integração/UI

- Busca com sucesso.
- Cidade não encontrada.
- Cidade encontrada sem clima válido.
- Falha de rede.
- Submissão vazia.
- Bloqueio de submissões duplicadas durante loading.

## 12. Decisões pendentes

Estas escolhas não impedem a implementação inicial, mas devem ser confirmadas antes do refinamento visual:

- Nome final exibido no cabeçalho: `Clima` ou outro nome de produto.
- Ícones: biblioteca externa ou conjunto de SVGs locais.
- Deve existir um botão explícito ao lado do campo ou o submit por Enter será suficiente? Este PRD recomenda botão explícito para descoberta e acessibilidade.
- O horário deve exibir apenas hora e minuto ou também a data completa? Este PRD recomenda data curta, hora e minuto.
- A direção do vento deve mostrar somente graus ou também uma direção cardeal? Este PRD recomenda ambos.
- Deseja-se uma unidade fixa em Celsius/km/h ou controles de unidade na próxima versão? A primeira versão mantém as unidades retornadas pela API.

## 13. Referências

- Open-Meteo Geocoding API: https://geocoding-api.open-meteo.com/v1/search
- Open-Meteo Forecast API: https://api.open-meteo.com/v1/forecast
- Códigos de interpretação meteorológica WMO, conforme tabela fornecida no brain dump.