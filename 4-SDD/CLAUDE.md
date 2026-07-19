# CLAUDE.md

Projeto full-stack com backend Java (Spring Boot) e frontend Angular (TypeScript).

## Skills

Skills em `.claude/skills/` — carregadas automaticamente pela IA quando a tarefa corresponder à descrição:

| Skill | Arquivo | Quando usar |
|-------|---------|-------------|
| Angular | [angular](.claude/skills/angular/SKILL.md) | Ao trabalhar com componentes, templates, pipes e serviços Angular |
| Code standards | [code-standards](.claude/skills/code-standards/SKILL.md) | Ao revisar ou escrever código seguindo padrões do projeto |
| Tests | [tests](.claude/skills/tests/SKILL.md) | Ao implementar testes no backend ou frontend |

## Estrutura de diretórios (aplicar sempre)

### Backend (`back-end/src/main/java/com/json/place/holder/back_end/`)

```
controller → service → repository → model/dto
```

| Pacote | Responsabilidade | Proibido |
|--------|------------------|----------|
| `controller/` | Validar HTTP, delegar ao service, retornar DTO | Lógica de negócio, chamadas DB |
| `service/` | Regras de negócio, mapper entity↔dto | Classes web (`HttpServletRequest`) |
| `repository/` | Queries DB via Spring Data | Lógica de negócio |
| `model/` | Entidades JPA (mapeamento DB) | Lógica de controller |
| `dto/` | Contratos de entrada/saída | Anotações JPA |

Camadas inferiores (`model`, `repository`, `dto`) **nunca** importam camadas superiores.

### Frontend (`front-end/src/app/`)

```
routes → pages → components
              ↓         ↓
          services    models
```

| Pasta | Responsabilidade | Proibido |
|-------|------------------|----------|
| `pages/` | Telas/containers roteados, orquestração de estado | UI interna, HTTP direto |
| `components/` | Widgets visuais reutilizáveis (`@Input`/`@Output`) | Injeção direta de serviços, lógica de rota |
| `services/` | Comunicação `HttpClient`, signals globais | Template HTML, estilos |
| `models/` | Interfaces TypeScript de payload | Componentes, lógica de serviço |

### Nomenclatura de arquivos

- **Java**: `UpperCamelCase` + sufixo da camada — ex: `PostController.java`, `PostService.java`
- **Angular**: `kebab-case` + sufixo do tipo — ex: `post-table.component.ts`, `post.service.ts`

## Portas

| Serviço   | Porta |
|-----------|-------|
| Backend   | 8080  |
| Frontend  | 4200  |

## Comandos

```bash
# Backend
./mvnw clean install    # Instalar
./mvnw spring-boot:run  # Executar
./mvnw test             # Testar

# Frontend
npm install                  # Instalar
npm start                    # Executar
npm test -- --watch=false    # Testar
npm run build                # Build produção
```