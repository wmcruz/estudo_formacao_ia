# Especificação técnica

## Resumo executivo

Esta especificação técnica descreve a implementação de dois endpoints REST no backend Spring Boot que atuam como proxy para a API pública do JsonPlaceholder, e de uma interface Angular com Material Design para consumir esses endpoints. No backend, será adicionado o starter web e utilizado o `RestClient` (síncrono) para realizar requisições à API externa. A arquitetura segue o padrão de camadas já definido no projeto: `controller → service → dto`. No frontend, será instalado o Angular Material e criado um módulo de página (`PostsPageComponent`) com dois componentes visuais reutilizáveis: um formulário de busca por ID (`PostSearchComponent`) e uma tabela paginada (`PostTableComponent`). Toda comunicação HTTP será encapsulada em um `PostService` Angular, garantindo que o frontend nunca acesse a API externa diretamente.

A estratégia de tratamento de erros prevê um envelope JSON padronizado no backend e feedback visual amigável no frontend via mensagens inline com suporte a `aria-live`. A paginação é exclusivamente client-side via `MatTableDataSource` + `MatPaginator`, dado que o JsonPlaceholder retorna todos os 100 posts em uma única chamada.

## Arquitetura do sistema

### Visão dos componentes

**Backend (Spring Boot 4.1 — Java 17)**

| Componente | Responsabilidade | Status |
|---|---|---|
| `PostController` | Receber requisições HTTP GET (`/api/posts` e `/api/posts/{id}`), delegar ao service e retornar DTO/envelope de erro | Novo |
| `PostService` | Orquestrar chamadas ao `RestClient` para a API do JsonPlaceholder, tratar erros upstream e mapear respostas | Novo |
| `PostDto` | Contrato de saída (record) com campos `userId`, `id`, `title`, `body` | Novo |
| `ErrorResponseDto` | Envelope de erro padronizado (record) com campos `code` e `message` | Novo |
| `PostNotFoundException` | Exceção customizada para post não encontrado | Novo |
| `ExternalApiException` | Exceção customizada para falha na comunicação com API externa | Novo |
| `GlobalExceptionHandler` | `@ControllerAdvice` para mapear exceções em respostas HTTP padronizadas | Novo |
| `RestClientConfig` | `@Configuration` para criar bean do `RestClient` com base URL do JsonPlaceholder | Novo |

**Frontend (Angular 17.3 — TypeScript)**

| Componente | Responsabilidade | Status |
|---|---|---|
| `PostsPageComponent` | Page/container roteado, orquestra busca individual e listagem | Novo |
| `PostSearchComponent` | Widget visual: campo numérico + botão de busca, exibe resultado ou erro | Novo |
| `PostTableComponent` | Widget visual: `mat-table` com colunas ID/User ID/Título/Body + `mat-paginator` | Novo |
| `PostService` | Service Angular: encapsula `HttpClient` para GET `/api/posts` e `/api/posts/{id}` | Novo |
| `Post` | Interface TypeScript do modelo de post | Novo |
| `ErrorResponse` | Interface TypeScript do envelope de erro | Novo |

**Fluxo de dados principal:**

```
Usuário → PostsPageComponent → PostService (Angular)
  → HttpClient GET /api/posts/{id} ou /api/posts
  → PostController (Spring Boot)
  → PostService (Spring Boot) → RestClient
  → https://jsonplaceholder.typicode.com/posts/{id} ou /posts
  → Resposta JSON ← RestClient ← PostService ← PostController
  → HttpClient response ← PostService (Angular)
  → PostsPageComponent → PostSearchComponent / PostTableComponent → Tela
```

## Design de implementação

### Principais interfaces

**Backend — Java**

```java
// PostService.java
public interface PostServiceContract {
    PostDto fetchPostById(Long id);
    List<PostDto> fetchAllPosts();
}
```

**Frontend — TypeScript**

```typescript
// post.service.ts
export class PostService {
  getPosts(): Observable<Post[]>;
  getPostById(id: number): Observable<Post>;
}
```

### Modelos de dados

Contratos JSON do backend — prontos para exibição na UI. Campos ausentes no upstream são normalizados para `null`.

#### `PostDto` — representação de um post do JsonPlaceholder

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

#### `ErrorResponseDto` — envelope de erro tipado

| Código | HTTP | Significado |
|---|---|---|
| `POST_NOT_FOUND` | `404` | O ID informado não corresponde a nenhum post na API externa |
| `EXTERNAL_API_ERROR` | `502` | Falha na comunicação com o JsonPlaceholder (timeout, indisponibilidade) |
| `INVALID_POST_ID` | `400` | O ID informado é inválido (não é número positivo ou fora do range) |

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
    "code": "EXTERNAL_API_ERROR",
    "message": "Failed to communicate with external API"
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

#### Mapeamento JsonPlaceholder → contrato

| Origem (JsonPlaceholder) | Destino (PostDto) |
|---|---|
| `userId` | `userId` |
| `id` | `id` |
| `title` | `title` |
| `body` | `body` |

> **Nota:** O mapeamento é direto (1:1) sem transformações. O backend repassa os campos exatamente como recebidos da API externa.

#### Parâmetros fixados no upstream (backend)

| API | Parâmetros principais |
|---|---|
| **JsonPlaceholder — posts** | `baseUrl=https://jsonplaceholder.typicode.com`, endpoint `/posts` (GET all) e `/posts/{id}` (GET by id) |

### Endpoints da API

#### Visão geral

| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/api/posts` | Retorna todos os 100 posts do JsonPlaceholder |
| `GET` | `/api/posts/{id}` | Retorna um post específico pelo ID |

---

#### `GET /api/posts`

Retorna todos os posts disponíveis no JsonPlaceholder. O backend faz proxy da chamada `GET https://jsonplaceholder.typicode.com/posts` e retorna o array completo.

**Path params**

Nenhum.

**Respostas**

| Status | Corpo | Quando |
|---|---|---|
| `200` | `PostDto[]` | Consulta bem-sucedida ao JsonPlaceholder |
| `502` | `ErrorResponseDto` | JsonPlaceholder indisponível ou retornou erro inesperado |

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
| `id` | `Long` | — | Obrigatório. Deve ser inteiro positivo (1–100 no JsonPlaceholder) |

**Respostas**

| Status | Corpo | Quando |
|---|---|---|
| `200` | `PostDto` | Post encontrado com sucesso |
| `400` | `ErrorResponseDto` | ID inválido (não numérico, negativo ou zero) |
| `404` | `ErrorResponseDto` | Post não encontrado na API externa |
| `502` | `ErrorResponseDto` | Falha na comunicação com o JsonPlaceholder |

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

**Exemplo — ID inválido**

```http
GET /api/posts/-1
```

```json
{
  "error": {
    "code": "INVALID_POST_ID",
    "message": "Post ID must be a positive integer"
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

> No frontend, o cenário `404` deve exibir a mensagem "Post não encontrado" na área de resultado da busca. Os cenários `400` e `502` devem exibir mensagens de erro genéricas.

---

## Pontos de integração

### API externa — JsonPlaceholder

- **URL base**: `https://jsonplaceholder.typicode.com`
- **Endpoints consumidos**: `GET /posts` e `GET /posts/{id}`
- **Autenticação**: Nenhuma (API pública)
- **Formato**: JSON (`application/json`)
- **Limite de taxa**: Sem limite documentado, mas é um serviço gratuito — respostas podem demorar esporadicamente
- **Tratamento de erros**:
  - **404**: JsonPlaceholder retorna body vazio `{}` para IDs inexistentes — o backend deve detectar e lançar `PostNotFoundException`
  - **Timeout**: Configurar timeout de conexão (5s) e leitura (10s) no `RestClient` — falhas lançam `ExternalApiException`
  - **5xx**: Qualquer status 5xx do JsonPlaceholder é tratado como `ExternalApiException` → retorna 502 ao frontend

### CORS

- Configurado via `@CrossOrigin(origins = "http://localhost:4200")` no `PostController`
- Permite requisições GET do frontend Angular durante desenvolvimento local

## Abordagem de testes

### Testes unitários

#### Backend — Java (JUnit 5 + Mockito)

**`PostServiceTest`** — Testa a lógica do service com `RestClient` mockado

| # | Cenário de teste | Entrada | Resultado esperado |
|---|---|---|---|
| 1 | `fetchPostById` — post existe | `id = 1` | Retorna `PostDto` com `id=1`, `userId=1`, `title` e `body` preenchidos |
| 2 | `fetchPostById` — post não encontrado | `id = 999` | Lança `PostNotFoundException` |
| 3 | `fetchPostById` — API externa indisponível | `id = 1`, RestClient lança exceção | Lança `ExternalApiException` |
| 4 | `fetchPostById` — ID inválido (zero) | `id = 0` | Lança `IllegalArgumentException` |
| 5 | `fetchPostById` — ID inválido (negativo) | `id = -5` | Lança `IllegalArgumentException` |
| 6 | `fetchAllPosts` — sucesso | — | Retorna lista com 100 `PostDto` |
| 7 | `fetchAllPosts` — API retorna lista vazia | — | Retorna lista vazia `[]` |
| 8 | `fetchAllPosts` — API externa indisponível | RestClient lança exceção | Lança `ExternalApiException` |

**`PostControllerTest`** — Testa o controller com `PostService` mockado (usando `@WebMvcTest`)

| # | Cenário de teste | Endpoint | Resultado esperado |
|---|---|---|---|
| 9 | GET todos os posts — sucesso | `GET /api/posts` | Status 200, body = array de PostDto |
| 10 | GET todos os posts — erro upstream | `GET /api/posts` | Status 502, body = ErrorResponseDto com code `EXTERNAL_API_ERROR` |
| 11 | GET post por ID — sucesso | `GET /api/posts/1` | Status 200, body = PostDto com id=1 |
| 12 | GET post por ID — não encontrado | `GET /api/posts/999` | Status 404, body = ErrorResponseDto com code `POST_NOT_FOUND` |
| 13 | GET post por ID — erro upstream | `GET /api/posts/1` | Status 502, body = ErrorResponseDto com code `EXTERNAL_API_ERROR` |
| 14 | GET post por ID — ID inválido (string) | `GET /api/posts/abc` | Status 400 |
| 15 | GET post por ID — ID negativo | `GET /api/posts/-1` | Status 400, body = ErrorResponseDto com code `INVALID_POST_ID` |

**`GlobalExceptionHandlerTest`** — Testa o mapeamento de exceções

| # | Cenário de teste | Exceção | Resultado esperado |
|---|---|---|---|
| 16 | Mapeia `PostNotFoundException` | `PostNotFoundException("Post with ID 999 was not found")` | Status 404, code = `POST_NOT_FOUND` |
| 17 | Mapeia `ExternalApiException` | `ExternalApiException("Failed to communicate...")` | Status 502, code = `EXTERNAL_API_ERROR` |
| 18 | Mapeia `IllegalArgumentException` | `IllegalArgumentException("Post ID must be...")` | Status 400, code = `INVALID_POST_ID` |

#### Frontend — Angular (Jasmine + Karma + HttpTestingController)

**`PostService.spec.ts`** — Testa service com `HttpTestingController`

| # | Cenário de teste | Método | Resultado esperado |
|---|---|---|---|
| 19 | `getPosts()` — sucesso | GET `/api/posts` | Emite array de `Post[]` |
| 20 | `getPosts()` — erro HTTP 502 | GET `/api/posts` | Emite erro com status 502 |
| 21 | `getPostById(1)` — sucesso | GET `/api/posts/1` | Emite objeto `Post` com `id=1` |
| 22 | `getPostById(999)` — not found | GET `/api/posts/999` | Emite erro com status 404 |
| 23 | `getPostById(1)` — erro HTTP 502 | GET `/api/posts/1` | Emite erro com status 502 |

**`PostTableComponent.spec.ts`** — Testa componente de tabela

| # | Cenário de teste | Entrada | Resultado esperado |
|---|---|---|---|
| 24 | Renderiza tabela com posts | `posts = [mockPost]` | Tabela contém células com ID, userId, title, body |
| 25 | Tabela vazia sem posts | `posts = []` | Tabela renderizada sem linhas de dados |
| 26 | Paginador exibido | `posts = [20 mockPosts]` | `mat-paginator` renderizado com `pageSize=10` |
| 27 | Paginação funcional | `posts = [25 mockPosts]`, navegar para página 2 | Tabela exibe posts 11–20 |
| 28 | Colunas corretas | `posts = [mockPost]` | Headers: ID, User ID, Título, Body |
| 29 | Loading spinner visível | `loading = true` | Spinner/progress bar renderizado no DOM |
| 30 | Loading spinner oculto | `loading = false` | Spinner/progress bar NÃO renderizado |

**`PostSearchComponent.spec.ts`** — Testa componente de busca

| # | Cenário de teste | Interação | Resultado esperado |
|---|---|---|---|
| 31 | Campo de input renderizado | — | Existe `input[type=number]` com label |
| 32 | Botão de busca renderizado | — | Existe botão com texto "Buscar" |
| 33 | Emite evento de busca | Digita "5", clica botão | `@Output search` emite valor `5` |
| 34 | Exibe resultado do post | `post = mockPost` | Exibe userId, id, title, body no DOM |
| 35 | Exibe mensagem de erro | `errorMessage = "Post não encontrado"` | Mensagem visível no DOM |
| 36 | Esconde resultado quando erro | `errorMessage = "..."`, `post = null` | Área de resultado NÃO visível |
| 37 | Botão desabilitado sem input | Campo vazio | Botão com `disabled=true` |
| 38 | Exibe loading durante busca | `loading = true` | Spinner/indicador visível |

**`PostsPageComponent.spec.ts`** — Testa page/container

| # | Cenário de teste | Interação | Resultado esperado |
|---|---|---|---|
| 39 | Carrega posts ao inicializar | `ngOnInit` | Chama `PostService.getPosts()` |
| 40 | Renderiza componente de busca | — | `app-post-search` presente no DOM |
| 41 | Renderiza componente de tabela | — | `app-post-table` presente no DOM |
| 42 | Busca individual — sucesso | Emite busca com ID=1 | Passa post encontrado ao componente de busca |
| 43 | Busca individual — não encontrado | Emite busca com ID=999 | Passa mensagem de erro ao componente de busca |
| 44 | Tabela — erro no carregamento | `getPosts()` falha | Exibe mensagem de erro genérica |

### Testes de integração

Não há necessidade de testes de integração neste escopo, pois:
- O backend não possui banco de dados — apenas faz proxy HTTP
- Os testes unitários do controller (`@WebMvcTest`) já validam o contrato HTTP completo
- Os testes do service com mocks do `RestClient` validam o tratamento de erros da API externa

## Sequenciamento do desenvolvimento

### Ordem de construção

1. **Backend — Dependências e configuração** (pré-requisito de tudo)
   - Adicionar `spring-boot-starter-web` ao `pom.xml`
   - Criar `RestClientConfig` com bean `RestClient` apontando para `https://jsonplaceholder.typicode.com`
   - Configurar timeouts no `application.properties`

2. **Backend — DTOs e exceções** (sem dependência de runtime)
   - Criar `PostDto` (record)
   - Criar `ErrorResponseDto` (record com campo aninhado `ErrorDetail`)
   - Criar `PostNotFoundException` e `ExternalApiException`

3. **Backend — Service** (depende de DTOs + RestClient)
   - Implementar `PostService` com `fetchPostById(Long id)` e `fetchAllPosts()`
   - Tratar respostas do JsonPlaceholder (sucesso, 404, erro de rede)

4. **Backend — Controller e exception handler** (depende de Service + DTOs)
   - Implementar `PostController` com `@CrossOrigin` e dois endpoints GET
   - Implementar `GlobalExceptionHandler` (`@ControllerAdvice`)

5. **Backend — Testes** (depende de toda a camada backend)
   - `PostServiceTest`, `PostControllerTest`, `GlobalExceptionHandlerTest`

6. **Frontend — Instalar Angular Material** (pré-requisito dos componentes)
   - `ng add @angular/material` — selecionar tema e configurar
   - Configurar `provideHttpClient()` e `provideAnimationsAsync()` no `app.config.ts`

7. **Frontend — Model e Service** (depende da instalação do Material + HttpClient)
   - Criar interface `Post` em `models/post.model.ts`
   - Criar interface `ErrorResponse` em `models/error-response.model.ts`
   - Criar `PostService` em `services/post.service.ts`

8. **Frontend — Componentes visuais** (depende de Model + Service)
   - Criar `PostTableComponent` com `mat-table` + `mat-paginator`
   - Criar `PostSearchComponent` com `mat-form-field` + `mat-button`

9. **Frontend — Page e rotas** (depende dos componentes visuais)
   - Criar `PostsPageComponent` em `pages/posts/`
   - Configurar rota `/posts` e redirect de `/` para `/posts` em `app.routes.ts`

10. **Frontend — Testes** (depende de toda a camada frontend)
    - `PostService.spec.ts`, `PostTableComponent.spec.ts`, `PostSearchComponent.spec.ts`, `PostsPageComponent.spec.ts`

### Dependências técnicas

| Dependência | Tipo | Impacto |
|---|---|---|
| `spring-boot-starter-web` | Maven dependency | Necessário para expor endpoints REST e usar `RestClient` |
| `@angular/material` | npm package | Necessário para `mat-table`, `mat-paginator`, `mat-form-field`, `mat-button`, `mat-progress-spinner` |
| `@angular/cdk` | npm package (transitiva) | Instalado automaticamente com Angular Material |
| JsonPlaceholder API | Serviço externo | API pública sem SLA — pode estar indisponível temporariamente |

## Monitoramento e observabilidade

### Logging (SLF4J — já incluso no Spring Boot Starter)

| Nível | Quando | Exemplo |
|---|---|---|
| `INFO` | Requisição recebida com sucesso | `Fetching post with ID: 1` |
| `INFO` | Resposta retornada com sucesso | `Successfully fetched 100 posts from external API` |
| `WARN` | Post não encontrado na API externa | `Post with ID 999 not found in external API` |
| `ERROR` | Falha na comunicação com API externa | `Failed to fetch posts from JsonPlaceholder: Connection timed out` |

Não há necessidade de métricas Prometheus ou dashboards Grafana neste projeto de estudo.

## Considerações técnicas

### Principais decisões

| Decisão | Justificativa | Alternativas descartadas |
|---|---|---|
| **`RestClient` (síncrono)** para chamadas ao JsonPlaceholder | API moderna do Spring Boot 4.x, mais simples que `WebClient` para operações síncronas. Sem necessidade de programação reativa neste contexto | `WebClient` (reativo — complexidade desnecessária), `RestTemplate` (deprecated) |
| **Paginação client-side** com `MatTableDataSource` | JsonPlaceholder retorna todos os 100 posts em uma chamada. Com apenas 100 registros, não há ganho em paginar no servidor | Paginação server-side (desnecessária, API externa não suporta paginação) |
| **`@CrossOrigin` no controller** | Solução direta e explícita para CORS em desenvolvimento local. Adequada para projeto de estudo com um único controller | `WebMvcConfigurer` global (over-engineering), `proxy.conf.json` (oculta a necessidade real de CORS) |
| **`@ControllerAdvice`** para tratamento de erros | Centraliza o mapeamento exceção → HTTP response, evitando lógica de erro duplicada no controller | Try-catch inline no controller (viola SRP, código duplicado) |
| **Componentes standalone** Angular | Padrão do Angular 17+, elimina necessidade de NgModules. Alinhado com as skills do projeto | NgModules (legado) |
| **`record` Java** para DTOs | Imutável, conciso, ideal para objetos de transporte de dados. Gera `equals`, `hashCode`, `toString` automaticamente | Classes POJO (verbose, mutáveis) |

### Riscos conhecidos

| Risco | Probabilidade | Impacto | Mitigação |
|---|---|---|---|
| JsonPlaceholder fora do ar | Baixa | Médio — tabela e busca não funcionam | Timeout configurado (5s/10s), mensagem amigável ao usuário |
| Latência alta do JsonPlaceholder | Baixa | Baixo — UX degradada | Loading spinner no frontend, timeout no backend |
| Angular Material incompatível com Angular 17.3 | Muito baixa | Alto — bloqueio do frontend | Usar versão 17.x do `@angular/material` compatível com o Angular 17.3 do projeto |
| CORS bloqueado em produção | N/A | N/A — projeto é local | `@CrossOrigin` resolve para `localhost` |

### Conformidade com skills

| Skill | Aplicabilidade |
|---|---|
| [angular](../../.claude/skills/angular/SKILL.md) | Componentes standalone, `inject()` para DI, `computed()` ou pipes puros no template, limite de 30 linhas por classe de componente |
| [code-standards](../../.claude/skills/code-standards/SKILL.md) | Código em inglês, métodos ≤30 linhas, ≤3 parâmetros, nesting ≤2, sem switch/case, nomes verbais para métodos, variáveis descritivas |
| [tests](../../.claude/skills/tests/SKILL.md) | JUnit 5 + Mockito para backend service, `@WebMvcTest` para controller, Jasmine + `HttpTestingController` para Angular service, AAA pattern, testes independentes |

### Arquivos relevantes e dependentes

**Backend — Arquivos a criar:**

| Arquivo | Caminho |
|---|---|
| `PostController.java` | `back-end/src/main/java/com/json/place/holder/back_end/controller/PostController.java` |
| `PostService.java` | `back-end/src/main/java/com/json/place/holder/back_end/service/PostService.java` |
| `PostDto.java` | `back-end/src/main/java/com/json/place/holder/back_end/dto/PostDto.java` |
| `ErrorResponseDto.java` | `back-end/src/main/java/com/json/place/holder/back_end/dto/ErrorResponseDto.java` |
| `PostNotFoundException.java` | `back-end/src/main/java/com/json/place/holder/back_end/exception/PostNotFoundException.java` |
| `ExternalApiException.java` | `back-end/src/main/java/com/json/place/holder/back_end/exception/ExternalApiException.java` |
| `GlobalExceptionHandler.java` | `back-end/src/main/java/com/json/place/holder/back_end/exception/GlobalExceptionHandler.java` |
| `RestClientConfig.java` | `back-end/src/main/java/com/json/place/holder/back_end/config/RestClientConfig.java` |
| `PostServiceTest.java` | `back-end/src/test/java/com/json/place/holder/back_end/service/PostServiceTest.java` |
| `PostControllerTest.java` | `back-end/src/test/java/com/json/place/holder/back_end/controller/PostControllerTest.java` |
| `GlobalExceptionHandlerTest.java` | `back-end/src/test/java/com/json/place/holder/back_end/exception/GlobalExceptionHandlerTest.java` |

**Backend — Arquivos a modificar:**

| Arquivo | Caminho | Modificação |
|---|---|---|
| `pom.xml` | `back-end/pom.xml` | Adicionar `spring-boot-starter-web` |
| `application.properties` | `back-end/src/main/resources/application.properties` | Adicionar configurações de timeout e URL base do JsonPlaceholder |

**Frontend — Arquivos a criar:**

| Arquivo | Caminho |
|---|---|
| `post.model.ts` | `front-end/src/app/models/post.model.ts` |
| `error-response.model.ts` | `front-end/src/app/models/error-response.model.ts` |
| `post.service.ts` | `front-end/src/app/services/post.service.ts` |
| `post.service.spec.ts` | `front-end/src/app/services/post.service.spec.ts` |
| `post-table.component.ts` | `front-end/src/app/components/post-table/post-table.component.ts` |
| `post-table.component.html` | `front-end/src/app/components/post-table/post-table.component.html` |
| `post-table.component.css` | `front-end/src/app/components/post-table/post-table.component.css` |
| `post-table.component.spec.ts` | `front-end/src/app/components/post-table/post-table.component.spec.ts` |
| `post-search.component.ts` | `front-end/src/app/components/post-search/post-search.component.ts` |
| `post-search.component.html` | `front-end/src/app/components/post-search/post-search.component.html` |
| `post-search.component.css` | `front-end/src/app/components/post-search/post-search.component.css` |
| `post-search.component.spec.ts` | `front-end/src/app/components/post-search/post-search.component.spec.ts` |
| `posts-page.component.ts` | `front-end/src/app/pages/posts/posts-page.component.ts` |
| `posts-page.component.html` | `front-end/src/app/pages/posts/posts-page.component.html` |
| `posts-page.component.css` | `front-end/src/app/pages/posts/posts-page.component.css` |
| `posts-page.component.spec.ts` | `front-end/src/app/pages/posts/posts-page.component.spec.ts` |

**Frontend — Arquivos a modificar:**

| Arquivo | Caminho | Modificação |
|---|---|---|
| `app.config.ts` | `front-end/src/app/app.config.ts` | Adicionar `provideHttpClient()` e `provideAnimationsAsync()` |
| `app.routes.ts` | `front-end/src/app/app.routes.ts` | Adicionar rota `/posts` e redirect de `/` |
| `app.component.html` | `front-end/src/app/app.component.html` | Limpar template padrão, manter `<router-outlet>` |
