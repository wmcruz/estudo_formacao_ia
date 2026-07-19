# Implementação de Listagem de Posts - Full Stack

## Contexto
Implemente funcionalidades de listagem de posts no frontend Angular e backend Spring Boot existentes, utilizando a API do JsonPlaceholder (gratuita, sem necessidade de chave de API).

**Importante:** O frontend deve buscar dados apenas no backend. Crie endpoints no backend para o frontend consumir.

## Funcionalidades

### 1. Busca Individual por ID
- O usuário deve poder informar o número do post e ver o resultado da pesquisa
- API: https://jsonplaceholder.typicode.com/posts/{id}

### 2. Listagem de Todos os Posts em Tabela
- Exibir todos os posts em uma tabela
- API: https://jsonplaceholder.typicode.com/posts

Ambas as funcionalidades devem estar ativas simultaneamente na interface.

## Tema
Utilizar Material Design no frontend.

## Exemplo de Resposta da API

**Get Post (individual):**
```json
{
    "userId": 1,
    "id": 1,
    "title": "sunt aut facere repellat provident occaecati excepturi optio reprehenderit",
    "body": "quia et suscipit\nsuscipit recusandae consequuntur expedita et cum\nreprehenderit molestiae ut ut quas totam\nnostrum rerum est autem sunt rem eveniet architecto"
}
```

**Get All Posts (listagem):**
```json
[
    {
        "userId": 1,
        "id": 1,
        "title": "sunt aut facere repellat provident occaecati excepturi optio reprehenderit",
        "body": "quia et suscipit\nsuscipit recusandae consequuntur expedita et cum\nreprehenderit molestiae ut ut quas totam\nnostrum rerum est autem sunt rem eveniet architecto"
    },
    {
        "userId": 1,
        "id": 2,
        "title": "qui est esse",
        "body": "est rerum tempore vitae\nsequi sint nihil reprehenderit dolor beatae ea dolores neque\nfugiat blanditiis voluptate porro vel nihil molestiae ut reiciendis\nqui aperiam non debitis possimus qui neque nisi nulla"
    }
]
```
