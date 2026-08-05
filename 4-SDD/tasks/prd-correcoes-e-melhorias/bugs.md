# Relatório de Bugs — Correções e Melhorias da Listagem de Posts

## BUG-01 — Paginação não funciona no navegador real (RF-4.1, RF-4.2, RF-4.3, RF-4.4)

| Campo | Valor |
|---|---|
| **Severidade** | Alta |
| **Módulo** | Frontend — `PostTableComponent` |
| **Arquivo** | `front-end/src/app/components/post-table/post-table.component.ts` |
| **Requisito violado** | RF-4.1 (tabela inicia com 10 itens), RF-4.3 (navegação exibe posts corretos), RF-4.4 (mudança reflete imediatamente) |
| **Status** | Corrigido |

### Descrição

No navegador real, a tabela exibe **todos os 100 posts** em uma única página e o `mat-paginator` mostra **"Items per page: 10 0 of 0"**, com o botão "Próxima página" desabilitado. A navegação entre páginas e a troca de tamanho de página não funcionam.

### Causa raiz

`PostTableComponent.ngOnChanges` só vincula o paginator ao `MatTableDataSource` se `this.paginator` (via `@ViewChild`) já estiver resolvido no momento em que o binding `[posts]` dispara. No ciclo de vida real do Angular, o `@ViewChild` é resolvido **depois** de `ngOnChanges` na renderização inicial, então a ligação `dataSource.paginator = paginator` nunca acontece no fluxo real.

**Comprovação empírica (Playwright):**

```text
paginatorPresent: true
pageSize: 10
length: 0
dataSourceLen: 100
dsPaginatorLinked: false   ← dataSource.paginator !== paginator
postsLen: 100
```

Ao vincular manualmente `dataSource.paginator = paginator` no runtime, a tabela passa a exibir exatamente 10 linhas (posts 1–10), confirmando que o problema é a ligação nunca executada.

### Por que os testes unitários não detectaram

O teste de paginação real (cenário 28 da TechSpec) invoca `ngOnChanges` **manualmente** (`setPosts()` chama `component.ngOnChanges(...)` em um momento em que o `@ViewChild` já foi resolvido), o que não reproduz a ordem do ciclo de vida real. Isso valida a lógica do `MatTableDataSource`, mas não a integração com o ciclo de vida do componente.

### Passos para reproduzir

1. `cd front-end && npm start`
2. `cd back-end && ./mvnw spring-boot:run`
3. Acessar `http://localhost:4200`
4. Observar a tabela: exibe 100 linhas; paginator mostra "0 of 0"; botão next desabilitado.

### Correção sugerida

Vincular o paginator no `ngAfterViewInit` (padrão do Angular Material):

```typescript
ngAfterViewInit(): void {
  this.dataSource.paginator = this.paginator;
}
```

E reforçar o teste de regressão com um teste que renderize o componente com inputs reais (via `fixture.componentRef.setInput('posts', ...)` ou recriando o fixture), sem chamar `ngOnChanges` manualmente, para reproduzir o ciclo de vida real.

### Evidências

- `tasks/prd-correcoes-e-melhorias/evidences/01-estado-inicial-tabela.png` (100 linhas renderizadas)
- `tasks/prd-correcoes-e-melhorias/evidences/02-busca-sucesso-id5.png`

### Status: Corrigido

- **Correção aplicada:** `PostTableComponent` agora implementa `AfterViewInit` e vincula `dataSource.paginator = paginator` em `ngAfterViewInit` (padrão do Angular Material), garantindo que o `@ViewChild` já esteja resolvido quando a ligação é feita, independentemente da ordem em que o input `[posts]` chega. O `ngOnChanges` mantém apenas a atualização de `dataSource.data`.
- **Testes de regressão:**
  - `post-table.component.spec.ts` — "BUG-01: should link paginator when posts are set before view init" (fixture novo sem `detectChanges` inicial + `setInput`, reproduz o ciclo de vida real; falha antes da correção com `dataSource.paginator === undefined`, `length === 0` e 100 linhas renderizadas).
  - `post-table.component.spec.ts` — "BUG-01: should paginate when posts arrive asynchronously after view init".
  - `posts-page.component.spec.ts` — "BUG-01: should paginate the table in the real page flow with 100 posts" (fluxo real `PostsPageComponent` → `PostService` → HTTP mockado; valida 10 linhas no DOM e ausência dos posts da página 2).

---

## BUG-02 — Classe do `PostsPageComponent` excede o limite de 30 linhas (RF-5.1)

| Campo | Valor |
|---|---|
| **Severidade** | Média |
| **Módulo** | Frontend — `PostsPageComponent` |
| **Arquivo** | `front-end/src/app/pages/posts/posts-page/posts-page.component.ts` |
| **Requisito violado** | RF-5.1 ("A lógica da classe do componente de página deve ter no máximo 30 linhas") |
| **Status** | Corrigido |

### Descrição

A classe `PostsPageComponent` possui **45 linhas de código** (excluindo linhas em branco, contando a partir da declaração `export class` até a chave final). O padrão do projeto (skill `angular`) limita a classe de componentes a **30 linhas**.

### Observações

- Todos os **métodos** individuais estão dentro do limite (máx. ~10 linhas cada) — atende `code-standards` (métodos ≤ 30 linhas).
- O não atendimento é apenas ao limite **de classe** da skill `angular` (RF-5.1 do PRD).

### Correção sugerida

Extrair os 6 signals de estado + os 4 handlers privados de aplicação de estado (`applyPosts`, `applyTableError`, `applySearchResult`, `applySearchError`) para um helper/state object gerenciado pelo `PostService` ou em um arquivo de estado separado, mantendo a classe com no máximo 30 linhas.

### Status: Corrigido

- **Correção aplicada:** O estado reativo (6 signals) e os handlers privados (`applyPosts`, `applyTableError`, `applySearchResult`, `applySearchError`) foram movidos para o `PostService`, que agora expõe os signals como readonly (`posts`, `tableLoading`, `tableError`, `searchedPost`, `searchLoading`, `searchError`) e os métodos de orquestração `loadPosts()` e `searchPost(id)`. O `PostsPageComponent` passou a apenas injetar o service, expor os signals e delegar (`ngOnInit` → `loadPosts`, `onSearch` → `searchPost`). Classe agora com **11 linhas** de código (limite 30). Nenhuma mudança de comportamento: template inalterado e cenários 35–42 da TechSpec cobertos.
- **Testes de regressão:**
  - `posts-page.component.spec.ts` — reescrito para fluxo de integração real (componente + `PostService` real + `HttpTestingController`), mantendo os cenários 35–42 e adicionando o cenário de paginação do fluxo real; valida delegação (`loadPosts`/`searchPost`), exposição dos signals e mensagens PT-BR via serviço real.
  - `post.service.spec.ts` — suíte existente mantida verde (cenários 21–26: `getFriendlyMessage` e `handleError`).
  - Verificação estrutural: `PostsPageComponent` com 11 linhas de código na classe (limite 30).

---

## OBSERVAÇÃO — Fluxo de UI para erro de ID não numérico (RF-3.3)

O campo de busca é `<input type="number" min="1">`, então o usuário **não consegue digitar "abc"** pela interface. O `INVALID_POST_ID` só chegaria ao frontend via acesso direto à API. O frontend trata corretamente o envelope quando recebido (verificado por teste unitário do cenário 39 e pelo mapa `getFriendlyMessage`), e o backend responde `400 INVALID_POST_ID` (verificado via `curl`). Não é um bug de implementação, mas o caminho de UI descrito na US3 não é alcançável pelo usuário comum.
