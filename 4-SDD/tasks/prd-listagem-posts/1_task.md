# Tarefa 1.0: Implementação Completa do Backend (API Proxy)

## Visão geral

Configurar as dependências do Spring Boot, criar a modelagem de dados e exceções, e implementar o serviço e o controller REST que farão o proxy das requisições para a API externa (JsonPlaceholder). Inclui também a suíte completa de testes unitários do backend.

<skills>
### Conformidade com skills

- [code-standards](../../.claude/skills/code-standards/SKILL.md): Padrões de código, variáveis descritivas e estruturação.
- [tests](../../.claude/skills/tests/SKILL.md): Padrão AAA, JUnit 5 + Mockito, testes independentes.
</skills>

<requirements>
- RF-1.6, RF-2.4 (O backend deve se comunicar com o JsonPlaceholder)
- RF-1.4, RF-2.1 (Campos dos dados a serem exibidos)
- RF-1.5 (Tratamento de post não encontrado e indisponibilidade)
</requirements>

## Subtarefas

- [ ] 1.1 Configurar `spring-boot-starter-web` e propriedades (timeouts/URL)
- [ ] 1.2 Criar DTOs (`PostDto`, `ErrorResponseDto`) e exceções customizadas (`PostNotFoundException`, `ExternalApiException`)
- [ ] 1.3 Criar `RestClientConfig` para instanciar o RestClient
- [ ] 1.4 Implementar `PostService` com a lógica de negócio via RestClient
- [ ] 1.5 Implementar `GlobalExceptionHandler` com `@ControllerAdvice`
- [ ] 1.6 Implementar `PostController` (Endpoints GET e `@CrossOrigin`)
- [ ] 1.7 Implementar os testes unitários (`PostServiceTest`, `PostControllerTest`, `GlobalExceptionHandlerTest`)

## Detalhes de implementação

Consulte `tasks/prd-listagem-posts/techspec.md`:
- Seções "Modelos de dados" e "Endpoints da API"
- Seção "Sequenciamento do desenvolvimento" (Itens 1 a 5)
- Seção "Abordagem de testes > Backend — Java"

## Critérios de sucesso

- Controller expõe `GET /api/posts` e `GET /api/posts/{id}` retornando os dados formatados ou erros apropriados.
- Testes cobrem 100% dos cenários do backend definidos na Tech Spec.

## Testes da tarefa

### Testes unitários

- [ ] Cenários 1 a 8 em `PostServiceTest`
- [ ] Cenários 9 a 15 em `PostControllerTest`
- [ ] Cenários 16 a 18 em `GlobalExceptionHandlerTest`

### Testes de integração

- [ ] N/A

## Arquivos relevantes

- `back-end/pom.xml` e `application.properties`
- `back-end/src/main/java/com/json/place/holder/back_end/config/RestClientConfig.java`
- `back-end/src/main/java/com/json/place/holder/back_end/dto/...`
- `back-end/src/main/java/com/json/place/holder/back_end/exception/...`
- `back-end/src/main/java/com/json/place/holder/back_end/service/PostService.java`
- `back-end/src/main/java/com/json/place/holder/back_end/controller/PostController.java`
- (E seus respectivos testes unitários em `back-end/src/test/...`)
