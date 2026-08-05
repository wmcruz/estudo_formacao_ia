# Tarefa 5.0: Frontend — Modelos separados e mensagens de erro amigáveis

## Visão geral

Adequar os modelos de erro ao padrão de um tipo por arquivo (P-05) e centralizar a tradução dos códigos de erro do backend para mensagens PT-BR amigáveis no `PostService` (F3), mantendo o envelope do backend em inglês.

<skills>
### Conformidade com skills

- [angular](../../.claude/skills/angular/SKILL.md): Interfaces de modelo em arquivos próprios, service com DI via `inject()`.
- [code-standards](../../.claude/skills/code-standards/SKILL.md): Um tipo por arquivo, sem switch/case (usar mapa `Record`), código em inglês.
- [tests](../../.claude/skills/tests/SKILL.md): Jasmine + Karma + `HttpTestingController`, AAA.
</skills>

<requirements>
- RF-5.2: Cada interface de modelo em arquivo próprio, seguindo a nomenclatura do projeto.
- RF-3.3: Ao receber erro do backend, o frontend exibe mensagem amigável ao usuário, sem detalhes técnicos.
</requirements>

## Subtarefas

- [x] 5.1 Criar `error-detail.model.ts` com a interface `ErrorDetail` e removê-la de `error-response.model.ts` (atualizando os imports existentes)
- [x] 5.2 Adicionar `getFriendlyMessage(error: ErrorResponse): string` ao `PostService` com mapa `Record` code → mensagem PT-BR (incluindo fallback `UNKNOWN_ERROR`)
- [x] 5.3 Atualizar `post.service.spec.ts` com os cenários 21–26 da TechSpec

## Detalhes de implementação

Consulte `tasks/prd-correcoes-e-melhorias/techspec.md`:
- Seção "Design de implementação > Principais interfaces" (contrato do `getFriendlyMessage` e `error-detail.model.ts`)
- Seção "Modelos de dados > Mapeamento código de erro → mensagem amigável" (tabela PT-BR)
- Seção "Sequenciamento do desenvolvimento" (itens 6 e 7 — apenas a criação do método; o consumo nos componentes de página/busca/tabela ocorre na Tarefa 7.0)
- Seção "Abordagem de testes > Frontend — Angular > post.service.spec.ts" (cenários 21–26)

## Critérios de sucesso

- `ErrorDetail` vive em `error-detail.model.ts`; `error-response.model.ts` mantém apenas `ErrorResponse`; build sem imports quebrados.
- `getFriendlyMessage()` retorna a mensagem PT-BR correta para cada código conhecido e o fallback para código desconhecido ou ausência de `error`.

## Testes da tarefa

### Testes unitários

- [x] 21: `getFriendlyMessage(POST_NOT_FOUND)` → `Post não encontrado`
- [x] 22: `getFriendlyMessage(INVALID_POST_ID)` → `ID do post deve ser um número inteiro positivo`
- [x] 23: `getFriendlyMessage(EXTERNAL_API_ERROR)` → `Não foi possível se comunicar com o serviço externo. Tente novamente.`
- [x] 24: `getFriendlyMessage` com código desconhecido → fallback `Ocorreu um erro inesperado. Tente novamente.`
- [x] 25: `getFriendlyMessage` sem `error` presente → mensagem genérica `UNKNOWN_ERROR`
- [x] 26: `handleError` preserva o envelope do backend (regressão)

### Testes de integração

- [ ] N/A

### Testes E2E (se aplicável)

- [ ] N/A

## Arquivos relevantes

- `front-end/src/app/models/error-detail.model.ts` (novo)
- `front-end/src/app/models/error-response.model.ts` (modificar)
- `front-end/src/app/services/post.service.ts` (modificar)
- `front-end/src/app/services/post.service.spec.ts` (modificar)
- Demais arquivos com import de `ErrorDetail` (atualizar imports)
