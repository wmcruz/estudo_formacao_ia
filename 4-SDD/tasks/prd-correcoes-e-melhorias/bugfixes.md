# Relatório de Bugfix - Correções e Melhorias da Listagem de Posts

## Resumo
- Total de Bugs: 2 (BUG-01 Alta, BUG-02 Média) + 1 observação não bloqueante
- Bugs Corrigidos: 2
- Testes de Regressão Criados: 3

## Detalhes por Bug
| ID | Severidade | Status | Correção | Testes Criados |
|----|------------|--------|----------|----------------|
| BUG-01 | Alta | Corrigido | `PostTableComponent` passou a implementar `AfterViewInit` e vincula `dataSource.paginator = paginator` em `ngAfterViewInit` (padrão do Angular Material). O `ngOnChanges` ficou responsável apenas por atualizar `dataSource.data`, eliminando a dependência de o `@ViewChild` já estar resolvido quando o input `[posts]` chega. | `post-table.component.spec.ts`: "BUG-01: should link paginator when posts are set before view init" (reproduz o ciclo real com fixture novo + `setInput`; falha antes da correção); "BUG-01: should paginate when posts arrive asynchronously after view init". `posts-page.component.spec.ts`: "BUG-01: should paginate the table in the real page flow with 100 posts". |
| BUG-02 | Média | Corrigido | Estado reativo (6 signals) e handlers privados (`applyPosts`, `applyTableError`, `applySearchResult`, `applySearchError`) movidos para o `PostService`, que expõe os signals readonly (`posts`, `tableLoading`, `tableError`, `searchedPost`, `searchLoading`, `searchError`) e os métodos de orquestração `loadPosts()` e `searchPost(id)`. `PostsPageComponent` reduzido para 11 linhas de código (limite 30), delegando toda a orquestração ao service, sem mudança de comportamento ou de template. | `posts-page.component.spec.ts` reescrito como integração real (componente + `PostService` real + `HttpTestingController`) cobrindo os cenários 35–42 da TechSpec (delegação, signals e mensagens PT-BR); verificação estrutural da classe (11 ≤ 30 linhas); suíte `post.service.spec.ts` mantida verde (cenários 21–26). |

## Observações (não bloqueantes)

- **OBSERVAÇÃO de bugs.md:** campo de busca `type="number"` impede digitar "abc" pela UI; `INVALID_POST_ID` só chega via acesso direto à API. O frontend trata corretamente o envelope (coberto por testes) — nenhuma ação necessária.
- **E2E no navegador real:** as ferramentas do Playwright MCP não estavam disponíveis nesta sessão (mesma limitação do QA). A validação de regressão do BUG-01 foi feita de forma determinística via teste de ciclo de vida real (fixture novo + `setInput` sem `detectChanges` inicial), que reproduz exatamente a assinatura de falha do QA (`dataSource.paginator === undefined`, `length === 0`, 100 linhas) e passa após a correção. A validação de browser real está documentada como pendente de reexecução do QA.

## Testes
- Testes unitários: TODOS PASSANDO — Frontend **48/48** (`ng test --watch=false`), incluindo 3 novos testes de regressão; Backend **31/31** (`./mvnw test`), inalterado.
- Testes de integração: TODOS PASSANDO — `posts-page.component.spec.ts` agora valida o fluxo real componente → service → HTTP mockado (paginação com 100 posts e cenários de erro PT-BR).
- Testes E2E: NÃO EXECUTADO nesta sessão (Playwright MCP indisponível) — pendente reexecução do QA no navegador.
- Tipagem: SEM ERROS — `npm run build` (AOT) concluído sem erros e sem warning de budget.
