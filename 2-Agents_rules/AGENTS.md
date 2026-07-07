# AGENTS.md — 2-Agents_rules

Projeto full-stack com backend Java (Spring Boot) e frontend Angular (TypeScript).

## Regras do projeto

Consulte e aplique as rules em `.agents/rules/` — **não duplique o conteúdo delas aqui**:

| Rule | Arquivo | Quando usar |
|------|---------|-------------|
| Code standards | [code-standards.md](.agents/rules/code-standards.md) | Ao escrever ou revisar código em `back-end/` e `front-end/` |
| Folder structure | [folder-structure.md](.agents/rules/folder-structure.md) | Ao criar, mover ou organizar arquivos |
| Angular | [angular.md](.agents/rules/angular.md) | Ao escrever ou revisar componentes, templates, pipes e serviços no Angular |
| Testing | [tests.md](.agents/rules/tests.md) | Ao implementar testes no backend (JUnit/Mockito) ou frontend (Jasmine/Karma) |

## Estrutura

```
2-Agents_rules/
├── back-end/  # API REST (Java + Spring Boot + Maven)
├── front-end/ # UI (Angular + TypeScript)
├── .agents/   # Regras e boas práticas do projeto para a IA
└── examples/  # Exemplos e modelos originais de referência
```

## Portas

| Serviço   | Porta | URL                          |
|-----------|-------|------------------------------|
| Backend   | 8080  | http://localhost:8080        |
| Frontend  | 4200  | http://localhost:4200        |

O backend é executado na porta padrão do Spring Boot (`8080`). O frontend consome a API local do backend na porta correspondente.

## Instalação de dependências

Execute os comandos a partir dos diretórios respectivos:

```bash
# Backend (compilação e download das dependências do Maven)
cd back-end
./mvnw clean install

# Frontend (download dos pacotes do npm)
cd front-end
npm install
```

## Executar o projeto

Em dois terminais separados:

```bash
# Terminal 1 — Backend (Spring Boot)
cd back-end
./mvnw spring-boot:run

# Terminal 2 — Frontend (Angular Development Server)
cd front-end
npm start
```

### Outros comandos úteis

```bash
# Backend — Executar testes
cd back-end
./mvnw test

# Frontend — Executar testes (Single Run)
cd front-end
npm test -- --watch=false

# Frontend — Build de produção
cd front-end
npm run build
```

## Principais dependências

### Backend (Spring Boot)

| Dependência | Uso |
|-------------|-----|
| Spring Web  | Criação de endpoints REST, controllers e suporte a HTTP |
| Spring Boot DevTools | Recarregamento rápido durante o desenvolvimento |
| Spring Boot Test | JUnit 5 e ferramentas de suporte para testes integrados |
| Mockito     | Criação de Mocks para testes unitários |

### Frontend (Angular)

| Dependência | Uso |
|-------------|-----|
| @angular/core | Framework base do Angular |
| @angular/router | Roteamento nativo do frontend |
| @angular/common/http | Cliente HTTP para integração com backend |
| jasmine / karma | Framework e executor de testes automatizados |
