# Clima

Aplicação web para consultar as condições meteorológicas atuais de uma cidade. A aplicação exibe temperatura, sensação térmica, umidade, precipitação, vento, direção do vento e a localização no mapa.

## Demonstração

https://wuillandrade.github.io/Projeto--Clima/

## Tecnologias

- TypeScript
- Vite
- Vitest
- API Open-Meteo
- OpenStreetMap para o mapa de localização

## Como executar localmente

### Pré-requisitos

- Node.js 22 ou superior
- npm

### Instalação

```bash
npm install
```

### Servidor de desenvolvimento

```bash
npm run dev
```

O Vite exibirá no terminal o endereço local para acessar a aplicação.

### Build de produção

```bash
npm run build
```

Os arquivos de produção serão gerados na pasta `dist`.

### Visualizar o build

```bash
npm run preview
```

### Testes

```bash
npm test
```

## Estrutura do projeto

```text
src/
├── api/          Integração com a API Open-Meteo e tipos das respostas
├── assets/       Recursos estáticos da aplicação
├── ui/           Renderização dos estados e dos dados meteorológicos
├── weather/      Formatação e interpretação dos códigos climáticos
├── main.ts       Inicialização da aplicação e fluxo de busca
└── style.css     Estilos e responsividade
```

## Deploy

O deploy é feito automaticamente pelo GitHub Actions através do workflow em `.github/workflows/deploy.yml`.

Cada push para a branch `main` executa os seguintes passos:

1. Instala as dependências com `npm ci`.
2. Executa `npm run build`.
3. Publica a pasta `dist` no GitHub Pages.

O caminho base do Vite está configurado em `vite.config.ts` para o repositório `Projeto--Clima`.

Para habilitar a publicação no GitHub, acesse **Settings > Pages** e selecione **GitHub Actions** como fonte de deploy.
