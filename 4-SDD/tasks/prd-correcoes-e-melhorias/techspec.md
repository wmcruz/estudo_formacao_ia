# Especificação técnica

## Resumo executivo

Esta especificação técnica consolida as correções e melhorias apontadas no code review (P-01 a P-08) da feature "Listagem e Busca de Posts" e o problema de apresentação do tema Material, sem adicionar novas funcionalidades de produto. No backend, a correção central é tornar os timeouts da integração com o JsonPlaceholder efetivos (P-01): o `RestClientConfig` passará a injetar o `RestClient.Builder` auto-configurado pelo Spring Boot, de modo que `spring.http.client.connect-timeout=5s` e `spring.http.client.read-timeout=10s` sejam de fato aplicados; além disso, o `PostService` receberá logging SLF4J (P-07) e o `GlobalExceptionHandler` ganhará um handler para `MethodArgumentTypeMismatchException`, padronizando o envelope de erro para ID não numérico (P-06).

No frontend, o tema pré-definido do Material (`indigo-pink`) será carregado globalmente via `angular.json` (build e test), as fontes Roboto e Material Icons serão carregadas por Google Fonts no `index.html`, a rota `/posts` passará a usar lazy loading com `loadComponent` para reduzir o bundle inicial (P-08), o `PostsPageComponent` será refatorado para ≤30 linhas usando signals e delegação ao service (P-02), as interfaces de modelo serão separadas em arquivos próprios (P-05) e o paginator passará a iniciar com 10 itens por página (P-03), com teste de paginação real reforçado (P-04). As mensagens de erro continuam em inglês no envelope do backend e serão traduzidas para PT-BR no frontend por um mapa `code → mensagem` no `PostService`.

A estratégia de testes mantém os 51 testes existentes verdes e adiciona ~20 novos cenários (config, logging, envelope para ID não numérico, paginação real, tema aplicado e mensagens amigáveis PT-BR), visando cobertura >80%.

## Arquitetura do sistema

### Visão dos componentes

**Backend (Spring Boot 4.1 — Java 17)**

| Componente | Responsabilidade | Status |
|---|---|---|
| `RestClientConfig` | Criar bean `RestClient` a partir do `RestClient.Builder` auto-configurado injetado, aplicando `baseUrl` do JsonPlaceholder — torna os timeouts do `application.properties` efetivos | Modificado |
| `PostService` | Orquestrar chamadas ao `RestClient`; adicionar logging SLF4J (INFO início/sucesso, WARN não encontrado, ERROR upstream) | Modificado |
| `GlobalExceptionHandler` | Adicionar handler para `MethodArgumentTypeMismatchException` → 400 `INVALID_POST_ID` no envelope padronizado | Modificado |
| `PostController` | Receber requisições GET `/api/posts` e `/api/posts/{id}`, delegar ao service, retornar DTO | Inalterado |
| `PostDto` | Record de saída (`userId`, `id`, `title`, `body`) | Inalterado |
| `ErrorResponseDto` | Envelope de erro (`ErrorDetail { code, message }`) | Inalterado |
| `PostNotFoundException` / `ExternalApiException` | Exceções customizadas mapeadas para 404/502 | Inalterado |

**Frontend (Angular 17.3 — TypeScript)**

| Componente | Responsabilidade | Status |
|---|---|---|
| `angular.json` | Registrar o tema pré-definido `@angular/material/prebuilt-themes/indigo-pink.css` em `styles` (targets `build` e `test`) | Modificado |
| `index.html` | Carregar Roboto + Material Icons via Google Fonts; adicionar classe `mat-app-background` ao `body` | Modificado |
| `styles.css` | Estilos globais (font-family Roboto, reset de margem do `body`) | Modificado |
| `app.routes.ts` | Rota `/posts` com `loadComponent` (lazy loading) — remove import estático de `PostsPageComponent` | Modificado |
| `PostsPageComponent` | Refatorar para classe ≤30 linhas com `signal()` para estado e handlers privados curtos, delegando orquestração ao `PostService` | Modificado |
| `PostTableComponent` | Adicionar `[pageSize]="10"` ao `mat-paginator`; comportamento de paginação inalterado | Modificado |
| `PostService` | Adicionar `getFriendlyMessage()`: mapa `code → mensagem PT-BR` amigável ao usuário | Modificado |
| `error-response.model.ts` | Manter apenas `ErrorResponse`; `ErrorDetail` movido para arquivo próprio | Modificado |
| `error-detail.model.ts` | Nova interface `ErrorDetail` em arquivo próprio | Novo |
| `PostSearchComponent` | Sem mudanças funcionais (apenas alvo do teste de tema aplicado) | Inalterado |

**Fluxo de dados (inalterado):**

```
Usuário → PostsPageComponent → PostService (Angular) → HttpClient
  → PostController (Spring Boot) → PostService → RestClient
  → https://jsonplaceholder.typicode.com (timeouts 5s/10s efetivos)
  → Envelope de erro padronizado (400/404/502) ou PostDto ← voltando
  → PostsPageComponent → mensagem PT-BR amigável via getFriendlyMessage()
```

**Mudança no fluxo de carregamento do frontend:**

```
Antes: /posts carregada eager → Material + página entram no bundle inicial (664 kB)
Depois: app shell leve no bundle inicial; /posts via loadComponent → chunk separado
  carregado somente ao navegar para a rota
```

## Design de implementação

### Principais interfaces

**Backend — Java**

```java
// RestClientConfig.java
@Configuration
public class RestClientConfig {
    @Bean
    public RestClient restClient(RestClient.Builder builder,
                                 @Value("${jsonplaceholder.url}") String baseUrl) {
        return builder.baseUrl(baseUrl).build();
    }
}

// GlobalExceptionHandler.java — novo handler
@ExceptionHandler(MethodArgumentTypeMismatchException.class)
public ResponseEntity<ErrorResponseDto> handleTypeMismatch(MethodArgumentTypeMismatchException ex);
```

> O `RestClient.Builder` injetado é o bean `prototype` auto-configurado pelo Spring Boot (que consome `spring.http.client.connect-timeout`/`read-timeout`). Injetar o builder (em vez de usar `RestClient.builder()` estático) é o que torna os timeouts efetivos (P-01).

**Frontend — TypeScript**

```typescript
// post.service.ts — nova API
export class PostService {
  getPosts(): Observable<Post[]>;
  getPostById(id: number): Observable<Post>;
  getFriendlyMessage(error: ErrorResponse): string; // mapa code → PT-BR
}

// error-detail.model.ts — nova
export interface ErrorDetail {
  code: string;
  message: string;
}
```

### Modelos de dados

Contratos JSON do backend — prontos para exibição na UI. Campos ausentes no upstream são normalizados para `null`. **Nenhum contrato de dados muda** nesta feature; as mudanças são de configuração, tratamento de erro, observabilidade e carregamento. Os contratos são documentados abaixo para referência e para registrar o novo cenário de ID não numérico (que passa a usar o envelope padronizado).

#### `PostDto` — representação de um post do JsonPlaceholder (inalterado)

| Campo | Tipo | Obrigatório | Descrição |
|---|---|---|---|
| `userId` | `integer` | sim | ID do usuário autor do post |
| `id` | `integer` | sim | Identificador único do post (1–100) |
| `title` | `string` | sim | Título do post |
| `body` | `string` | sim | Corpo/conteúdo do post |

```json
{
  "userId": 1,
  "id": 1,
  "title": "sunt aut facere repellat provident occaecati excepturi optio reprehenderit",
  "body": "quia et suscipit\nsuscipit recusandae consequuntur expedita et cum\nreprehenderit molestiae ut ut quas totam\nnostrum rerum est autem sunt rem eveniet architecto"
}
```

#### `ErrorResponseDto` — envelope de erro tipado (inalterado; agora cobre ID não numérico)

| Código | HTTP | Significado |
|---|---|---|
| `POST_NOT_FOUND` | `404` | O ID informado não corresponde a nenhum post na API externa |
| `INVALID_POST_ID` | `400` | O ID informado é inválido: não numérico (ex.: `abc`), `0` ou negativo |
| `EXTERNAL_API_ERROR` | `502` | Falha na comunicação com o JsonPlaceholder (timeout de conexão/leitura, indisponibilidade, status 5xx) |

```json
{
  "error": {
    "code": "POST_NOT_FOUND",
    "message": "Post with ID 999 was not found"
  }
}
```

```json
{
  "error": {
    "code": "INVALID_POST_ID",
    "message": "Post ID must be a positive integer"
  }
}
```

> **Novo cenário (P-06):** `GET /api/posts/abc` agora retorna `400` com `INVALID_POST_ID` no envelope padronizado, em vez do body default do Spring. O frontend exibe a mensagem amigável PT-BR correspondente, sem vazar o detalhe técnico de conversão de tipo.

```json
{
  "error": {
    "code": "EXTERNAL_API_ERROR",
    "message": "Failed to communicate with external API"
  }
}
```

#### Mapeamento código de erro → mensagem amigável (frontend)

| Código (backend) | Mensagem exibida ao usuário (PT-BR) |
|---|---|
| `POST_NOT_FOUND` | `Post não encontrado` |
| `INVALID_POST_ID` | `ID do post deve ser um número inteiro positivo` |
| `EXTERNAL_API_ERROR` | `Não foi possível se comunicar com o serviço externo. Tente novamente.` |
| `UNKNOWN_ERROR` (fallback) | `Ocorreu um erro inesperado. Tente novamente.` |

> O mapa vive no `PostService.getFriendlyMessage()`. Se o código não estiver no mapa, usa-se `error.error.message` do backend e, como último recurso, a mensagem genérica `UNKNOWN_ERROR`. As mensagens do envelope do backend permanecem em inglês, conforme o padrão code-standards.

#### Mapeamento JsonPlaceholder → contrato

| Origem (JsonPlaceholder) | Destino (PostDto) |
|---|---|
| `userId` | `userId` |
| `id` | `id` |
| `title` | `title` |
| `body` | `body` |

> Mapeamento direto (1:1), sem transformações. Inalterado.

#### Parâmetros fixados no upstream (backend)

| API | Parâmetros principais |
|---|---|
| **JsonPlaceholder — posts** | `baseUrl=https://jsonplaceholder.typicode.com`, endpoints `/posts` (GET all) e `/posts/{id}` (GET by id) |
| **Timeouts (efetivos via auto-configuração)** | `spring.http.client.connect-timeout=5s`, `spring.http.client.read-timeout=10s` |

### Endpoints da API

#### Visão geral

| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/api/posts` | Retorna todos os 100 posts do JsonPlaceholder |
| `GET` | `/api/posts/{id}` | Retorna um post específico pelo ID |

> **Contratos HTTP inalterados.** A única diferença é o tratamento do ID não numérico no endpoint por ID, que passa a responder com o envelope padronizado.

---

#### `GET /api/posts`

Retorna todos os posts disponíveis no JsonPlaceholder. O backend faz proxy da chamada `GET https://jsonplaceholder.typicode.com/posts`. Comportamento inalterado; o `PostService` agora registra logs INFO/ERROR (ver Monitoramento e observabilidade).

**Respostas**

| Status | Corpo | Quando |
|---|---|---|
| `200` | `PostDto[]` | Consulta bem-sucedida ao JsonPlaceholder |
| `502` | `ErrorResponseDto` | JsonPlaceholder indisponível, timeout (5s/10s) ou status 5xx |

**Exemplo — sucesso**

```http
GET /api/posts
```

```json
[
  {
    "userId": 1,
    "id": 1,
    "title": "sunt aut facere repellat provident occaecati excepturi optio reprehenderit",
    "body": "quia et suscipit\nsuscipit recusandae consequuntur expedita..."
  },
  {
    "userId": 1,
    "id": 2,
    "title": "qui est esse",
    "body": "est rerum tempore vitae\nsequi sint nihil..."
  }
]
```

> O array sempre contém 100 elementos quando a API externa está disponível. O frontend consome o array completo e aplica paginação client-side.

**Exemplo — erro upstream**

```http
GET /api/posts
```

```json
{
  "error": {
    "code": "EXTERNAL_API_ERROR",
    "message": "Failed to communicate with external API"
  }
}
```

---

#### `GET /api/posts/{id}`

Retorna um post específico pelo seu ID. O backend faz proxy da chamada `GET https://jsonplaceholder.typicode.com/posts/{id}`.

**Path params**

| Param | Tipo | Default | Regras |
|---|---|---|---|
| `id` | `Long` | — | Obrigatório. Deve ser inteiro positivo (1–100 no JsonPlaceholder). Valor não numérico cai no novo handler (P-06) |

**Respostas**

| Status | Corpo | Quando |
|---|---|---|
| `200` | `PostDto` | Post encontrado com sucesso |
| `400` | `ErrorResponseDto` | ID não numérico (`abc`), `0` ou negativo — code `INVALID_POST_ID` |
| `404` | `ErrorResponseDto` | Post não encontrado na API externa — code `POST_NOT_FOUND` |
| `502` | `ErrorResponseDto` | Falha na comunicação com o JsonPlaceholder (timeout 5s/10s, indisponibilidade) — code `EXTERNAL_API_ERROR` |

**Exemplo — sucesso**

```http
GET /api/posts/1
```

```json
{
  "userId": 1,
  "id": 1,
  "title": "sunt aut facere repellat provident occaecati excepturi optio reprehenderit",
  "body": "quia et suscipit\nsuscipit recusandae consequuntur expedita et cum\nreprehenderit molestiae ut ut quas totam\nnostrum rerum est autem sunt rem eveniet architecto"
}
```

**Exemplo — ID não numérico (novo comportamento padronizado)**

```http
GET /api/posts/abc
```

```json
{
  "error": {
    "code": "INVALID_POST_ID",
    "message": "Post ID must be a positive integer"
  }
}
```

> O frontend exibe a mensagem amigável `ID do post deve ser um número inteiro positivo` via `getFriendlyMessage()`.

**Exemplo — post não encontrado**

```http
GET /api/posts/999
```

```json
{
  "error": {
    "code": "POST_NOT_FOUND",
    "message": "Post with ID 999 was not found"
  }
}
```

**Exemplo — erro upstream**

```http
GET /api/posts/1
```

```json
{
  "error": {
    "code": "EXTERNAL_API_ERROR",
    "message": "Failed to communicate with external API"
  }
}
```

> No frontend, todos os códigos de erro (`POST_NOT_FOUND`, `INVALID_POST_ID`, `EXTERNAL_API_ERROR`, `UNKNOWN_ERROR`) são convertidos para mensagens PT-BR amigáveis exibidas nas áreas `aria-live` de busca e tabela.

---

## Pontos de integração

### API externa — JsonPlaceholder

- **URL base**: `https://jsonplaceholder.typicode.com`
- **Endpoints consumidos**: `GET /posts` e `GET /posts/{id}`
- **Autenticação**: Nenhuma (API pública)
- **Formato**: JSON (`application/json`)
- **Limite de taxa**: Sem limite documentado; serviço gratuito com latência esporádica
- **Tratamento de erros**:
  - **Timeout**: conectado via `RestClient.Builder` auto-configurado — `spring.http.client.connect-timeout=5s` e `spring.http.client.read-timeout=10s` agora **efetivos** (P-01). Estouro de tempo lança `ExternalApiException` → 502 ao frontend em tempo hábil (RF-2.3)
  - **404**: JsonPlaceholder retorna body vazio `{}` para IDs inexistentes — o backend detecta e lança `PostNotFoundException`
  - **5xx**: Qualquer status 5xx do JsonPlaceholder é tratado como `ExternalApiException` → 502
  - **ID não numérico**: tratado no `GlobalExceptionHandler` por `MethodArgumentTypeMismatchException` → 400 `INVALID_POST_ID` (P-06)

### CORS

- Configurado via `@CrossOrigin(origins = "http://localhost:4200")` no `PostController` — inalterado
- Permite requisições GET do frontend Angular durante desenvolvimento local

## Abordagem de testes

Estratégia: manter os **51 testes existentes verdes** e adicionar ~20 cenários novos cobrindo as correções P-01 a P-08 e o tema. Os testes existentes que referenciam estado de classe (ex.: `posts` em `PostsPageComponent`) devem ser adaptados para a nova API de signals.

### Testes unitários

#### Backend — Java (JUnit 5 + Mockito + MockRestServiceServer)

**`RestClientConfigTest` (NOVO)** — prova que o bean é construído a partir do builder auto-configurado injetado (o que torna os timeouts efetivos)

| # | Cenário de teste | Setup | Resultado esperado |
|---|---|---|---|
| R1 | `restClient` é criado a partir do builder injetado | Mock de `RestClient.Builder`; método usa `builder.baseUrl(url).build()` | `verify(builder).baseUrl("https://jsonplaceholder.typicode.com")` e `.build()` chamados |
| R2 | Bean `RestClient` disponível no contexto | `@SpringBootTest` carrega contexto | Contexto inicia sem erro; bean `RestClient` injetável e não-nulo |

**`PostServiceTest` (ATUALIZADO)** — mantém os 8 cenários existentes (1–8) e adiciona verificação de logging via `ListAppender` do Logback (sem chamadas reais à API)

| # | Cenário de teste | Entrada / Mock | Resultado esperado |
|---|---|---|---|
| 9 | `fetchPostById` — loga INFO ao iniciar | Mock server OK para `/posts/1` | Log INFO contém `Fetching post with ID: 1` |
| 10 | `fetchPostById` — loga INFO ao concluir com sucesso | Mock server OK | Log INFO contém `Successfully fetched post with ID: 1` |
| 11 | `fetchPostById` — loga WARN quando post não encontrado | Mock server 404 | Log WARN contém `Post with ID 999 not found in external API`; lança `PostNotFoundException` |
| 12 | `fetchPostById` — loga ERROR quando upstream falha | Mock server 500 | Log ERROR contém `Failed to fetch post with ID: 1`; lança `ExternalApiException` |
| 13 | `fetchAllPosts` — loga INFO ao iniciar e ao concluir | Mock server OK com 100 itens | Logs INFO `Fetching all posts from external API` e `Successfully fetched 100 posts from external API` |
| 14 | `fetchAllPosts` — loga ERROR quando upstream falha | Mock server 500 | Log ERROR `Failed to fetch posts from external API`; lança `ExternalApiException` |
| 15 | `fetchPostById` — ID nulo lança `IllegalArgumentException` | `id = null` | Lança `IllegalArgumentException` sem chamar a API |
| 16 | `fetchPostById` — logs não contêm dados sensíveis | Qualquer cenário | Nenhuma mensagem de log contém credenciais/campos sensíveis |

**`PostControllerTest` (ATUALIZADO)** — mantém os 7 cenários existentes (9–15 da spec anterior); o cenário "ID não numérico" passa a validar o envelope

| # | Cenário de teste | Endpoint | Resultado esperado |
|---|---|---|---|
| 17 | GET post por ID não numérico — envelope padronizado | `GET /api/posts/abc` | Status 400, body `ErrorResponseDto` com `$.error.code = "INVALID_POST_ID"` |
| 18 | GET todos os posts — sucesso (regressão) | `GET /api/posts` | Status 200, array de `PostDto` |
| 19 | GET post por ID — erro upstream (regressão) | `GET /api/posts/1` | Status 502, `$.error.code = "EXTERNAL_API_ERROR"` |

**`GlobalExceptionHandlerTest` (ATUALIZADO)** — mantém os 3 cenários existentes (16–18) e adiciona:

| # | Cenário de teste | Exceção | Resultado esperado |
|---|---|---|---|
| 20 | Mapeia `MethodArgumentTypeMismatchException` | ex de conversão de `"abc"` para `Long` | Status 400, code `INVALID_POST_ID`, message `Post ID must be a positive integer` |

#### Frontend — Angular (Jasmine + Karma + HttpTestingController)

**`post.service.spec.ts` (ATUALIZADO)** — mantém os 6 cenários existentes e adiciona testes de mensagem amigável

| # | Cenário de teste | Método | Resultado esperado |
|---|---|---|---|
| 21 | `getFriendlyMessage(POST_NOT_FOUND)` | `{code: "POST_NOT_FOUND"}` | Retorna `Post não encontrado` |
| 22 | `getFriendlyMessage(INVALID_POST_ID)` | `{code: "INVALID_POST_ID"}` | Retorna `ID do post deve ser um número inteiro positivo` |
| 23 | `getFriendlyMessage(EXTERNAL_API_ERROR)` | `{code: "EXTERNAL_API_ERROR"}` | Retorna `Não foi possível se comunicar com o serviço externo. Tente novamente.` |
| 24 | `getFriendlyMessage` com código desconhecido | `{code: "FOO", message: "msg"}` | Retorna fallback `Ocorreu um erro inesperado. Tente novamente.` |
| 25 | `getFriendlyMessage` sem `error` presente | `{}` | Retorna mensagem genérica `UNKNOWN_ERROR` |
| 26 | `handleError` preserva envelope do backend (regressão) | HTTP 502 com body `{error:{code,message}}` | Emite `ErrorResponse` idêntico ao recebido |

**`post-table.component.spec.ts` (ATUALIZADO)** — mantém os cenários 24–30, **corrige 26 e 27** e adiciona novos

| # | Cenário de teste | Entrada | Resultado esperado |
|---|---|---|---|
| 27 | Paginador inicia com 10 itens por página (**P-03**) | `posts = [20 posts]` | `component.paginator.pageSize === 10` |
| 28 | Paginação funcional real (**P-04**) | `posts = [25 posts]`, chamar `paginator.nextPage()` + `detectChanges()` | Tabela exibe linhas com IDs 11–20; IDs 1–10 ausentes do DOM |
| 29 | `pageSizeOptions` contém 10, 25, 50 | `posts = [50 posts]` | `component.paginator.pageSizeOptions` inclui `[10, 25, 50]` |
| 30 | Mudança de tamanho de página reflete imediatamente | `posts = [25 posts]`, setar `paginator.pageSize = 25` + `detectChanges()` | Tabela exibe 25 linhas (posts 1–25) |
| 31 | Tabela vazia exibe "Nenhum post encontrado" (regressão 25) | `posts = []` | Mensagem de vazio renderizada |
| 32 | Headers corretos (regressão 28) | `posts = [mockPost]` | Headers: ID, User ID, Título, Body |

**`post-search.component.spec.ts` (ATUALIZADO)** — mantém os cenários 31–38 e adiciona o teste de tema aplicado

| # | Cenário de teste | Interação | Resultado esperado |
|---|---|---|---|
| 33 | Botão primário recebe cor do tema Material (prova do tema carregado — F1) | Renderizar `mat-raised-button color="primary"` com tema `indigo-pink` no Karma | `getComputedStyle(button).backgroundColor === "rgb(63, 81, 181)"` (indigo 500) |
| 34 | Campo de input renderizado com label (regressão 31) | — | `input[type=number]` com label `ID do Post` |

> O teste 33 depende do tema prebuilt estar na lista de `styles` do target `test` do `angular.json`, que será adicionada junto com a do `build`.

**`posts-page.component.spec.ts` (ATUALIZADO)** — adapta os cenários 39–44 à API de signals e adiciona regressões PT-BR

| # | Cenário de teste | Interação | Resultado esperado |
|---|---|---|---|
| 35 | Carrega posts ao inicializar (regressão 39) | `fixture.detectChanges()` | `getPosts()` chamado; `posts()` igual ao mock; `tableLoading()` false |
| 36 | Renderiza `app-post-search` e `app-post-table` (regressões 40/41) | — | Ambos presentes no DOM |
| 37 | Busca individual — sucesso (regressão 42) | `onSearch(1)` | `getPostById(1)` chamado; `searchedPost()` = post; `searchError()` null |
| 38 | Busca — `POST_NOT_FOUND` exibe "Post não encontrado" (regressão BUG-01) | `throwError({error:{code:"POST_NOT_FOUND"}})` | `searchError()` === `Post não encontrado` |
| 39 | Busca — `INVALID_POST_ID` exibe mensagem PT-BR amigável (**F3**) | `throwError({error:{code:"INVALID_POST_ID"}})` | `searchError()` === `ID do post deve ser um número inteiro positivo` |
| 40 | Busca — `EXTERNAL_API_ERROR` exibe mensagem PT-BR amigável | `throwError({error:{code:"EXTERNAL_API_ERROR"}})` | `searchError()` === `Não foi possível se comunicar com o serviço externo. Tente novamente.` |
| 41 | Listagem — `EXTERNAL_API_ERROR` exibe mensagem PT-BR na tabela (regressão BUG-02 + F3) | `getPosts()` falha com `EXTERNAL_API_ERROR` | `tableError()` === mensagem amigável; `tableLoading()` false |
| 42 | Listagem — sucesso limpa erro e seta posts | `getPosts()` retorna mock | `tableError()` null; `posts()` preenchido |

### Testes de integração

- **Backend**: o teste de contexto `BackEndApplicationTests` (`@SpringBootTest`) é mantido e valida a nova fiação de DI do `RestClientConfig` (builder auto-configurado + properties). Os testes de controller (`MockMvc` standalone com `GlobalExceptionHandler`) e de service (`MockRestServiceServer`) já cobrem o contrato HTTP completo sem chamadas externas reais.
- **Frontend**: a verificação E2E do tema (ausência do warning `Could not find Angular Material core theme` no console e aparência correta) é coberta pelo teste 33 (cor aplicada) + validação manual/QA no navegador. Não há teste E2E automatizado no escopo.

## Sequenciamento do desenvolvimento

### Ordem de construção

1. **Backend — `RestClientConfig` (P-01)** — primeiro por ser pré-requisito da resiliência (RF-2.1/RF-2.2): injetar `RestClient.Builder` auto-configurado e chamar `builder.baseUrl(url).build()`.
2. **Backend — `GlobalExceptionHandler` (P-06)** — adicionar `@ExceptionHandler(MethodArgumentTypeMismatchException.class)` retornando `INVALID_POST_ID` 400 no envelope.
3. **Backend — `PostService` logging (P-07)** — adicionar logger SLF4J e registrar INFO/WARN/ERROR conforme a tabela de observabilidade (sem mudança de comportamento).
4. **Backend — Testes** — atualizar `PostControllerTest`/`GlobalExceptionHandlerTest`, adicionar logs em `PostServiceTest` e criar `RestClientConfigTest`; rodar `./mvnw test` (manter 19 existentes + novos verdes).
5. **Frontend — Tema e fontes (F1)** — adicionar `@angular/material/prebuilt-themes/indigo-pink.css` em `styles` (targets `build` e `test`); adicionar links Roboto + Material Icons no `index.html` e classe `mat-app-background` no `body`; ajustar `styles.css`.
6. **Frontend — Modelos separados (P-05)** — criar `error-detail.model.ts` e remover `ErrorDetail` de `error-response.model.ts`.
7. **Frontend — Mensagens amigáveis (F3)** — adicionar `getFriendlyMessage()` ao `PostService` e usá-lo nos componentes de página/busca/tabela.
8. **Frontend — Paginação (P-03/P-04)** — adicionar `[pageSize]="10"` ao `mat-paginator`; reforçar os testes 27/28.
9. **Frontend — Refactor do `PostsPageComponent` (P-02)** — converter estado para `signal()`, extrair handlers privados curtos e delegar ao `PostService`; adaptar template (`posts()`, `searchError()` etc.) para classe ≤30 linhas.
10. **Frontend — Lazy loading (P-08)** — trocar import estático por `loadComponent` na rota `/posts` em `app.routes.ts`.
11. **Frontend — Testes** — atualizar specs (signals, paginação, PT-BR, tema) e rodar `ng test --watch=false`; executar `npm run build` e validar bundle inicial ≤500 kB sem warning.
12. **Regressão completa** — executar as suítes backend + frontend e validar acessibilidade/console manualmente.

### Dependências técnicas

| Dependência | Tipo | Impacto |
|---|---|---|
| `RestClient.Builder` auto-configurado (Spring Boot 4.1) | Infraestrutura do framework | Necessário para timeouts efetivos; não requer dependência nova no `pom.xml` |
| `@angular/material` + `@angular/cdk` (17.3.x) | npm (já instalado) | Sem alteração de versão; só a inclusão do CSS do tema |
| Google Fonts (Roboto + Material Icons) | Recurso externo (CSS) | Necessário para RF-1.3 e renderização dos `mat-icon`; sem acesso, há fallback de fonte do sistema e ícones como texto |
| JsonPlaceholder API | Serviço externo | Disponibilidade da API é requisito para E2E manual; testes unitários não dependem dela |
| Chrome/Chromium | Ambiente de teste | Necessário para Karma (`karma.conf.js` já detecta `CHROME_BIN`) |

## Monitoramento e observabilidade

### Logging (SLF4J — apenas no `PostService`)

| Nível | Quando | Mensagem (exemplo) |
|---|---|---|
| `INFO` | Início da busca individual | `Fetching post with ID: 1` |
| `INFO` | Sucesso da busca individual | `Successfully fetched post with ID: 1` |
| `INFO` | Início da listagem | `Fetching all posts from external API` |
| `INFO` | Sucesso da listagem | `Successfully fetched 100 posts from external API` |
| `WARN` | Post não encontrado na API externa | `Post with ID 999 not found in external API` |
| `ERROR` | Falha de comunicação/upstream | `Failed to fetch post with ID: 1 from external API` / `Failed to fetch posts from external API` |

> Requisitos: (1) as mensagens são em inglês (padrão code-standards); (2) não contêm dados sensíveis (RF-6.3); (3) o controller permanece sem logs — apenas delega (não duplica informação).

Não há métricas Prometheus nem dashboards Grafana neste projeto de estudo (fora de escopo no PRD).

## Considerações técnicas

### Principais decisões

| Decisão | Justificativa | Alternativas descartadas |
|---|---|---|
| **Tema prebuilt `indigo-pink.css` via `angular.json`** | Caminho oficial e mínimo para eliminar o warning `Could not find Angular Material core theme`; o PRD exclui paleta customizada | Tema Sass customizado (fora de escopo), `@import` no `styles.css` (forma menos explícita que a lista `styles` do CLI) |
| **Roboto + Material Icons via Google Fonts no `index.html`** | Padrão recomendado pelo Angular Material; mantém o bundle JS inalterado (CSS externo); garante a renderização dos `mat-icon` | `@import` CSS (bloqueia renderização), bundle de ícones local (sem necessidade) |
| **Timeouts efetivos via `RestClient.Builder` auto-configurado** | Injetar o bean `prototype` do Spring Boot faz `spring.http.client.connect-timeout/read-timeout` serem aplicados ao `ClientHttpRequestFactory` (P-01) | `RestClient.builder()` estático (ignora auto-configuração — bug atual), fábrica manual (`SimpleClientHttpRequestFactory`) (mais código) |
| **`loadComponent` na rota `/posts`** | Move os módulos Material para chunk sob demanda, reduzindo o bundle inicial de 664 kB para ≤500 kB (P-08); suficiente para uma única página | `loadChildren` com arquivo de rotas (over-engineering), `@defer` (não se aplica a rota inteira) |
| **Refactor do `PostsPageComponent` com `signal()`** | Estado reativo enxuto; classe ≤30 linhas conforme skill `angular` (P-02); delega orquestração ao `PostService` | Serviço de estado/facade dedicado (camada nova desnecessária) |
| **Mensagens PT-BR no frontend via `getFriendlyMessage()`** | Mantém o envelope do backend em inglês (padrão do projeto) e centraliza a tradução em um único mapa no service, mantendo componentes enxutos (F3) | Mensagens PT-BR no backend (quebra contrato/padrão e testes existentes) |
| **Handler para `MethodArgumentTypeMismatchException`** | Padroniza o 400 de ID não numérico no envelope `INVALID_POST_ID` (P-06) | Tratar como string no controller (validação manual duplicada) |
| **`[pageSize]="10"` + teste de paginação real** | Alinha o estado inicial do paginator à intenção de 10 itens e valida a navegação de fato (P-03/P-04) | Apenas ajustar o template sem reforçar o teste |

### Riscos conhecidos

| Risco | Probabilidade | Impacto | Mitigação |
|---|---|---|---|
| Lazy loading + SSR/prerender (`loadComponent` com `prerender: true`) não resolver o chunk no pré-render | Baixa | Alto — build/prerender falha | Validar `npm run build` após a mudança de rota; Angular 17 suporta `loadComponent` com SSR; se necessário, avaliar `provideClientHydration` |
| Bundle inicial continuar acima de 500 kB após lazy loading | Baixa | Médio — não atende RF-7.1 | Confirmar que não há import estático residual de Material em código eager; verificar a saída do build e os chunks |
| Tema prebuilt não carregado nos testes Karma (warning presente só no console de teste) | Média | Baixo — falsos negativos no teste 33 | Adicionar o tema também na lista `styles` do target `test` do `angular.json` |
| Google Fonts indisponível/offline | Baixa | Baixo — fonte cai para fallback do sistema; ícones viram texto | Fallback `Roboto, "Helvetica Neue", sans-serif` em `styles.css`; ícones não são críticos para acessibilidade (botões têm texto) |
| Logging em excesso no `PostService` aumenta volume de logs | Baixa | Baixo | Níveis definidos (INFO/WARN/ERROR) e mensagens estáveis por operação |

### Conformidade com skills

| Skill | Aplicabilidade |
|---|---|
| [angular](../../.claude/skills/angular/SKILL.md) | Componentes standalone, `inject()` para DI, `signal()`/`computed()` no estado, limite de 30 linhas na classe do `PostsPageComponent`, `@Input`/`@Output` tipados, sem chamadas de método no template |
| [code-standards](../../.claude/skills/code-standards/SKILL.md) | Código em inglês (inclui mensagens de log e envelope do backend), métodos ≤30 linhas, ≤3 parâmetros, nesting ≤2, sem switch/case (mapa `Record` para PT-BR), um tipo por arquivo (`error-detail.model.ts`) |
| [tests](../../.claude/skills/tests/SKILL.md) | JUnit 5 + Mockito/`MockRestServiceServer` no backend, Jasmine + `HttpTestingController` no frontend, AAA, testes independentes, mocks de serviços externos |
| [executar-review](../../.claude/skills/executar-review/SKILL.md) | Revisão pós-implementação das correções P-01 a P-08 (conformidade com esta spec) |
| [executar-qa](../../.claude/skills/executar-qa/SKILL.md) | Validação final (inclui verificação manual do console e da aparência do tema) |
| [executar-bugfix](../../.claude/skills/executar-bugfix/SKILL.md) | Caso novos defeitos surjam durante a implementação |

> **Nota sobre rules:** este repositório não possui pasta `.claude/rules`; as regras do projeto estão centralizadas nas skills acima e no `CLAUDE.md` (estrutura de pastas e nomenclatura). A implementação deve seguir essas fontes.

### Arquivos relevantes e dependentes

**Backend — Arquivos a modificar:**

| Arquivo | Caminho | Modificação |
|---|---|---|
| `RestClientConfig.java` | `back-end/src/main/java/com/json/place/holder/back_end/config/RestClientConfig.java` | Injetar `RestClient.Builder` auto-configurado (P-01) |
| `PostService.java` | `back-end/src/main/java/com/json/place/holder/back_end/service/PostService.java` | Adicionar logger SLF4J INFO/WARN/ERROR (P-07) |
| `GlobalExceptionHandler.java` | `back-end/src/main/java/com/json/place/holder/back_end/exception/GlobalExceptionHandler.java` | Adicionar handler `MethodArgumentTypeMismatchException` → 400 `INVALID_POST_ID` (P-06) |
| `PostServiceTest.java` | `back-end/src/test/java/com/json/place/holder/back_end/service/PostServiceTest.java` | Cenários 9–16 (logging via `ListAppender`, ID nulo) |
| `PostControllerTest.java` | `back-end/src/test/java/com/json/place/holder/back_end/controller/PostControllerTest.java` | Cenário 17 (envelope para `/api/posts/abc`) |
| `GlobalExceptionHandlerTest.java` | `back-end/src/test/java/com/json/place/holder/back_end/exception/GlobalExceptionHandlerTest.java` | Cenário 20 |

**Backend — Arquivos a criar:**

| Arquivo | Caminho |
|---|---|
| `RestClientConfigTest.java` | `back-end/src/test/java/com/json/place/holder/back_end/config/RestClientConfigTest.java` |

**Frontend — Arquivos a modificar:**

| Arquivo | Caminho | Modificação |
|---|---|---|
| `angular.json` | `front-end/angular.json` | Adicionar `@angular/material/prebuilt-themes/indigo-pink.css` em `styles` (targets `build` e `test`) (F1) |
| `index.html` | `front-end/src/index.html` | Links Roboto + Material Icons (Google Fonts); classe `mat-app-background` no `body` (F1) |
| `styles.css` | `front-end/src/styles.css` | `font-family` Roboto + reset de margem global (F1) |
| `app.routes.ts` | `front-end/src/app/app.routes.ts` | Rota `/posts` com `loadComponent` (P-08) |
| `error-response.model.ts` | `front-end/src/app/models/error-response.model.ts` | Remover `ErrorDetail` (P-05) |
| `post.service.ts` | `front-end/src/app/services/post.service.ts` | Adicionar `getFriendlyMessage()` (F3) |
| `post-table.component.html` | `front-end/src/app/components/post-table/post-table.component.html` | Adicionar `[pageSize]="10"` ao paginator (P-03) |
| `posts-page.component.ts` | `front-end/src/app/pages/posts/posts-page/posts-page.component.ts` | Refactor para signals + ≤30 linhas (P-02) |
| `posts-page.component.html` | `front-end/src/app/pages/posts/posts-page/posts-page.component.html` | Acessar signals (`posts()`, `searchError()`, etc.) |
| `post.service.spec.ts` | `front-end/src/app/services/post.service.spec.ts` | Cenários 21–26 (mensagens amigáveis) |
| `post-table.component.spec.ts` | `front-end/src/app/components/post-table/post-table.component.spec.ts` | Cenários 27–32 (pageSize real e navegação) |
| `post-search.component.spec.ts` | `front-end/src/app/components/post-search/post-search.component.spec.ts` | Cenário 33 (tema aplicado) |
| `posts-page.component.spec.ts` | `front-end/src/app/pages/posts/posts-page/posts-page.component.spec.ts` | Cenários 35–42 (signals + PT-BR) |

**Frontend — Arquivos a criar:**

| Arquivo | Caminho |
|---|---|
| `error-detail.model.ts` | `front-end/src/app/models/error-detail.model.ts` (P-05) |

**Inalterados:** `PostController.java`, `PostDto.java`, `ErrorResponseDto.java`, exceções customizadas, `application.properties` (valores 5s/10s já corretos — apenas passam a ser efetivos), `PostSearchComponent`, `post.model.ts`, `app.config.ts`, `karma.conf.js`.
