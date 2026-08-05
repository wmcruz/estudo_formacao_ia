# Tarefa 6.0: Frontend — Paginação consistente e funcional

## Visão geral

Alinhar o estado inicial do paginator à intenção de exibir 10 itens por página (P-03) e reforçar o teste de paginação para validar a navegação real entre páginas (P-04), mantendo as opções de tamanho (10, 25, 50).

<skills>
### Conformidade com skills

- [angular](../../.claude/skills/angular/SKILL.md): Binding de `@Input`/propriedades em componentes standalone, sem lógica de página no template.
- [tests](../../.claude/skills/tests/SKILL.md): Jasmine + Karma, interação real com o paginator (`nextPage()`, `pageSize`), AAA.
</skills>

<requirements>
- RF-4.1: Tabela inicia exibindo 10 itens por página.
- RF-4.2: Opções de itens por página (10, 25, 50) disponíveis ao usuário.
- RF-4.3: Ao navegar para uma página, o usuário vê exatamente os posts daquela página (ex.: página 2 exibe os posts 11–20).
- RF-4.4: Mudança de página ou de tamanho reflete imediatamente na tabela.
</requirements>

## Subtarefas

- [ ] 6.1 Adicionar `[pageSize]="10"` ao `mat-paginator` no `post-table.component.html`
- [ ] 6.2 Atualizar `post-table.component.spec.ts` com os cenários 27–32 da TechSpec (estado inicial, navegação real e mudança de tamanho)

## Detalhes de implementação

Consulte `tasks/prd-correcoes-e-melhorias/techspec.md`:
- Seção "Design de implementação" (componente `PostTableComponent` — `[pageSize]="10"`)
- Seção "Considerações técnicas > Principais decisões" (`[pageSize]="10"` + teste de paginação real)
- Seção "Abordagem de testes > Frontend — Angular > post-table.component.spec.ts" (cenários 27–32)

## Critérios de sucesso

- Paginator inicia com `pageSize === 10`; `pageSizeOptions` inclui `[10, 25, 50]`.
- Navegação para a página 2 exibe os posts 11–20 (IDs 1–10 ausentes do DOM).
- Mudança de tamanho reflete imediatamente na tabela.

## Testes da tarefa

### Testes unitários

- [ ] 27: Paginador inicia com 10 itens por página (P-03)
- [ ] 28: Paginação funcional real — `paginator.nextPage()` + `detectChanges()` exibe IDs 11–20 e oculta 1–10 (P-04)
- [ ] 29: `pageSizeOptions` contém 10, 25, 50
- [ ] 30: Mudança de `pageSize` para 25 exibe 25 linhas imediatamente
- [ ] 31: Tabela vazia exibe "Nenhum post encontrado" (regressão)
- [ ] 32: Headers corretos — ID, User ID, Título, Body (regressão)

### Testes de integração

- [ ] N/A

### Testes E2E (se aplicável)

- [ ] N/A

## Arquivos relevantes

- `front-end/src/app/components/post-table/post-table.component.html` (modificar)
- `front-end/src/app/components/post-table/post-table.component.spec.ts` (modificar)
