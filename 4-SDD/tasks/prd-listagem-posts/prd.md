# Documento de Requisitos do Produto (PRD)

## Visão Geral

Esta funcionalidade implementa uma interface de listagem e consulta de posts em uma aplicação full stack composta por um frontend Angular com Material Design e um backend Spring Boot. O objetivo é praticar a integração entre camadas da aplicação, consumindo a API pública do JsonPlaceholder como fonte de dados externa.

O frontend não acessa a API externa diretamente — ele consome endpoints REST expostos pelo backend Spring Boot, que por sua vez atua como intermediário (proxy) para a API do JsonPlaceholder. A interface oferece duas capacidades simultâneas: busca individual de post por ID e listagem completa em tabela paginada.

## Objetivos

- **OBJ-1**: Demonstrar a integração completa entre frontend Angular e backend Spring Boot através do consumo de endpoints REST
- **OBJ-2**: Implementar o padrão de arquitetura em camadas onde o frontend nunca acessa APIs externas diretamente
- **OBJ-3**: Exibir dados de posts de forma clara e navegável usando componentes Material Design
- **OBJ-4**: Garantir feedback visual adequado ao usuário em cenários de sucesso e erro
- **OBJ-5**: Seguir boas práticas de acessibilidade (WCAG AA) em todos os componentes da interface

### Métricas de Sucesso

| Métrica | Critério |
|---|---|
| Busca individual funcional | Usuário informa um ID válido (1–100) e visualiza o post correspondente |
| Listagem completa funcional | Todos os 100 posts são carregados e exibidos na tabela com paginação |
| Feedback de erro | Post não encontrado exibe mensagem amigável na tela |
| Acessibilidade | Interface navegável por teclado com rótulos semânticos adequados |

## Histórias de Usuário

- **US1**: Como estudante, eu quero buscar um post pelo seu ID para que eu possa visualizar os detalhes completos daquele post específico (userId, id, título e corpo)
- **US2**: Como estudante, eu quero ver todos os posts listados em uma tabela para que eu possa navegar por todo o conteúdo disponível de forma organizada
- **US3**: Como estudante, eu quero que a tabela de posts tenha paginação para que eu possa navegar entre páginas de resultados sem sobrecarga visual
- **US4**: Como estudante, eu quero receber uma mensagem amigável quando buscar um ID inexistente para que eu entenda que o post não foi encontrado, sem ver erros técnicos
- **US5**: Como estudante, eu quero que ambas as funcionalidades (busca e listagem) estejam ativas simultaneamente na mesma tela para que eu possa usar qualquer uma sem navegar entre páginas

## Principais Funcionalidades

### F1 — Busca Individual de Post por ID

**O que faz:** Permite ao usuário digitar o número (ID) de um post em um campo de texto numérico e, ao clicar em um botão de busca, visualizar os dados daquele post.

**Por que é importante:** Demonstra o fluxo completo de requisição: input do usuário → chamada ao backend → backend consulta API externa → resposta renderizada no frontend.

**Como funciona em alto nível:** O usuário informa o ID no campo, clica no botão de busca, o frontend faz uma requisição GET ao backend, que repassa a consulta ao JsonPlaceholder e retorna o resultado para exibição.

**Requisitos funcionais:**

1. **RF-1.1**: A interface deve exibir um campo de entrada numérico para o ID do post
2. **RF-1.2**: A interface deve exibir um botão de busca ao lado do campo de ID
3. **RF-1.3**: Ao clicar no botão de busca, o frontend deve enviar uma requisição GET ao endpoint do backend (`/api/posts/{id}`)
4. **RF-1.4**: O resultado da busca deve exibir os campos: userId, id, title e body
5. **RF-1.5**: Quando o post não for encontrado, a interface deve exibir uma mensagem amigável visível na tela (ex: "Post não encontrado")
6. **RF-1.6**: O backend deve expor um endpoint GET que recebe o ID e consulta `https://jsonplaceholder.typicode.com/posts/{id}`

### F2 — Listagem Completa de Posts em Tabela

**O que faz:** Exibe todos os posts disponíveis na API em uma tabela com as colunas ID, User ID, Título e Body, com paginação no lado do cliente.

**Por que é importante:** Demonstra o carregamento e renderização de uma coleção de dados em formato tabular, com controle de paginação no frontend.

**Como funciona em alto nível:** Ao carregar a tela, o frontend requisita todos os posts ao backend, que consulta o JsonPlaceholder. Os dados são armazenados no frontend e exibidos na tabela com paginação client-side.

**Requisitos funcionais:**

7. **RF-2.1**: A interface deve exibir uma tabela com as colunas: ID, User ID, Título e Body
8. **RF-2.2**: A tabela deve carregar todos os posts disponíveis ao inicializar a tela
9. **RF-2.3**: A tabela deve implementar paginação no lado do cliente (client-side)
10. **RF-2.4**: O backend deve expor um endpoint GET que retorna todos os posts consultando `https://jsonplaceholder.typicode.com/posts`
11. **RF-2.5**: Ambas as funcionalidades (busca individual e tabela) devem estar visíveis e ativas simultaneamente na mesma página

## Experiência do Usuário

### Persona Principal

**Estudante/Desenvolvedor em aprendizado** — Pessoa que está praticando integração full stack e precisa de uma interface funcional e clara para validar que a comunicação entre frontend e backend está funcionando corretamente.

### Fluxo Principal

1. O usuário acessa a página principal da aplicação
2. A tabela de posts é carregada automaticamente com todos os posts (paginada)
3. O usuário pode navegar entre páginas da tabela
4. Simultaneamente, o usuário pode digitar um ID no campo de busca e clicar no botão para buscar um post específico
5. O resultado da busca individual é exibido em uma área separada da tabela

### Considerações de UI/UX

- Utilizar componentes Angular Material (mat-table, mat-paginator, mat-form-field, mat-button)
- Layout deve acomodar ambas as funcionalidades sem necessidade de scroll horizontal
- O resultado da busca individual deve ser visualmente distinto da tabela de listagem
- Feedback de carregamento (loading) deve ser exibido enquanto dados estão sendo buscados

### Requisitos de Acessibilidade (WCAG AA)

- Todos os campos de formulário devem possuir labels associados
- A tabela deve usar marcação semântica adequada (`<th>`, `<td>`, `scope`)
- Botões e links devem ser navegáveis por teclado (Tab/Enter)
- Contraste de cores deve atender ao mínimo de 4.5:1 para texto normal
- Mensagens de erro/feedback devem ser anunciadas por leitores de tela (aria-live)

## Restrições Técnicas de Alto Nível

- **Frontend**: Angular com Angular Material (Material Design) — projeto já existente no diretório `front-end/`
- **Backend**: Spring Boot — projeto já existente no diretório `back-end/`
- **API externa**: JsonPlaceholder (`https://jsonplaceholder.typicode.com`) — API pública, gratuita, sem autenticação
- **Arquitetura**: O frontend NÃO deve acessar a API do JsonPlaceholder diretamente; toda comunicação deve passar pelo backend
- **Dados**: Somente leitura (GET) — não há criação, edição ou exclusão de dados
- **Paginação**: Implementada no frontend (client-side), pois a API do JsonPlaceholder retorna todos os registros em uma única chamada

## Fora do Escopo

- **CRUD completo**: Não haverá funcionalidades de criar, editar ou deletar posts — apenas leitura
- **Autenticação/Autorização**: Não há login de usuários, controle de sessão ou permissões
- **Filtros avançados e ordenação**: Não haverá filtros por userId, busca textual ou ordenação de colunas na tabela
- **Comentários dos posts**: Não será implementada a exibição de comentários associados aos posts
- **Paginação server-side**: A paginação será exclusivamente no frontend
- **Cache de dados**: Não há requisito de cache no backend para respostas da API externa
- **Testes automatizados**: A cobertura de testes será tratada em escopo separado

(Nota: riscos técnicos de implementação serão detalhados na Especificação Técnica.)
