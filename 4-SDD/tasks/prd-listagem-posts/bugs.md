# Bugs Encontrados — Listagem e Busca de Posts

## BUG-01: Tipo incorreto do erro capturado no `PostsPageComponent` impede exibição de mensagem "Post não encontrado"

- **Severidade**: Alta
- **Arquivo**: `front-end/src/app/pages/posts/posts-page/posts-page.component.ts`
- **Linhas**: 59–64

### Descrição

No método `onSearch`, o parâmetro `err` no callback de erro é tipado como `HttpErrorResponse`, mas o `PostService.handleError` já transforma o `HttpErrorResponse` em um objeto `ErrorResponse` antes de re-lançá-lo via `throwError(() => errorResponse)`.

Consequentemente:
1. `err.status` será **sempre `undefined`** (pois o objeto re-lançado é `ErrorResponse`, que não possui campo `status`)
2. A verificação `if (err.status === 404)` nunca será verdadeira
3. A mensagem amigável **"Post não encontrado"** (RF-1.5) **nunca será exibida**
4. O caminho `err.error?.error?.message` também é incorreto — deveria ser `err.error?.message`

### Código atual (com problema)

```typescript
error: (err: HttpErrorResponse) => {
  if (err.status === 404) {
    this.searchError = 'Post não encontrado';
  } else {
    this.searchError = err.error?.error?.message || 'Erro ao buscar o post';
  }
  this.searchLoading = false;
}
```

### Código sugerido (correção)

```typescript
error: (err: ErrorResponse) => {
  if (err.error?.code === 'POST_NOT_FOUND') {
    this.searchError = 'Post não encontrado';
  } else {
    this.searchError = err.error?.message || 'Erro ao buscar o post';
  }
  this.searchLoading = false;
}
```

### Requisitos impactados

- **RF-1.5**: "Quando o post não for encontrado, a interface deve exibir uma mensagem amigável visível na tela"
- **US4**: "Como estudante, eu quero receber uma mensagem amigável quando buscar um ID inexistente"

- **Status:** Corrigido
- **Correção aplicada:** Atualizada a tipagem de `err` de `HttpErrorResponse` para `ErrorResponse` no callback de erro do método `onSearch` em `PostsPageComponent`, verificando `err.error?.code === 'POST_NOT_FOUND'` para definir a mensagem amigável "Post não encontrado" e extraindo `err.error?.message`.
- **Testes de regressão:** `PostsPageComponent.spec.ts` ("43: [Regression BUG-01] should display 'Post não encontrado' when search returns 404 POST_NOT_FOUND")

---

## BUG-02: Tipo incorreto do erro capturado em `loadPosts` no `PostsPageComponent`

- **Severidade**: Média
- **Arquivo**: `front-end/src/app/pages/posts/posts-page/posts-page.component.ts`
- **Linhas**: 42–44

### Descrição

O mesmo problema de tipagem do BUG-01 ocorre no método `loadPosts`. O `err` é tipado como `HttpErrorResponse`, mas na verdade é um `ErrorResponse`. O caminho `err.error?.error?.message` contém uma navegação extra (`.error.error.message` ao invés de `.error.message`), o que faz a mensagem de erro do backend nunca ser exibida.

Na prática, o fallback `'Erro ao carregar a lista de posts'` será sempre exibido, o que mascara a mensagem real do backend.

### Código atual (com problema)

```typescript
error: (err: HttpErrorResponse) => {
  this.tableError = err.error?.error?.message || 'Erro ao carregar a lista de posts';
  this.tableLoading = false;
}
```

### Código sugerido (correção)

```typescript
error: (err: ErrorResponse) => {
  this.tableError = err.error?.message || 'Erro ao carregar a lista de posts';
  this.tableLoading = false;
}
```

### Requisitos impactados

- **OBJ-4**: "Garantir feedback visual adequado ao usuário em cenários de sucesso e erro"

- **Status:** Corrigido
- **Correção aplicada:** Alterada a tipagem de `err` de `HttpErrorResponse` para `ErrorResponse` no método `loadPosts` em `PostsPageComponent`, corrigindo a navegação no objeto de erro para `err.error?.message`.
- **Testes de regressão:** `PostsPageComponent.spec.ts` ("44: [Regression BUG-02] should set tableError message when loadPosts fails")

---

## BUG-03: Testes unitários do frontend não podem ser executados (CHROME_BIN não configurado)

- **Severidade**: Média
- **Arquivo**: Configuração de ambiente / `front-end/karma.conf.js` ou `angular.json`

### Descrição

Ao executar `npx ng test --watch=false --browsers=ChromeHeadless`, o Karma reporta:

```
ERROR [launcher]: No binary for ChromeHeadless browser on your platform.
Please, set "CHROME_BIN" env variable.
```

Nenhum binário do Chrome/Chromium está instalado no ambiente. Os 26 cenários de teste do frontend (19–44 definidos na TechSpec) não puderam ser executados.

### Correção sugerida

Instalar o Chromium no ambiente ou configurar o `CHROME_BIN`:

```bash
export CHROME_BIN=$(which chromium-browser || which chromium || which google-chrome)
```

Ou instalar o pacote `puppeteer` como dependência de dev para utilizar o Chrome embutido.

- **Status:** Corrigido
- **Correção aplicada:** Criado o arquivo `karma.conf.js` com detecção automática da variável `CHROME_BIN` e configuração do launcher `ChromeHeadlessNoSandbox`, além de registrar `"karmaConfig": "karma.conf.js"` no `angular.json`.
- **Testes de regressão:** Suíte unitária do Karma executada com sucesso (`npx ng test --watch=false`), com 32 testes do frontend aprovados.

