# Tarefa 4.0: Frontend — Tema Material, fontes e estilos globais

## Visão geral

Corrigir o carregamento do tema do Angular Material (F1), eliminando o warning `Could not find Angular Material core theme` no console. O tema pré-definido `indigo-pink` será registrado globalmente, as fontes Roboto e Material Icons carregadas via Google Fonts e a página receberá o fundo adequado ao tema.

<skills>
### Conformidade com skills

- [angular](../../.claude/skills/angular/SKILL.md): Configuração de estilos global via `angular.json`, tema Material pré-definido, sem paleta customizada.
- [tests](../../.claude/skills/tests/SKILL.md): Jasmine + Karma, verificação de estilo computado (`getComputedStyle`).
</skills>

<requirements>
- RF-1.1: Tema pré-definido do Material Design aplicado globalmente a todos os componentes.
- RF-1.2: Console do navegador sem warning/erro de tema core ausente.
- RF-1.3: Fonte padrão do Material (Roboto) carregada e aplicada ao conteúdo.
- RF-1.4: Componentes Material com cores, espaçamentos e estados visuais corretos conforme o tema.
- RF-1.5: Página exibe o fundo (background) adequado ao tema.
</requirements>

## Subtarefas

- [ ] 4.1 Registrar `@angular/material/prebuilt-themes/indigo-pink.css` na lista `styles` dos targets `build` e `test` do `angular.json`
- [ ] 4.2 Adicionar links Roboto + Material Icons (Google Fonts) no `index.html` e a classe `mat-app-background` no `body`
- [ ] 4.3 Ajustar `styles.css` (font-family Roboto com fallback e reset de margem do `body`)
- [ ] 4.4 Atualizar `post-search.component.spec.ts` com os cenários 33–34 da TechSpec (tema aplicado + regressão de label)

## Detalhes de implementação

Consulte `tasks/prd-correcoes-e-melhorias/techspec.md`:
- Seção "Design de implementação" (componentes `angular.json`, `index.html`, `styles.css`)
- Seção "Considerações técnicas > Principais decisões" (tema prebuilt e Google Fonts)
- Seção "Abordagem de testes > Frontend — Angular > post-search.component.spec.ts" (cenários 33–34)

> O teste 33 depende do tema estar na lista `styles` do target `test` do `angular.json`, adicionada junto com a do `build`. As mensagens em PT-BR do mapa de erros são tratadas na Tarefa 5.0.

## Critérios de sucesso

- Nenhuma ocorrência de `Could not find Angular Material core theme` no console do navegador.
- Componentes Material exibem cores, espaçamentos e tipografia corretos em toda a aplicação.
- Página exibe o fundo adequado ao tema; fontes Roboto aplicadas com fallback.

## Testes da tarefa

### Testes unitários

- [ ] 33: Botão primário recebe cor do tema Material (`getComputedStyle().backgroundColor === "rgb(63, 81, 181)"`) — prova do tema carregado
- [ ] 34: Campo de input renderizado com label `ID do Post` (regressão)

### Testes de integração

- [ ] N/A (tema validado via teste de estilo computado + validação manual/QA no navegador)

### Testes E2E (se aplicável)

- [ ] Validação manual do console sem warnings e aparência do tema (verificada na Tarefa 9.0)

## Arquivos relevantes

- `front-end/angular.json` (modificar)
- `front-end/src/index.html` (modificar)
- `front-end/src/styles.css` (modificar)
- `front-end/src/app/components/post-search/post-search.component.spec.ts` (modificar)
