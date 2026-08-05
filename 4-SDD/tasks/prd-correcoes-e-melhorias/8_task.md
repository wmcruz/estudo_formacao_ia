# Tarefa 8.0: Frontend — Lazy loading da rota /posts

## Visão geral

Reduzir o bundle inicial da aplicação (P-08) carregando a página de posts sob demanda: a rota `/posts` passará a usar `loadComponent`, movendo os módulos do Material e da página para um chunk separado que só é baixado ao navegar para a listagem.

<skills>
### Conformidade com skills

- [angular](../../.claude/skills/angular/SKILL.md): Roteamento standalone com `loadComponent`, rotas lazy, sem import estático de `PostsPageComponent`.
- [tests](../../.claude/skills/tests/SKILL.md): Validação via build de produção (budget), sem teste unitário específico.
</skills>

<requirements>
- RF-7.1: Bundle inicial do build de produção ≤ 500 kB, sem warning de budget.
- RF-7.2: Recursos exclusivos da página de listagem carregados somente ao acessar a rota correspondente.
- RF-7.3: Rota `/posts` permanece acessível e funcional após a navegação sob demanda.
</requirements>

## Subtarefas

- [ ] 8.1 Trocar o import estático de `PostsPageComponent` por `loadComponent` na rota `/posts` em `app.routes.ts`
- [ ] 8.2 Executar `npm run build` e validar o bundle inicial ≤ 500 kB (sem warning de budget) e a presença de chunk separado para `/posts`
- [ ] 8.3 Confirmar que não há import estático residual do Material em código eager

## Detalhes de implementação

Consulte `tasks/prd-correcoes-e-melhorias/techspec.md`:
- Seção "Design de implementação > Mudança no fluxo de carregamento do frontend" (antes/depois)
- Seção "Considerações técnicas > Principais decisões" (decisão `loadComponent` e riscos de budget)
- Seção "Sequenciamento do desenvolvimento" (item 10)

## Critérios de sucesso

- Build de produção com bundle inicial ≤ 500 kB e sem warning de budget.
- `/posts` carrega como chunk separado, acessível e funcional após a navegação.

## Testes da tarefa

### Testes unitários

- [ ] N/A

### Testes de integração

- [ ] `npm run build` sem warning de budget (bundle inicial ≤ 500 kB)
- [ ] Rota `/posts` acessível e funcional após a navegação sob demanda

### Testes E2E (se aplicável)

- [ ] Validação manual de navegação para a listagem (reforçada na Tarefa 9.0)

## Arquivos relevantes

- `front-end/src/app/app.routes.ts` (modificar)
- Saída do `npm run build` (validar chunks/budget)
