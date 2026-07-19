# Tarefa 3.0: Componentes Visuais, Integração e Roteamento

## Visão geral

Desenvolver os componentes visuais para busca por ID e tabela paginada, integrá-los numa página roteada e implementar os testes unitários focados na UI do frontend (Angular).

<skills>
### Conformidade com skills

- [angular](../../.claude/skills/angular/SKILL.md): Standalone components, `computed()` ou lógica equivalente.
- [tests](../../.claude/skills/tests/SKILL.md): Jasmine + TestBed.
- [code-standards](../../.claude/skills/code-standards/SKILL.md): Acessibilidade e organização.
</skills>

<requirements>
- RF-1.1, RF-1.2, RF-1.4, RF-1.5: Campo de busca, exibição de resultado ou erro.
- RF-2.1, RF-2.2, RF-2.3: Tabela com colunas ID, User ID, Título, Body e paginação client-side.
- RF-2.5: Componentes coexistem na mesma tela.
- Acessibilidade: WCAG AA, labels e `aria-live`.
</requirements>

## Subtarefas

- [ ] 3.1 Desenvolver o `PostSearchComponent` (formulário e view de resultado)
- [ ] 3.2 Desenvolver o `PostTableComponent` (tabela e paginador)
- [ ] 3.3 Desenvolver o `PostsPageComponent` unificando busca e tabela
- [ ] 3.4 Configurar o `app.routes.ts` e `app.component.html` para habilitar roteamento
- [ ] 3.5 Implementar testes unitários para os componentes visuais (`PostSearchComponent`, `PostTableComponent`, `PostsPageComponent`)

## Detalhes de implementação

Consulte `tasks/prd-listagem-posts/techspec.md`:
- Seções referentes aos componentes frontend e rotas.
- Seção "Sequenciamento do desenvolvimento" (Itens 8, 9 e 10 parcialmente).
- Seção "Abordagem de testes > Frontend — Angular".

## Critérios de sucesso

- UI funciona corretamente, exibindo loadings e mensagens de erro (ou os posts encontrados).
- Paginação side-client funcional.
- Navegação por teclado e semântica de acessibilidade respeitadas.
- Cobertura de todos os cenários de teste da UI no Karma.

## Testes da tarefa

### Testes unitários

- [ ] Cenários 24 a 30 em `PostTableComponent.spec.ts`
- [ ] Cenários 31 a 38 em `PostSearchComponent.spec.ts`
- [ ] Cenários 39 a 44 em `PostsPageComponent.spec.ts`

### Testes de integração

- [ ] N/A

## Arquivos relevantes

- `front-end/src/app/components/post-table/post-table.component.*`
- `front-end/src/app/components/post-search/post-search.component.*`
- `front-end/src/app/pages/posts/posts-page.component.*`
- `front-end/src/app/app.routes.ts`
- `front-end/src/app/app.component.html`
