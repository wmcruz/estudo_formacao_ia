# Tarefa 2.0: Fundação e Serviços do Frontend

## Visão geral

Preparar a arquitetura base do Angular instalando o Angular Material, adicionando o HttpClient e implementando o serviço Angular responsável por se comunicar com a API do backend, incluindo os testes desse serviço.

<skills>
### Conformidade com skills

- [angular](../../.claude/skills/angular/SKILL.md): Uso de `inject()` para DI e tipagem estrita.
- [tests](../../.claude/skills/tests/SKILL.md): Padrão AAA e mock de requisições HTTP.
</skills>

<requirements>
- RF-1.3, RF-2.4: O frontend deve realizar requisições GET ao backend (proxy).
</requirements>

## Subtarefas

- [ ] 2.1 Instalar `@angular/material` e inicializar configurações (`app.config.ts`)
- [ ] 2.2 Criar modelos/interfaces `Post` e `ErrorResponse` em TypeScript
- [ ] 2.3 Implementar o `PostService` consumindo os endpoints `/api/posts` e `/api/posts/{id}`
- [ ] 2.4 Implementar os testes unitários de `PostService` com `HttpTestingController`

## Detalhes de implementação

Consulte `tasks/prd-listagem-posts/techspec.md`:
- Seções "Modelos de dados" e "Principais interfaces (TypeScript)"
- Seção "Sequenciamento do desenvolvimento" (Itens 6, 7 e 10 parcialmente)
- Seção "Abordagem de testes > Frontend — Angular"

## Critérios de sucesso

- Material instalado e disponível globalmente.
- O serviço `PostService` encapsula a comunicação HTTP com os tipos adequados.
- Testes HTTP cobrem todos os cenários de sucesso e falha definidos para o serviço.

## Testes da tarefa

### Testes unitários

- [ ] Cenários 19 a 23 em `PostService.spec.ts`

### Testes de integração

- [ ] N/A

## Arquivos relevantes

- `front-end/src/app/app.config.ts`
- `front-end/src/app/models/post.model.ts`
- `front-end/src/app/models/error-response.model.ts`
- `front-end/src/app/services/post.service.ts`
- `front-end/src/app/services/post.service.spec.ts`
