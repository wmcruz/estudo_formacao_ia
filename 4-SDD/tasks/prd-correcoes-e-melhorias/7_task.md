# Tarefa 7.0: Frontend — Refactor do PostsPageComponent para signals

## Visão geral

Refatorar o `PostsPageComponent` (P-02) para que a classe fique com no máximo 30 linhas, usando `signal()` para o estado reativo e handlers privados curtos que delegam a orquestração ao `PostService`. Aproveita o `getFriendlyMessage()` (Tarefa 5.0) para exibir as mensagens PT-BR amigáveis na busca e na tabela, sem alterar comportamento nem aparência.

<skills>
### Conformidade com skills

- [angular](../../.claude/skills/angular/SKILL.md): Standalone components, `inject()` para DI, `signal()`/`computed()` para estado, classe ≤30 linhas, sem chamadas de método no template.
- [code-standards](../../.claude/skills/code-standards/SKILL.md): Métodos com prefixo de verbo, ≤30 linhas, ≤3 parâmetros, código em inglês.
- [tests](../../.claude/skills/tests/SKILL.md): Jasmine + Karma + `HttpTestingController`, AAA, adaptação dos specs existentes à API de signals.
</skills>

<requirements>
- RF-5.1: Lógica da classe do componente de página com no máximo 30 linhas.
- RF-5.3: Reorganização sem alterar comportamento funcional nem aparência da interface.
- RF-3.3: Erros exibidos como mensagens PT-BR amigáveis (busca e tabela), sem detalhes técnicos.
</requirements>

## Subtarefas

- [ ] 7.1 Converter o estado do `PostsPageComponent` para `signal()` e extrair handlers privados curtos, delegando a orquestração ao `PostService`
- [ ] 7.2 Adaptar `posts-page.component.html` para acessar os signals (`posts()`, `searchError()`, `tableError()`, `tableLoading()`, etc.)
- [ ] 7.3 Utilizar `getFriendlyMessage()` para exibir as mensagens PT-BR de busca e listagem
- [ ] 7.4 Atualizar `posts-page.component.spec.ts` com os cenários 35–42 da TechSpec (signals + PT-BR)

## Detalhes de implementação

Consulte `tasks/prd-correcoes-e-melhorias/techspec.md`:
- Seção "Design de implementação" (componentes `PostsPageComponent` e `PostService`)
- Seção "Considerações técnicas > Principais decisões" (refactor com `signal()` e mensagens PT-BR no frontend)
- Seção "Sequenciamento do desenvolvimento" (item 7)
- Seção "Abordagem de testes > Frontend — Angular > posts-page.component.spec.ts" (cenários 35–42)

> Os specs existentes que referenciam estado de classe (ex.: `posts`) devem ser adaptados para a nova API de signals.

## Critérios de sucesso

- Classe do `PostsPageComponent` com no máximo 30 linhas.
- Comportamento funcional e aparência inalterados; buscas exibem mensagens PT-BR amigáveis.
- Suíte do componente adaptada a signals e verde.

## Testes da tarefa

### Testes unitários

- [ ] 35: Carrega posts ao inicializar — `getPosts()` chamado, `posts()` preenchido, `tableLoading()` false (regressão 39)
- [ ] 36: Renderiza `app-post-search` e `app-post-table` (regressões 40/41)
- [ ] 37: Busca individual com sucesso — `getPostById(1)` chamado, `searchedPost()` = post, `searchError()` null (regressão 42)
- [ ] 38: Busca `POST_NOT_FOUND` → `searchError()` === `Post não encontrado` (regressão BUG-01)
- [ ] 39: Busca `INVALID_POST_ID` → `searchError()` === `ID do post deve ser um número inteiro positivo` (F3)
- [ ] 40: Busca `EXTERNAL_API_ERROR` → `searchError()` === `Não foi possível se comunicar com o serviço externo. Tente novamente.`
- [ ] 41: Listagem com `EXTERNAL_API_ERROR` → `tableError()` amigável e `tableLoading()` false (regressão BUG-02 + F3)
- [ ] 42: Listagem com sucesso limpa erro e seta posts

### Testes de integração

- [ ] N/A

### Testes E2E (se aplicável)

- [ ] N/A

## Arquivos relevantes

- `front-end/src/app/pages/posts/posts-page/posts-page.component.ts` (modificar)
- `front-end/src/app/pages/posts/posts-page/posts-page.component.html` (modificar)
- `front-end/src/app/pages/posts/posts-page/posts-page.component.spec.ts` (modificar)
- `front-end/src/app/services/post.service.ts` (consumo de `getFriendlyMessage`, já criado na Tarefa 5.0)
