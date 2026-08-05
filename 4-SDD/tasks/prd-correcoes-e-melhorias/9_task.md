# Tarefa 9.0: Regressão completa e validação final

## Visão geral

Executar as suítes completas de backend e frontend após todas as correções, validar o build de produção e conferir manualmente o console do navegador e os critérios de acessibilidade (WCAG AA), garantindo que nenhuma funcionalidade existente tenha regredido (OBJ-8).

<skills>
### Conformidade com skills

- [tests](../../.claude/skills/tests/SKILL.md): Execução das suítes completas, testes independentes e sem mocks quebrados.
- [executar-qa](../../.claude/skills/executar-qa/SKILL.md): Validação final da feature contra PRD/TechSpec, incluindo acessibilidade e responsividade.
- [executar-review](../../.claude/skills/executar-review/SKILL.md): Revisão pós-implementação das correções P-01 a P-08.
</skills>

<requirements>
- OBJ-8: Não regredir buscas, listagem, paginação e acessibilidade existentes.
- Métricas de sucesso do PRD: tema sem warning, timeouts efetivos, erro padronizado, paginação consistente, bundle ≤ 500 kB, padrões de código, logs e suíte verde (51 testes existentes + novos).
</requirements>

## Subtarefas

- [ ] 9.1 Executar `./mvnw test` — manter os testes existentes verdes e os novos cenários backend passando
- [ ] 9.2 Executar `npm test -- --watch=false` — manter os testes existentes verdes e os novos cenários frontend passando
- [ ] 9.3 Executar `npm run build` — validar bundle inicial ≤ 500 kB sem warning
- [ ] 9.4 Validação manual no navegador: console sem warnings (`Could not find Angular Material core theme`), aparência do tema, fluxo de busca/listagem/paginação e acessibilidade (teclado, labels, contraste, aria-live)

## Detalhes de implementação

Consulte `tasks/prd-correcoes-e-melhorias/techspec.md`:
- Seção "Abordagem de testes" (estratégia: 51 testes existentes + ~20 novos; cobertura >80%)
- Seção "Sequenciamento do desenvolvimento" (itens 11 e 12)
- Seção "Considerações técnicas > Conformidade com skills" (executar-qa e executar-review)

## Critérios de sucesso

- Suítes backend e frontend 100% verdes (existentes + novos), sem regressões.
- Build de produção sem warning de budget (bundle inicial ≤ 500 kB).
- Console do navegador sem warnings de tema; critérios WCAG AA mantidos.

## Testes da tarefa

### Testes unitários

- [ ] Execução completa da suíte backend (`./mvnw test`) verde
- [ ] Execução completa da suíte frontend (`npm test -- --watch=false`) verde

### Testes de integração

- [ ] Build de produção (`npm run build`) sem warning de budget
- [ ] Fluxo ponta-a-ponta manual: busca (sucesso, ID inexistente, ID não numérico), listagem, paginação e mensagens PT-BR

### Testes E2E (se aplicável)

- [ ] Validação manual de console (sem `Could not find Angular Material core theme`) e aparência do tema
- [ ] Validação de acessibilidade: navegação por teclado (Tab/Enter), foco visível, labels, contraste e aria-live

## Arquivos relevantes

- Suítes de teste do backend (`back-end/src/test/...`)
- Suítes de teste do frontend (`front-end/src/app/**/*.spec.ts`)
- Saída do `npm run build` (bundle/chunks)
