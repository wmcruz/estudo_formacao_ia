# Documento de Requisitos do Produto (PRD) — Correções e Melhorias da Listagem de Posts

## Visão Geral

Esta funcionalidade consolida as correções e melhorias apontadas no code review da feature "Listagem e Busca de Posts" (P-01 a P-08) e corrige um problema de apresentação no frontend: o tema do Angular Material, as fontes e os arquivos CSS não estão sendo carregados, o que gera o warning `Could not find Angular Material core theme` no console do navegador e deixa os componentes Material sem estilos visuais adequados.

O objetivo é elevar a qualidade técnica e a experiência do usuário sem adicionar novas funcionalidades de produto: garantir que o tema Material seja aplicado de forma consistente, que a integração com a API externa tenha limites de tempo efetivos, que todos os erros sigam um formato padronizado e amigável, que a paginação seja consistente, que o código atenda aos padrões do projeto, que o backend seja observável por logs e que o carregamento inicial da aplicação seja mais leve.

## Objetivos

- **OBJ-1**: Garantir que o tema do Material Design, as fontes e os estilos carreguem corretamente, eliminando o warning de tema core no console do navegador
- **OBJ-2**: Garantir que toda requisição do backend à API externa tenha limites de tempo efetivos, evitando que o usuário fique esperando indefinidamente
- **OBJ-3**: Padronizar o formato de erro em 100% dos cenários, incluindo IDs não numéricos
- **OBJ-4**: Tornar a paginação da tabela consistente e funcional
- **OBJ-5**: Adequar o código aos padrões do projeto (componentes enxutos, um modelo por arquivo)
- **OBJ-6**: Tornar o backend observável por meio de logs de operação e de erro
- **OBJ-7**: Reduzir o bundle inicial da aplicação para o limite previsto no build
- **OBJ-8**: Não regredir as funcionalidades existentes (busca, listagem, paginação e acessibilidade)

### Métricas de Sucesso

| Métrica | Critério |
|---|---|
| Tema carregado | Nenhuma mensagem `Could not find Angular Material core theme` no console do navegador |
| Aparência consistente | Componentes Material exibem cores, espaçamentos e tipografia corretos em toda a aplicação |
| Timeouts efetivos | Requisições à API externa limitadas a no máximo 5s de conexão e 10s de leitura; em estouro, erro amigável em tempo hábil |
| Erro padronizado | Busca com ID não numérico retorna erro 400 no mesmo formato de erro do projeto, com mensagem amigável exibida ao usuário |
| Paginação consistente | Tabela inicia com 10 posts por página e permite navegar entre páginas exibindo os posts corretos |
| Bundle inicial | Build de produção sem warning de budget (bundle inicial ≤ 500 kB) |
| Padrões de código | Classe do componente de página com no máximo 30 linhas; um modelo por arquivo |
| Observabilidade | Operações de busca/listagem registradas em INFO; falhas e condições anômalas em WARN/ERROR |
| Testes | Suíte existente (51 testes) mantida verde e novos testes de regressão passando |
| Acessibilidade | Critérios WCAG AA existentes (teclado, labels, contraste, aria-live) mantidos |

## Histórias de Usuário

- **US1**: Como usuário, eu quero que a aplicação carregue com o tema Material e as fontes aplicadas de forma consistente para que eu tenha uma interface com aparência profissional e legível
- **US2**: Como desenvolvedor, eu quero que não haja warnings nem erros no console do navegador para que eu possa confiar no funcionamento correto da aplicação
- **US3**: Como usuário, eu quero que, ao buscar um post com ID não numérico (ex.: "abc"), a aplicação me mostre uma mensagem clara e amigável para que eu entenda o problema sem ver detalhes técnicos
- **US4**: Como usuário, eu quero que a tabela comece exibindo 10 posts por página para que eu tenha uma visão inicial enxuta e previsível
- **US5**: Como usuário, eu quero poder navegar entre as páginas da tabela e ver os posts corretos de cada página para que a listagem seja utilizável com muitos registros
- **US6**: Como usuário, eu quero que, quando a API externa estiver lenta ou indisponível, a aplicação retorne um erro em tempo hábil para que eu não fique esperando indefinidamente
- **US7**: Como desenvolvedor, eu quero que os erros do backend sigam sempre o mesmo formato para que o frontend consiga tratá-los de forma única e previsível
- **US8**: Como desenvolvedor, eu quero que as operações do backend fiquem registradas em logs para que eu possa diagnosticar problemas de integração e uso
- **US9**: Como desenvolvedor, eu quero que o código siga os padrões do projeto (componentes enxutos, modelos em arquivos próprios) para que a manutenção seja mais simples
- **US10**: Como usuário, eu quero que a página inicial carregue rápido, sem carregar recursos desnecessários antes de eu acessar a listagem de posts

## Principais Funcionalidades

### F1 — Tema e Identidade Visual do Material Design

**O que faz:** Garante que o tema pré-definido do Angular Material, as fontes e os estilos globais sejam carregados corretamente em toda a aplicação, eliminando o warning de tema core.

**Por que é importante:** Sem o tema, os componentes Material perdem cores, espaçamentos, estados de foco/hover e tipografia, degradando a legibilidade e a usabilidade. O warning no console indica falha na base de estilos.

**Como funciona em alto nível:** Ao iniciar a aplicação, um tema Material válido é aplicado de forma global; todos os componentes passam a receber os estilos correspondentes, incluindo o fundo correto da página.

**Requisitos funcionais:**

1. **RF-1.1**: Ao carregar a aplicação, um tema pré-definido do Material Design deve ser aplicado globalmente a todos os componentes
2. **RF-1.2**: O console do navegador não deve exibir nenhum warning ou erro relacionado à ausência do tema core do Material Design
3. **RF-1.3**: A fonte padrão do Material Design deve ser carregada e aplicada ao conteúdo da aplicação
4. **RF-1.4**: Os componentes Material (tabela, paginator, campos, botões) devem exibir cores, espaçamentos e estados visuais corretos conforme o tema
5. **RF-1.5**: A página deve exibir o fundo (background) adequado ao tema aplicado

### F2 — Resiliência da Integração com a API Externa

**O que faz:** Garante que todas as requisições do backend à API do JsonPlaceholder tenham limites de tempo efetivos, evitando requisições penduradas.

**Por que é importante:** Se a API externa travar ou demorar, sem limites de tempo efetivos a requisição pode pendurar indefinidamente, deixando o usuário sem resposta. Os limites garantem previsibilidade de resposta.

**Como funciona em alto nível:** Cada chamada à API externa é limitada a um tempo máximo de conexão e um tempo máximo de leitura. Quando o limite é excedido, o backend trata o caso como falha de integração e o usuário recebe um erro amigável padronizado em tempo hábil.

**Requisitos funcionais:**

6. **RF-2.1**: Toda requisição do backend à API externa deve ser limitada a no máximo 5 segundos para estabelecer a conexão
7. **RF-2.2**: Toda requisição do backend à API externa deve ser limitada a no máximo 10 segundos para leitura da resposta
8. **RF-2.3**: Quando um limite de tempo for excedido, o usuário deve receber uma mensagem de erro amigável padronizada, sem esperar indefinidamente

### F3 — Tratamento de Erro Padronizado e Amigável

**O que faz:** Garante que todos os cenários de erro da aplicação retornem no mesmo formato padronizado, incluindo a busca com ID não numérico, que hoje retorna um erro fora do padrão.

**Por que é importante:** Um formato único de erro torna o tratamento no frontend previsível e permite exibir mensagens amigáveis ao usuário em qualquer situação, sem vazamento de detalhes técnicos.

**Como funciona em alto nível:** Toda falha — incluindo entrada inválida (ID não numérico) — é convertida em uma resposta padronizada com código e mensagem; o frontend exibe a mensagem amigável correspondente.

**Requisitos funcionais:**

9. **RF-3.1**: Toda falha de entrada ou de integração deve ser respondida no formato padronizado de erro do projeto (código + mensagem)
10. **RF-3.2**: Ao buscar um post com ID não numérico (ex.: "abc"), o backend deve responder com erro de entrada inválida (400) no formato padronizado
11. **RF-3.3**: Ao receber o erro de ID não numérico, o frontend deve exibir uma mensagem amigável ao usuário, sem detalhes técnicos

### F4 — Paginação Consistente e Funcional

**O que faz:** Padroniza o comportamento inicial da paginação (10 itens por página) e garante que a navegação entre páginas funcione de fato, exibindo os posts corretos.

**Por que é importante:** Hoje o paginator inicia com 50 itens (padrão do componente), divergente da intenção de exibir 10; além disso, o teste de paginação não valida a navegação real. Isso gera inconsistência entre o que é especificado e o que o usuário vê.

**Como funciona em alto nível:** A tabela inicia exibindo 10 posts por página, com as opções de tamanho (10, 25, 50) disponíveis; ao trocar de página, apenas os posts daquela página são exibidos.

**Requisitos funcionais:**

12. **RF-4.1**: A tabela de posts deve iniciar exibindo 10 itens por página
13. **RF-4.2**: As opções de itens por página (10, 25, 50) devem permanecer disponíveis ao usuário
14. **RF-4.3**: Ao navegar para uma página, o usuário deve visualizar exatamente os posts daquela página (ex.: página 2 exibe os posts 11–20)
15. **RF-4.4**: A mudança de página ou de tamanho deve refletir imediatamente na tabela exibida

### F5 — Qualidade e Padrões de Código no Frontend

**O que faz:** Adequa o componente de página e os modelos de dados aos padrões do projeto: lógica de classe enxuta (até 30 linhas) e um tipo de modelo por arquivo.

**Por que é importante:** Componentes com lógica extensa e múltiplos modelos no mesmo arquivo dificultam leitura, manutenção e teste. O alinhamento aos padrões do projeto reduz dívida técnica.

**Como funciona em alto nível:** A lógica do componente de página é reorganizada em partes menores e legíveis, e cada interface de modelo passa a viver em seu próprio arquivo, sem mudanças de comportamento visível para o usuário.

**Requisitos funcionais:**

16. **RF-5.1**: A lógica da classe do componente de página deve ter no máximo 30 linhas, conforme o padrão do projeto
17. **RF-5.2**: Cada interface de modelo de dados deve estar em um arquivo próprio, seguindo o padrão de nomenclatura do projeto
18. **RF-5.3**: A reorganização do código não pode alterar o comportamento funcional nem a aparência da interface

### F6 — Observabilidade do Backend

**O que faz:** Garante que as operações de busca e listagem e as falhas de integração sejam registradas em logs do backend, conforme previsto na especificação da feature original.

**Por que é importante:** Sem logs, falhas na integração com a API externa são difíceis de diagnosticar. Logs com contexto permitem identificar lentidão, erros e padrões de uso.

**Como funciona em alto nível:** O backend registra eventos de operação (início/sucesso da busca e da listagem) em nível INFO e registra falhas e condições anômalas em nível WARN/ERROR, com contexto suficiente para diagnóstico.

**Requisitos funcionais:**

19. **RF-6.1**: As operações de busca individual e de listagem devem ser registradas em logs INFO ao serem iniciadas e ao concluírem com sucesso
20. **RF-6.2**: Falhas de integração com a API externa e erros de entrada devem ser registrados em logs WARN ou ERROR com contexto suficiente para diagnóstico (identificador da operação/entrada)
21. **RF-6.3**: Os logs não devem conter dados sensíveis

### F7 — Carregamento Inicial Mais Leve

**O que faz:** Reduz o bundle inicial da aplicação para o limite previsto no build, carregando os recursos exclusivos da página de posts somente quando o usuário a acessa.

**Por que é importante:** O bundle inicial atual (664 kB) excede o limite de warning de 500 kB, impactando o tempo de carregamento da primeira página, especialmente em conexões lentas.

**Como funciona em alto nível:** A página de posts deixa de ser carregada junto com a página inicial; seus recursos são obtidos sob demanda quando o usuário navega para a rota de listagem.

**Requisitos funcionais:**

22. **RF-7.1**: O bundle inicial do build de produção deve ser de no máximo 500 kB, sem warning de budget
23. **RF-7.2**: Os recursos exclusivos da página de listagem de posts devem ser carregados somente quando o usuário acessar a rota correspondente
24. **RF-7.3**: A rota de listagem de posts deve permanecer acessível e funcional após a navegação sob demanda

## Experiência do Usuário

### Persona Principal

**Estudante/Desenvolvedor em aprendizado** — Pessoa que pratica integração full stack e utiliza a aplicação para validar a comunicação entre frontend e backend. Também atende ao **usuário final** que navega pela listagem e busca de posts. Secundariamente, o **desenvolvedor mantenedor** consome os logs e o código organizado.

### Fluxo Principal

1. O usuário acessa a aplicação e ela carrega com o tema Material aplicado, tipografia adequada e fundo correto, sem warnings no console
2. A tabela de posts é carregada iniciando com 10 itens por página
3. O usuário navega pelas páginas e vê os posts corretos de cada página
4. Ao buscar um post, o resultado é exibido; IDs inexistentes ou não numéricos mostram mensagens amigáveis padronizadas
5. Se a API externa estiver lenta, a aplicação responde com erro em tempo hábil, sem travamentos
6. Ao navegar para a listagem, a página carrega sob demanda, mantendo o carregamento inicial rápido

### Considerações de UI/UX

- Aparência consistente do Material Design em toda a aplicação (cores, espaçamentos, estados de foco/hover, elevação)
- Tipografia legível (fonte padrão do Material Design) aplicada a textos, labels e botões
- Mensagens de erro claras e amigáveis, em português, para IDs inexistentes e não numéricos
- Paginação com tamanho inicial de 10 itens, mantendo as opções disponíveis ao usuário
- Carregamento inicial rápido, sem recursos desnecessários antes da navegação para a listagem

### Requisitos de Acessibilidade (WCAG AA)

- O tema aplicado deve manter contraste mínimo de 4.5:1 para texto normal (garantido pelos temas pré-definidos do Material)
- Componentes focáveis (campos, botões, paginator) devem continuar navegáveis por teclado (Tab/Enter) com estado visual de foco visível
- Mensagens de erro devem continuar anunciadas por leitores de tela (aria-live)
- Labels associados a campos de formulário devem ser mantidos
- A navegação sob demanda não pode prejudicar a navegação por teclado nem a percepção de carregamento

## Restrições Técnicas de Alto Nível

- **Frontend**: Angular com Angular Material — projeto existente em `front-end/`; tema pré-definido do Material Design aplicado globalmente
- **Backend**: Spring Boot — projeto existente em `back-end/`
- **API externa**: JsonPlaceholder (`https://jsonplaceholder.typicode.com`) — API pública, sem autenticação; usada somente em leitura
- **Arquitetura**: O frontend não acessa a API externa diretamente; toda comunicação passa pelo backend
- **Limites de tempo**: 5 segundos máximos para conexão e 10 segundos máximos para leitura em toda chamada do backend à API externa
- **Padrão de erro**: Formato de erro padronizado (código + mensagem) em todos os cenários de falha, incluindo entrada inválida
- **Paginação**: client-side, iniciando com 10 itens por página (opções 10, 25, 50)
- **Limite de bundle**: build de produção com bundle inicial ≤ 500 kB (sem warning); página de posts carregada sob demanda
- **Padrões de código**: classe de componente com até 30 linhas; um modelo por arquivo; logs SLF4J
- **Dados**: somente leitura (GET) — sem criação, edição ou exclusão

## Fora do Escopo

- **Novas funcionalidades de produto**: não serão adicionadas novas telas, filtros, ordenação de colunas, CRUD ou comentários de posts
- **Tema customizado / identidade visual própria**: será usado um tema pré-definido do Material; paletas customizadas da marca, dark mode e tipografia customizada ficam fora do escopo
- **Otimização além do bundle inicial**: não inclui tree-shaking profundo de módulos, service workers, CDN ou cache de recursos
- **Observabilidade externa**: não inclui APM, dashboards, tracing distribuído ou monitoramento centralizado — apenas logs em arquivos do backend
- **Infraestrutura**: não inclui alterações de deploy, containers, CI/CD ou infraestrutura em nuvem
- **Alterações na API externa ou no contrato de dados**: nenhuma mudança no JsonPlaceholder nem na estrutura dos posts

(Nota: riscos técnicos de implementação serão detalhados na Especificação Técnica.)
