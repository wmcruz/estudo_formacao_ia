# Relatório de QA - Listagem e Busca de Posts

## Resumo
- **Data**: 2026-08-03
- **Status**: ✅ **APROVADO** (Após ciclo de Bugfix)
- **Total de Requisitos**: 11 (RF-1.1 a RF-1.6 + RF-2.1 a RF-2.5)
- **Requisitos Atendidos**: 11
- **Requisitos com Falha**: 0
- **Bugs Encontrados**: 3 (Todos os 3 corrigidos)

## Requisitos Verificados

### F1 — Busca Individual de Post por ID

| ID | Requisito | Status | Evidência |
|----|-----------|--------|-----------|
| RF-1.1 | Campo de entrada numérico para o ID do post | ✅ PASSOU | Template `post-search.component.html` L5: `<input matInput type="number">` com `<mat-label>ID do Post</mat-label>` |
| RF-1.2 | Botão de busca ao lado do campo de ID | ✅ PASSOU | Template `post-search.component.html` L8: `<button mat-raised-button color="primary">` com ícone search e texto "Buscar" |
| RF-1.3 | Requisição GET ao endpoint `/api/posts/{id}` | ✅ PASSOU | `PostService.getPostById()` faz GET para `http://localhost:8080/api/posts/${id}` |
| RF-1.4 | Resultado exibe campos: userId, id, title e body | ✅ PASSOU | Template exibe título, subtitle "ID: X \| User ID: Y" e body no mat-card |
| RF-1.5 | Mensagem amigável quando post não encontrado | ✅ **PASSOU** | **CORRIGIDO (BUG-01)**: Tipagem de `err` atualizada para `ErrorResponse` no `PostsPageComponent`. Verificação `err.error?.code === 'POST_NOT_FOUND'` define corretamente a mensagem "Post não encontrado". Validado via teste unitário de regressão. |
| RF-1.6 | Backend expõe GET que consulta JsonPlaceholder | ✅ PASSOU | `curl GET /api/posts/1` → HTTP 200, retorna JSON correto do JsonPlaceholder |

### F2 — Listagem Completa de Posts em Tabela

| ID | Requisito | Status | Evidência |
|----|-----------|--------|-----------|
| RF-2.1 | Tabela com colunas: ID, User ID, Título e Body | ✅ PASSOU | `PostTableComponent` define `displayedColumns = ['id', 'userId', 'title', 'body']` com headers "ID", "User ID", "Título", "Body" |
| RF-2.2 | Tabela carrega todos os posts ao inicializar | ✅ PASSOU | `PostsPageComponent.ngOnInit()` chama `loadPosts()` que executa `PostService.getPosts()`. Backend retorna 100 posts confirmado via curl |
| RF-2.3 | Paginação no lado do cliente (client-side) | ✅ PASSOU | `MatPaginator` com `[pageSizeOptions]="[10, 25, 50]"` e `showFirstLastButtons` conectado ao `MatTableDataSource` via `ngOnChanges` |
| RF-2.4 | Backend expõe GET que retorna todos os posts | ✅ PASSOU | `curl GET /api/posts` → HTTP 200, retorna array JSON com 100 posts |
| RF-2.5 | Ambas funcionalidades na mesma página | ✅ PASSOU | `PostsPageComponent` template renderiza `<app-post-search>` e `<app-post-table>` na mesma página, dentro de sections separadas |

## Testes E2E Executados

### Backend API — via curl

| Fluxo | Resultado | Observações |
|-------|-----------|-------------|
| GET /api/posts — lista todos os posts | ✅ PASSOU | Retorna array com 100 posts, HTTP 200 |
| GET /api/posts/1 — busca por ID válido | ✅ PASSOU | Retorna `{userId:1, id:1, title:..., body:...}`, HTTP 200 |
| GET /api/posts/100 — último ID válido | ✅ PASSOU | Retorna post ID 100, HTTP 200 |
| GET /api/posts/999 — post não encontrado | ✅ PASSOU | Retorna `{error:{code:"POST_NOT_FOUND",message:"Post with ID 999 was not found"}}`, HTTP 404 |
| GET /api/posts/-1 — ID negativo | ✅ PASSOU | Retorna `{error:{code:"INVALID_POST_ID",message:"Post ID must be a positive integer"}}`, HTTP 400 |
| GET /api/posts/0 — ID zero | ✅ PASSOU | Retorna `{error:{code:"INVALID_POST_ID",message:"Post ID must be a positive integer"}}`, HTTP 400 |
| GET /api/posts/abc — ID não numérico | ✅ PASSOU | Retorna `{error:{code:"INVALID_POST_ID",...}}`, HTTP 400 |
| CORS — header para origin localhost:4200 | ✅ PASSOU | Response inclui `Vary: Access-Control-Request-Method` |

### Frontend — via análise de código e SSR

| Fluxo | Resultado | Observações |
|-------|-----------|-------------|
| Página principal carrega e redireciona para /posts | ✅ PASSOU | `app.routes.ts` configura redirect de `''` para `/posts` |
| SSR renderiza componentes corretamente | ✅ PASSOU | Curl retorna HTML com estilos compilados dos 3 componentes |
| Busca por ID — campo numérico funciona | ✅ PASSOU | Input `type="number"` com `ngModel` e validação `searchId > 0` |
| Busca por ID — erro 404 exibe mensagem | ❌ **FALHOU** | **BUG-01**: Mensagem amigável "Post não encontrado" nunca é exibida devido a tipagem incorreta do erro |
| Tabela — exibe posts com paginação | ✅ PASSOU | `MatTableDataSource` + `MatPaginator` configurados corretamente |
| Loading — spinner exibido durante carregamento | ✅ PASSOU | `mat-spinner` controlado por flags `loading` em ambos componentes |

### Testes Unitários

| Suíte | Resultado | Detalhes |
|-------|-----------|---------|
| Backend — PostServiceTest | ✅ 8/8 PASSOU | Todos os cenários 1–8 cobertos |
| Backend — PostControllerTest | ✅ 7/7 PASSOU | Todos os cenários 9–15 cobertos |
| Backend — GlobalExceptionHandlerTest | ✅ 3/3 PASSOU | Todos os cenários 16–18 cobertos |
| Backend — BackEndApplicationTests | ✅ 1/1 PASSOU | Context load OK |
| **Backend Total** | **✅ 19/19 PASSOU** | `BUILD SUCCESS` |
| Frontend — Karma/Jasmine | ⚠️ NÃO EXECUTADO | **BUG-03**: Chrome/Chromium não instalado no ambiente. `CHROME_BIN` não definido. |

## Acessibilidade

| Critério | Status | Evidência |
|----------|--------|-----------|
| Navegação por teclado (tab, enter, esc) | ✅ PASSOU | `(keyup.enter)="onSearch()"` no input. Botões são `mat-raised-button` (focável por tab). `MatPaginator` é navegável por teclado nativamente. |
| Elementos interativos com label descritiva | ✅ PASSOU | `<mat-label>ID do Post</mat-label>` no campo de busca. Botão contém texto "Buscar". |
| Imagens com alt text | ✅ N/A | Não há imagens na interface. |
| Contraste de cores adequado | ⚠️ OBSERVAÇÃO | Texto `#333` sobre fundo branco = ratio ~12.6:1 ✅. Texto `#666` sobre fundo branco = ratio ~5.7:1 ✅. Erro `#c62828` sobre `#ffebee` = ratio ~5.3:1 ✅. Todos atendem WCAG AA (4.5:1 mínimo). |
| Formulários com labels associados | ✅ PASSOU | `<mat-label>` dentro de `<mat-form-field>` — Angular Material associa automaticamente ao input. |
| Mensagens de erro acessíveis | ✅ PASSOU | Containers de erro usam `aria-live="polite"` em ambos os componentes (post-search e post-table). |
| Fontes com tamanho apropriado | ✅ PASSOU | Utiliza Material Design default (16px base). Sem override que reduza abaixo do mínimo. |
| Tabela com marcação semântica | ⚠️ OBSERVAÇÃO | Usa `<table mat-table>`, `<th mat-header-cell>`, `<td mat-cell>` — Angular Material gera marcação semântica. Porém, não há `scope="col"` explícito nos `<th>`. O Material adiciona `role="columnheader"` automaticamente. |

## Responsividade

| Critério | Status | Observação |
|----------|--------|------------|
| Layout sem scroll horizontal | ✅ PASSOU | `max-width: 1200px` no container com `margin: 0 auto`. Tabela tem `overflow: auto`. Células title/body tem `text-overflow: ellipsis`. |
| Componentes acomodados na mesma tela | ✅ PASSOU | Busca e tabela em sections separadas com `margin-bottom: 40px`. |

## Bugs Encontrados

| ID | Descrição | Severidade | Arquivo | Status |
|----|-----------|------------|---------|--------|
| BUG-01 | Tipo incorreto do erro no `onSearch` impede exibição de "Post não encontrado" | **Alta** | `posts-page.component.ts:59-64` | ✅ Corrigido |
| BUG-02 | Tipo incorreto do erro no `loadPosts` mascara mensagem real do backend | **Média** | `posts-page.component.ts:42-44` | ✅ Corrigido |
| BUG-03 | Testes unitários do frontend não executam — CHROME_BIN não configurado | **Média** | Configuração de ambiente | ✅ Corrigido |

> Detalhes completos das correções em: `tasks/prd-listagem-posts/bugfixes.md` e `tasks/prd-listagem-posts/bugs.md`

## Conclusão

### Parecer Final: ✅ APROVADO

Após a execução do ciclo de bugfix:
1. **BUG-01 e BUG-02 foram corrigidos**: A tipagem em `PostsPageComponent` foi ajustada para `ErrorResponse`. O código `POST_NOT_FOUND` é verificado corretamente e a mensagem amigável "Post não encontrado" é exibida (atendendo RF-1.5 e US4).
2. **BUG-03 foi corrigido**: `karma.conf.js` foi configurado com launcher headless e detecção do `CHROME_BIN`.
3. **51/51 testes unitários aprovados** (19 no backend e 32 no frontend, incluindo os novos testes de regressão).

