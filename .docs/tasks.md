# Tarefas de implementação — Clima

Este documento detalha a execução do PRD em tarefas menores e verificáveis. A fonte primária dos requisitos é o arquivo [prd.md](./prd.md). Este arquivo organiza a implementação em blocos executáveis, sem repetir o conteúdo completo do PRD.

## 1. Setup inicial e estrutura do projeto

- [x] Confirmar que o projeto Vite + TypeScript está funcionando localmente e que `npm run build` conclui com sucesso.
  - Critério de aprovação: o comando de build retorna exit code 0 e a aplicação inicializa sem erro de compilação.

- [x] Criar a estrutura de pastas em `src/`, separando `api`, `weather`, `ui`, estilos e arquivo principal.
  - Critério de aprovação: a organização do projeto reflete a separação de responsabilidades proposta no PRD.

- [x] Configurar o HTML com `lang="pt-BR"` e semântica básica da página.
  - Critério de aprovação: o documento usa idioma em português e a marcação inicial está correta para acessibilidade.

- [x] Montar o layout base da página com busca no topo e painel central para resultado.
  - Critério de aprovação: a interface mostra campo de busca acima do contêiner principal e mantém organização alinhada ao PRD.

## 2. Modelagem de tipos e validação

- [x] Definir `Location`, `CurrentWeather`, `WeatherResult` e tipos auxiliares para dados normalizados.
  - Critério de aprovação: os tipos correspondem aos campos exigidos no PRD e são usados em toda a aplicação.

- [x] Validar todos os dados externos com `unknown` antes de converter para tipos internos.
  - Critério de aprovação: respostas incompletas ou malformadas são rejeitadas com erro controlado, sem quebrar a execução.

- [x] Criar erros específicos para cidade não encontrada, clima indisponível, rede/HTTP, resposta inválida e parâmetros inválidos.
  - Critério de aprovação: o estado da interface consegue distinguir cada erro e exibir mensagem adequada sem expor detalhes técnicos.

- [x] Garantir que os campos obrigatórios do clima sejam validados antes de montar um resultado.
  - Critério de aprovação: a aplicação não renderiza painel parcial quando `temperature_2m`, `relative_humidity_2m`, `apparent_temperature`, `is_day`, `wind_speed_10m` ou `precipitation_probability` estiverem ausentes.

## 3. Integração com a Open-Meteo

- [x] Criar um módulo dedicado às chamadas HTTP da Open-Meteo.
  - Critério de aprovação: toda a comunicação com a API fica isolada da camada de renderização.

- [x] Implementar a geocodificação com `GET /v1/search` usando `URLSearchParams`.
  - Critério de aprovação: a URL cresce com `name`, `count=1`, `language=pt` e `format=json`, e todos os parâmetros ficam corretamente codificados.

- [x] Extrair `name`, `latitude`, `longitude`, `country_code`, `timezone` do primeiro item em `results`.
  - Critério de aprovação: o primeiro resultado válido vira um objeto `Location` pronto para a busca meteorológica.

- [x] Tratar ausência de `results` ou lista vazia como cidade não encontrada.
  - Critério de aprovação: quando a cidade não existe, a UI entra no estado específico de "cidade não encontrada" sem seguir para a segunda requisição.

- [x] Implementar a consulta meteorológica com `GET /v1/forecast` usando latitude, longitude e timezone.
  - Critério de aprovação: a requisição inclui todos os campos exigidos em `current` e usa `timezone` como informado pela geocodificação.

- [x] Validar `current_units` e o bloco `current` antes de aceitar a resposta.
  - Critério de aprovação: a aplicação rejeita respostas incompletas e exibe erro quando algum campo obrigatório estiver ausente.

- [x] Adicionar `AbortController` para cancelar busca anterior ao iniciar uma nova consulta.
  - Critério de aprovação: uma segunda busca interrompe a primeira sem gerar duplicidade ou estado inconsistente.

- [x] Garantir que a camada de UI não monte URLs nem chame `fetch` diretamente.
  - Critério de aprovação: toda a lógica HTTP está centralizada no módulo de API e `main.ts` apenas orquestra a ação.

## 4. Orquestração do fluxo principal

- [x] Criar a função de alto nível que recebe o nome da cidade e executa geocodificação + clima.
  - Critério de aprovação: a função realiza a sequência correta e retorna resultado normalizado ou erro controlado.

- [x] Validar entrada vazia e remover espaços em excesso antes da busca.
  - Critério de aprovação: busca vazia ou apenas com espaços não dispara API e exibe mensagem de validação.

- [x] Implementar estado de carregamento durante as duas requisições.
  - Critério de aprovação: a UI mantém o campo preenchido e impede submissões duplicadas enquanto a busca está em andamento.

- [x] Normalizar a resposta final para estrutura pronta para renderização.
  - Critério de aprovação: a interface recebe um objeto consistente, sem depender de campos brutos da API.

- [x] Tratar falhas de rede, HTTP e resposta inválida como erro consumível pela UI.
  - Critério de aprovação: nenhuma exceção não tratada chega ao render; a tela mostra estado de erro recuperável.

## 5. Interpretação meteorológica e formatação

- [x] Criar mapa local de códigos WMO em português conforme a tabela do PRD.
  - Critério de aprovação: todos os códigos listados são convertidos em descrição legível e o fallback usa `Condição não identificada`.

- [x] Converter `wind_direction_10m` para graus e direção cardeal.
  - Critério de aprovação: a interface mostra direção em graus e, preferencialmente, a direção cardeal correspondente.

- [x] Formatar data e hora com `Intl.DateTimeFormat` e o timezone da cidade.
  - Critério de aprovação: a hora exibida respeita o timezone retornado pela API e não o do navegador.

- [x] Definir texto de `Dia` ou `Noite` a partir de `is_day`.
  - Critério de aprovação: o período do dia aparece textualmente e não depende apenas da cor.

- [x] Normalizar unidades com `current_units` e fallback visual coerente.
  - Critério de aprovação: a interface usa unidades da API quando disponíveis e mantém fallback apenas para casos sem unidade.

## 6. Estados da interface

- [x] Implementar o estado vazio com orientação para a primeira busca.
  - Critério de aprovação: ao abrir a aplicação, a tela mostra mensagem de instrução e não fica visivelmente quebrada.

- [x] Implementar o estado de carregamento com indicador visual e bloqueio de nova ação.
  - Critério de aprovação: o estado é visível, exclusivo e impede nova submissão enquanto a busca segue em andamento.

- [x] Implementar o painel de sucesso com resumo e indicadores detalhados.
  - Critério de aprovação: a tela exibe cidade, país, temperatura, condição, data/hora, umidade, sensação térmica, precipitação e vento.

- [x] Implementar o estado de cidade não encontrada.
  - Critério de aprovação: a interface informa que a cidade não foi localizada e permite nova tentativa sem quebrar o layout.

- [x] Implementar o estado de clima indisponível.
  - Critério de aprovação: quando a cidade é localizada, mas o clima não é válido, a mensagem informa o problema e mantém a tela funcional.

- [x] Implementar o estado de erro de rede/API com mensagem recuperável.
  - Critério de aprovação: falhas temporárias são comunicadas sem expor URL, stack trace ou detalhes técnicos.

## 7. Renderização e composição visual

- [x] Criar painel de resultado com sidebar e área principal em desktop.
  - Critério de aprovação: a versão desktop mantém a divisão sugerida no PRD, com resumo à esquerda e indicadores à direita.

- [x] Transformar o layout para uma coluna única em mobile.
  - Critério de aprovação: em telas estreitas, a sidebar fica acima do conteúdo principal e o painel continua legível.

- [x] Exibir resumo lateral com temperatura, cidade, país, data/hora, período do dia e descrição do clima.
  - Critério de aprovação: a sidebar mostra os dados essenciais com hierarquia clara e sem quebra visual.

- [x] Exibir área principal com cartões para umidade, sensação térmica, precipitação, vento e direção do vento.
  - Critério de aprovação: os indicadores aparecem em blocos organizados, sem excesso de decoração.

- [x] Garantir que o layout não gere rolagem horizontal.
  - Critério de aprovação: a aplicação se ajusta à viewport e não causa overflow lateral em desktop nem mobile.

- [x] Aplicar variáveis CSS para cores, espaçamentos, bordas e sombras.
  - Critério de aprovação: a paleta e os espaçamentos ficam consistentes em toda a interface.

## 8. Interação e acessibilidade

- [x] Associar um `label` visível ou acessível ao campo de busca.
  - Critério de aprovação: o usuário identifica facilmente o campo e o leitor de tela reconhece a finalidade do controle.

- [x] Usar `form` com `button type="submit"` para a busca.
  - Critério de aprovação: Enter e botão disparam a mesma ação e o fluxo funciona com teclado e mouse.

- [x] Aplicar `aria-live="polite"` na região de status.
  - Critério de aprovação: alterações de carregamento e resultado são anunciadas de forma acessível.

- [x] Garantir foco visível e ordem de tabulação lógica.
  - Critério de aprovação: a navegação por teclado segue ordem natural e o foco é visível em todos os elementos relevantes.

- [x] Evitar uso exclusivo de cor para indicar estados e período do dia.
  - Critério de aprovação: textos e ícones complementam a informação para não depender apenas da cor.

- [x] Não usar `innerHTML` com dados vindos da API.
  - Critério de aprovação: o código usa `textContent` ou outra renderização segura para evitar injeção de conteúdo externo.

## 9. Segurança e qualidade de implementação

- [x] Codificar parâmetros com `URLSearchParams` ou `URL` para cidade e timezone.
  - Critério de aprovação: nomes com caracteres especiais e espaços são enviados corretamente para a API.

- [x] Tratar somente respostas HTTP bem-sucedidas como válidas.
  - Critério de aprovação: respostas 4xx e 5xx são convertidas em erro sem renderização parcial.

- [x] Implementar mensagens amigáveis para o usuário sem expor detalhes técnicos.
  - Critério de aprovação: as mensagens não contêm URL, stack trace, dados internos ou instruções de depuração.

- [x] Garantir que o bundle permaneça leve e sem bibliotecas extras apenas para formatação.
  - Critério de aprovação: a solução continua minimalista e usa recursos nativos do navegador.

## 10. Testes e validação

- [x] Validar parâmetros da camada Open-Meteo.
  - Critério de aprovação: entradas inválidas são rejeitadas corretamente e não disparam requisição.

- [x] Testar normalização das respostas de geocodificação e forecast.
  - Critério de aprovação: os dados vindos da API são convertidos para o formato interno esperado.

- [x] Cobrir todos os códigos WMO do PRD.
  - Critério de aprovação: cada código listável é convertido para texto em português e o fallback é usado para valores desconhecidos.

- [x] Testar conversão de graus para direção cardeal.
  - Critério de aprovação: a direção do vento é interpretada corretamente nos pontos cardeais principais.

- [x] Testar formatação de data e hora em timezone diferente do local do navegador.
  - Critério de aprovação: o horário exibido corresponde ao timezone da cidade e não ao timezone do navegador.

- [x] Testar busca com sucesso.
  - Critério de aprovação: cidade válida dispara geocodificação e clima, e a UI renderiza conteúdo correto.

- [x] Testar cidade não encontrada.
  - Critério de aprovação: a interface informa a falha específica sem quebrar a experiência.

- [x] Testar cidade encontrada sem clima válido.
  - Critério de aprovação: resposta meteorológica incompleta resulta em erro consistente e sem painel parcial.

- [x] Testar falha de rede.
  - Critério de aprovação: a aplicação mostra erro recuperável e mantém o estado funcional.

- [x] Testar submissão vazia.
  - Critério de aprovação: busca vazia não chama a API e mostra validação ao usuário.

- [x] Testar bloqueio de envio duplicado durante o carregamento.
  - Critério de aprovação: uma segunda submissão não dispara nova requisição enquanto a primeira ainda está em execução.

- [x] Rodar `npm run build` como verificação final do projeto.
  - Critério de aprovação: o comando retorna sucesso e a aplicação compila sem erros.

## 11. Revisão final e critérios de aceite

- [x] Revisar a implementação contra todos os critérios do PRD.
  - Critério de aprovação: cada item do documento-base foi conferido em comportamento, UX e acessibilidade.

- [x] Validar a aplicação em desktop e mobile.
  - Critério de aprovação: layout, legibilidade e interação continuam funcionais em diferentes larguras de tela.

- [x] Ajustar detalhes finais de UX, acessibilidade e responsividade.
  - Critério de aprovação: a entrega permanece consistente visualmente e fácil de usar.

- [x] Manter a referência ao PRD como fonte principal de requisitos.
  - Critério de aprovação: a documentação do projeto aponta para [prd.md](./prd.md) e evita duplicação desnecessária de regras.

## Sequência recomendada

1. Setup inicial e estrutura.
2. Tipos e validação.
3. Integração com Open-Meteo.
4. Orquestração do fluxo.
5. Interpretação e formatação meteorológica.
6. Estados da UI e renderização.
7. Estilo, responsividade e acessibilidade.
8. Testes, revisão final e build.

## Observações finais

- A implementação deve manter a separação entre camada de requisições e camada de renderização.
- O foco principal é a correção funcional, a clareza da interface e a acessibilidade, antes de refinamentos visuais extras.
- O documento-base é [prd.md](./prd.md); qualquer alteração relevante de comportamento deve ser conferida ali antes de ser considerada concluída.
