# Tarefa 1.0: Backend — Timeouts efetivos na integração com a API externa

## Visão geral

Tornar efetivos os limites de tempo (conexão 5s, leitura 10s) em toda chamada do backend ao JsonPlaceholder, corrigindo o P-01 do code review. O `RestClientConfig` passará a criar o bean `RestClient` a partir do `RestClient.Builder` auto-configurado pelo Spring Boot, de modo que `spring.http.client.connect-timeout` e `spring.http.client.read-timeout` sejam de fato aplicados ao `ClientHttpRequestFactory`.

<skills>
### Conformidade com skills

- [code-standards](../../.claude/skills/code-standards/SKILL.md): Nomenclatura, métodos ≤30 linhas, parâmetros ≤3, código em inglês.
- [tests](../../.claude/skills/tests/SKILL.md): JUnit 5 + Mockito, AAA, testes independentes, mocks de serviços externos.
</skills>

<requirements>
- RF-2.1: Toda requisição do backend à API externa limitada a no máximo 5s de conexão.
- RF-2.2: Toda requisição do backend à API externa limitada a no máximo 10s de leitura.
- RF-2.3: Estouro de limite resulta em erro amigável padronizado em tempo hábil (dependente da Tarefa 2.0 para o envelope).
</requirements>

## Subtarefas

- [x] 1.1 Modificar `RestClientConfig` para injetar o `RestClient.Builder` auto-configurado e construir o bean com `baseUrl` do JsonPlaceholder
- [x] 1.2 Criar `RestClientConfigTest` com os cenários R1–R2 da TechSpec
- [x] 1.3 Validar a nova fiação de DI pelo teste de contexto `BackEndApplicationTests` (`@SpringBootTest`)

## Detalhes de implementação

Consulte `tasks/prd-correcoes-e-melhorias/techspec.md`:
- Seção "Design de implementação > Principais interfaces" (contrato do `RestClientConfig`)
- Seção "Pontos de integração > API externa — JsonPlaceholder" (timeouts efetivos)
- Seção "Sequenciamento do desenvolvimento" (item 1)
- Seção "Abordagem de testes > Backend — Java > RestClientConfigTest" (tabela R1–R2)

> Injetar o builder (em vez de usar `RestClient.builder()` estático) é o que torna os timeouts efetivos; `application.properties` já possui os valores 5s/10s corretos e permanece inalterado.

## Critérios de sucesso

- Bean `RestClient` criado exclusivamente a partir do builder auto-configurado injetado (`baseUrl` + `build()`).
- Contexto Spring Boot inicia sem erro e o bean `RestClient` é injetável e não-nulo.
- Timeouts 5s/10s do `application.properties` são aplicados à fábrica de conexão (sem chamadas reais à API).

## Testes da tarefa

### Testes unitários

- [x] R1: `restClient` é criado a partir do builder injetado (`verify(builder).baseUrl(...)` e `.build()` chamados)
- [x] R2: Bean `RestClient` disponível e não-nulo no contexto

### Testes de integração

- [x] `BackEndApplicationTests` (`@SpringBootTest`) sobe o contexto com a nova fiação de DI

### Testes E2E (se aplicável)

- [ ] N/A

## Arquivos relevantes

- `back-end/src/main/java/com/json/place/holder/back_end/config/RestClientConfig.java` (modificar)
- `back-end/src/test/java/com/json/place/holder/back_end/config/RestClientConfigTest.java` (novo)
- `back-end/src/main/resources/application.properties` (inalterado)
- `back-end/src/test/java/com/json/place/holder/back_end/BackEndApplicationTests.java` (validar)
