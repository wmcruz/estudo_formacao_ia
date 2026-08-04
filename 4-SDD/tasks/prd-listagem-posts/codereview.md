# Relatório de Code Review - Listagem e Busca de Posts

## Resumo
- Data: 2026-08-03
- Branch: main (trabalho não commitado além de `43e47f2 feat: implement initial tasks for post listing and search functionality`)
- Status: APROVADO COM RESSALVAS

## Conformidade com Rules

| Rule | Status | Observações |
|------|--------|-------------|
| Nomenclatura de arquivos (Java `UpperCamelCase`+sufixo, Angular `kebab-case`+sufixo) | OK | `PostController.java`, `PostService.java`, `post-table.component.ts`, `post.service.ts`, `posts-page.component.ts` |
| Estrutura de pastas backend `controller → service → dto` | OK | Camadas inferiores não importam superiores; `GlobalExceptionHandler` e exceções em `exception/`; `RestClientConfig` em `config/` |
| Estrutura de pastas frontend `routes → pages → components` + services/models | OK | `pages/posts/`, `components/post-*/`, `services/post.service.ts`, `models/*.model.ts` |
| Padrões de código / skills | **NOK** | `PostsPageComponent` (posts-page.component.ts:16-69) tem classe com ~53 linhas, violando o limite de 30 linhas da skill `angular`. Ver Problema P-02 |
| Dependências não autorizadas | OK | `spring-boot-starter-web` e `@angular/material`/`@angular/cdk` são exatamente as previstas na TechSpec |
| Tratamento de erro | OK | Envelope `ErrorResponseDto` padronizado, `@ControllerAdvice`, mensagens inline `aria-live` no frontend; correções BUG-01/BUG-02 aplicadas |
| Logging (SLF4J) | **NOK** | A seção "Monitoramento e observabilidade" da TechSpec prevê logs INFO/WARN/ERROR, mas o `PostService` não possui nenhum logger. Ver Problema P-07 |
| Idioma do código | OK | Identificadores/comentários em inglês; mensagens de UI em português conforme TechSpec/PRD explicitam ("Post não encontrado", headers "Título") |

## Aderência à TechSpec

| Decisão Técnica | Implementado | Observações |
|-----------------|--------------|-------------|
| `RestClient` (síncrono) como proxy para JsonPlaceholder | SIM | Uso de `RestClient` correto |
| Timeouts de conexão (5s) e leitura (10s) | **PARCIAL** | Propriedades presentes em `application.properties`, mas **não efetivas**: `RestClientConfig` usa `RestClient.builder()` estático em vez de injetar o `RestClient.Builder` auto-configurado pelo Spring Boot (que é o que consome `spring.http.client.*`). Ver Problema P-01 |
| `PostDto` (record) e `ErrorResponseDto` (record aninhado) | SIM | Contrato JSON `{error:{code,message}}` conforme exemplo |
| Exceções customizadas `PostNotFoundException` / `ExternalApiException` | SIM | Mapeadas para 404 e 502 no `GlobalExceptionHandler` |
| `@ControllerAdvice` para erros | SIM | 3 handlers; para ID não numérico o envelope não é usado (body default do Spring). Ver Problema P-06 |
| Endpoints `GET /api/posts` e `GET /api/posts/{id}` | SIM | Com `@CrossOrigin(origins = "http://localhost:4200")` |
| Paginação client-side (`MatTableDataSource` + `MatPaginator`) | SIM | `pageSizeOptions="[10, 25, 50]"`; default real do paginator é 50, cenário 26 espera 10. Ver Problema P-03 |
| Componentes standalone Angular | SIM | Todos com `standalone: true` |
| DI com `inject()` e `@Input`/`@Output` tipados | SIM | `PostService` e `PostsPageComponent` usam `inject()`; inputs/outputs estritamente tipados |
| Rota `/posts` e redirect de `/` | SIM | `app.routes.ts` configurado |
| `provideHttpClient()` + `provideAnimationsAsync()` | SIM | Em `app.config.ts` |
| Frontend não acessa API externa diretamente | SIM | Todo HTTP via `PostService` → backend |
| Testes conforme matriz de cenários (1–44) | SIM | 26 cenários da matriz + 6 testes de instância (boilerplate) implementados |

## Tasks Verificadas

| Task | Status | Observações |
|------|--------|-------------|
| 1.0 Implementação Completa do Backend (API Proxy) | COMPLETA | Subtarefas 1.1–1.7 entregues (código + testes). `PostServiceTest` 8/8, `PostControllerTest` 7/7, `GlobalExceptionHandlerTest` 3/3, context load 1/1 |
| 2.0 Fundação e Serviços do Frontend | COMPLETA | Subtarefas 2.1–2.4 entregues. Material instalado, models criados, `PostService` encapsula HTTP, 6 testes do service |
| 3.0 Componentes Visuais, Integração e Roteamento | COMPLETA | Subtarefas 3.1–3.5 entregues. `PostSearchComponent` (9 testes), `PostTableComponent` (8), `PostsPageComponent` (7) |

> Observação: os checkboxes das subtarefas em `1_task.md`, `2_task.md` e `3_task.md` permanecem `[ ]` (nunca marcados), embora todo o código esteja implementado e testado. O resumo `tasks.md` marca as 3 tarefas como `[x]`. Recomenda-se atualizar os checkboxes das subtarefas por higiene de documentação.

## Testes

- Total de Testes: 51 (19 backend + 32 frontend)
- Passando: 51
- Falhando: 0
- Coverage: não configurada (sem thresholds); todos os cenários da matriz TechSpec cobertos
- Build de produção `npm run build`: **OK** (com warning de budget — ver Problema P-08)

### Execução
- `./mvnw test` (back-end): `Tests run: 19, Failures: 0, Errors: 0, Skipped: 0` — BUILD SUCCESS
- `npx ng test --watch=false` (front-end): `TOTAL: 32 SUCCESS` — Chrome Headless 151 (launcher `ChromeHeadlessNoSandbox` detectado via `karma.conf.js`, resolve BUG-03)
- `npm run build` (front-end): compilação + SSR + prerender de 1 rota sem erros de TypeScript

## Problemas Encontrados

| Severidade | Arquivo | Linha | Descrição | Sugestão |
|------------|---------|-------|-----------|----------|
| Média | `back-end/.../config/RestClientConfig.java` | 15-19 | Timeouts configurados (`spring.http.client.connect-timeout=5s`/`read-timeout=10s`) **não são aplicados**: o bean usa o factory estático `RestClient.builder()`, que ignora a auto-configuração do Spring Boot. Se o JsonPlaceholder travar, a requisição pode pendurar sem timeout, contrariando a mitigação de risco da TechSpec | Injetar o `RestClient.Builder` auto-configurado: `public RestClient restClient(RestClient.Builder builder) { return builder.baseUrl(jsonplaceholderUrl).build(); }` |
| Média | `front-end/src/app/pages/posts/posts-page/posts-page.component.ts` | 16-69 | Classe do componente com ~53 linhas — excede o limite de 30 linhas da skill `angular` ("Component Class logic must have at most 30 lines") | Usar `signal`/`computed()` para os estados e delegar orquestração extra ao service; extrair handlers dos callbacks para métodos privados curtos |
| Baixa | `front-end/.../post-table/post-table.component.html` | 53 | `mat-paginator` sem `[pageSize]="10"`. O default do `MatPaginator` é 50, mas o cenário 26 da TechSpec espera `pageSize=10` (o teste 26 só verifica presença do elemento, não o valor) | Adicionar `[pageSize]="10"` ao `mat-paginator` |
| Baixa | `front-end/.../post-table/post-table.component.spec.ts` | 75-84 | Cenário 27 ("Paginação funcional") não valida a paginação de fato: apenas confere que `dataSource.paginator` existe e que há 25 itens. Não navega para a página 2 nem verifica posts 11–20 | Exercitar a paginação real (e.g. `paginator.nextPage()` + `fixture.detectChanges()` e assert das linhas visíveis) |
| Baixa | `front-end/src/app/models/error-response.model.ts` | 1-8 | Duas interfaces (`ErrorDetail` e `ErrorResponse`) no mesmo arquivo — a rule "one interface per file" (code-standards item 8) | Separar `ErrorDetail` em arquivo próprio ou declará-la aninhada na `ErrorResponse` |
| Baixa | `back-end/.../exception/GlobalExceptionHandler.java` | 9-28 | `GET /api/posts/abc` (ID não numérico) retorna 400 com body default do Spring, não o envelope `ErrorResponseDto`/`INVALID_POST_ID` previsto na tabela de contrato do endpoint | Adicionar `@ExceptionHandler(MethodArgumentTypeMismatchException.class)` retornando o envelope 400 |
| Baixa | `back-end/.../service/PostService.java` | 22-59 | Ausência de logging SLF4J previsto na seção "Monitoramento e observabilidade" da TechSpec (ex.: `Fetching post with ID: 1`, `Successfully fetched 100 posts`) | Adicionar logger e registrar INFO/WARN/ERROR conforme a tabela da TechSpec |
| Baixa | `front-end` (build de produção) | — | Bundle inicial de 664 kB excede o budget de warning de 500 kB do `angular.json` (abaixo do erro de 1 MB) | Avaliar lazy-loading da rota `/posts` ou tree-shaking de módulos Material |

## Pontos Positivos

- **Suíte completa de testes**: 51/51 passando (19 backend + 32 frontend), incluindo os testes de regressão dos BUG-01/BUG-02 e a execução viabilizada pelo `karma.conf.js` (BUG-03).
- Arquitetura em camadas respeitada: frontend nunca acessa o JsonPlaceholder diretamente; tudo passa pelo backend proxy.
- Envelope de erro padronizado (`{error:{code,message}}`) consistente entre backend, service TS e tratamento no componente.
- Componentes standalone com `@Input`/`@Output` estritamente tipados, DI com `inject()`, sem chamadas de método no template (sem violações de `computed()`/pipes).
- Tratamento de erros upstream correto: 404 → `POST_NOT_FOUND`, 5xx → `EXTERNAL_API_ERROR`, ID ≤ 0 → `INVALID_POST_ID`.
- Acessibilidade: `aria-live="polite"` nas mensagens de erro, `mat-label` associado ao input, paginator com `aria-label`, navegação por teclado (`(keyup.enter)`).
- Correções dos bugs documentadas em `bugs.md` com testes de regressão correspondentes.
- Testes de service do backend usam `MockRestServiceServer` (sem chamadas reais à API externa), conforme a rule de stubbing.

## Recomendações

- **Prioridade 1**: corrigir `RestClientConfig` para injetar o `RestClient.Builder` auto-configurado (timeouts efetivos) — P-01.
- **Prioridade 2**: refatorar `PostsPageComponent` para ≤30 linhas usando signals/extração de métodos — P-02.
- Adicionar `[pageSize]="10"` ao paginator e reforçar o cenário 27 de paginação — P-03/P-04.
- Separar as interfaces em `error-response.model.ts` — P-05.
- Adicionar handler para `MethodArgumentTypeMismatchException` (ID não numérico) — P-06.
- Considerar adicionar os logs da seção de observabilidade da TechSpec — P-07.
- Avaliar lazy-loading da rota `/posts` para reduzir o bundle — P-08.
- Marcar os checkboxes das subtarefas em `1_task.md`, `2_task.md` e `3_task.md`.

## Conclusão

**APROVADO COM RESSALVAS.**

Todos os critérios principais foram atendidos: 51/51 testes passando (19 backend + 32 frontend), aderência geral à TechSpec e ao PRD confirmada, tarefas 1.0–3.0 completas, arquitetura em camadas e padrões de projeto respeitados, sem problemas de segurança e sem dependências não autorizadas. As correções de bugfix foram validadas por testes de regressão.

As ressalvas são melhorias não bloqueantes: (1) os timeouts do `RestClient` configurados no `application.properties` não são efetivos devido ao uso do factory estático em `RestClientConfig`; (2) a classe `PostsPageComponent` excede o limite de 30 linhas definido na skill `angular`; e (3) pequenas divergências de baixa severidade (pageSize do paginator, teste de paginação superficial, duas interfaces no mesmo arquivo, envelope para ID não numérico, ausência de logging e warning de budget no build). Nenhuma delas compromete a funcionalidade validada em QA.
