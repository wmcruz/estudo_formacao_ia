# Tarefa 2.0: Backend — Erro padronizado para ID não numérico

## Visão geral

Padronizar o cenário de ID não numérico (P-06), que hoje devolve o body default do Spring. O `GlobalExceptionHandler` ganhará um handler para `MethodArgumentTypeMismatchException` que responde `400` com o envelope `ErrorResponseDto` e código `INVALID_POST_ID`, garantindo que 100% dos erros sigam o mesmo formato (RF-3.1/RF-3.2).

<skills>
### Conformidade com skills

- [code-standards](../../.claude/skills/code-standards/SKILL.md): Envelope de erro em inglês, métodos curtos, sem duplicação de lógica no controller.
- [tests](../../.claude/skills/tests/SKILL.md): JUnit 5 + Mockito/MockMvc, AAA, testes independentes.
</skills>

<requirements>
- RF-3.1: Toda falha de entrada ou de integração respondida no formato padronizado de erro (código + mensagem).
- RF-3.2: Busca com ID não numérico (ex.: "abc") responde 400 com o envelope padronizado (`INVALID_POST_ID`).
</requirements>

## Subtarefas

- [ ] 2.1 Adicionar o handler `MethodArgumentTypeMismatchException` no `GlobalExceptionHandler` retornando 400 `INVALID_POST_ID` no envelope padronizado
- [ ] 2.2 Atualizar `GlobalExceptionHandlerTest` com o cenário 20 da TechSpec
- [ ] 2.3 Atualizar `PostControllerTest` para validar o envelope em `GET /api/posts/abc` (cenários 17–19 da TechSpec)

## Detalhes de implementação

Consulte `tasks/prd-correcoes-e-melhorias/techspec.md`:
- Seção "Design de implementação > Principais interfaces" (novo handler)
- Seção "Modelos de dados > ErrorResponseDto" (códigos `POST_NOT_FOUND`, `INVALID_POST_ID`, `EXTERNAL_API_ERROR`)
- Seção "Endpoints da API > GET /api/posts/{id}" (respostas 400/404/502)
- Seção "Abordagem de testes > Backend — Java" (tabelas `PostControllerTest` cenários 17–19 e `GlobalExceptionHandlerTest` cenário 20)

## Critérios de sucesso

- `GET /api/posts/abc` responde `400` com `$.error.code = "INVALID_POST_ID"` e `message = "Post ID must be a positive integer"`.
- Testes de regressão de controller (cenários 18–19) permanecem verdes.
- Nenhuma mudança no `PostController` (a validação é centralizada no handler).

## Testes da tarefa

### Testes unitários

- [ ] 17: `PostControllerTest` — GET post por ID não numérico retorna envelope padronizado (400, `INVALID_POST_ID`)
- [ ] 18: `PostControllerTest` — GET todos os posts sucesso (regressão)
- [ ] 19: `PostControllerTest` — GET post por ID erro upstream (regressão)
- [ ] 20: `GlobalExceptionHandlerTest` — mapeia `MethodArgumentTypeMismatchException` → 400 `INVALID_POST_ID`

### Testes de integração

- [ ] MockMvc (standalone com `GlobalExceptionHandler`) cobrindo o contrato HTTP do novo cenário

### Testes E2E (se aplicável)

- [ ] N/A

## Arquivos relevantes

- `back-end/src/main/java/com/json/place/holder/back_end/exception/GlobalExceptionHandler.java` (modificar)
- `back-end/src/test/java/com/json/place/holder/back_end/exception/GlobalExceptionHandlerTest.java` (modificar)
- `back-end/src/test/java/com/json/place/holder/back_end/controller/PostControllerTest.java` (modificar)
- `back-end/src/main/java/com/json/place/holder/back_end/dto/ErrorResponseDto.java` (inalterado)
