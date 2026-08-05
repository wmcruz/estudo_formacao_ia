# Tarefa 3.0: Backend — Observabilidade via logs no PostService

## Visão geral

Adicionar logging SLF4J ao `PostService` (P-07), registrando operações de busca e listagem em INFO, post não encontrado em WARN e falhas de integração em ERROR, sem alterar o comportamento funcional nem expor dados sensíveis.

<skills>
### Conformidade com skills

- [code-standards](../../.claude/skills/code-standards/SKILL.md): Mensagens de log em inglês, métodos ≤30 linhas, sem dados sensíveis.
- [tests](../../.claude/skills/tests/SKILL.md): JUnit 5 + Mockito + `MockRestServiceServer`, verificação de logs via `ListAppender` do Logback (sem chamadas reais à API).
</skills>

<requirements>
- RF-6.1: Busca individual e listagem registradas em INFO ao iniciar e ao concluir com sucesso.
- RF-6.2: Falhas de integração e erros de entrada registrados em WARN/ERROR com contexto suficiente (identificador/entrada).
- RF-6.3: Logs sem dados sensíveis.
</requirements>

## Subtarefas

- [x] 3.1 Adicionar logger SLF4J ao `PostService` e registrar INFO (início/sucesso), WARN (não encontrado) e ERROR (upstream) conforme a tabela de observabilidade
- [x] 3.2 Atualizar `PostServiceTest` com os cenários 9–16 da TechSpec (logging via `ListAppender`, ID nulo, ausência de dados sensíveis)
- [x] 3.3 Manter os 8 cenários existentes de `PostServiceTest` verdes (regressão)

## Detalhes de implementação

Consulte `tasks/prd-correcoes-e-melhorias/techspec.md`:
- Seção "Monitoramento e observabilidade > Logging (SLF4J — apenas no PostService)" (tabela de mensagens e níveis)
- Seção "Sequenciamento do desenvolvimento" (item 3)
- Seção "Abordagem de testes > Backend — Java > PostServiceTest" (tabela de cenários 9–16)

> O controller permanece sem logs — apenas delega. O comportamento funcional do service não muda.

## Critérios de sucesso

- Busca individual e listagem emitem logs INFO de início e de sucesso.
- Post não encontrado emite WARN; falha upstream emite ERROR com o ID/operação no contexto.
- `id = null` lança `IllegalArgumentException` sem chamar a API.
- Nenhuma mensagem de log contém dados sensíveis.
- 8 cenários existentes do service continuam verdes.

## Testes da tarefa

### Testes unitários

- [x] 9: `fetchPostById` loga INFO ao iniciar (`Fetching post with ID: 1`)
- [x] 10: `fetchPostById` loga INFO ao concluir com sucesso
- [x] 11: `fetchPostById` loga WARN quando post não encontrado e lança `PostNotFoundException`
- [x] 12: `fetchPostById` loga ERROR quando upstream falha e lança `ExternalApiException`
- [x] 13: `fetchAllPosts` loga INFO ao iniciar e ao concluir
- [x] 14: `fetchAllPosts` loga ERROR quando upstream falha e lança `ExternalApiException`
- [x] 15: `fetchPostById` com ID nulo lança `IllegalArgumentException` sem chamar a API
- [x] 16: Logs não contêm dados sensíveis

### Testes de integração

- [ ] N/A (log verificado em testes unitários com `ListAppender`)

### Testes E2E (se aplicável)

- [ ] N/A

## Arquivos relevantes

- `back-end/src/main/java/com/json/place/holder/back_end/service/PostService.java` (modificar)
- `back-end/src/test/java/com/json/place/holder/back_end/service/PostServiceTest.java` (modificar)
