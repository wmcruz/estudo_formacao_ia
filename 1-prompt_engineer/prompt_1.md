Implemente uma listagem de posts no frontend e backend existentes.

O usuário deve poder informar o número do post e ver o resultado da pesquisa.

Para obter os dados, use a API do Json Place Holder(gratuita, sem necessidade de chave de API):

- API de get post: https://jsonplaceholder.typicode.com/posts/1 (busca o post através do ID)

O frontend deve buscar os dados apenas no backend.

Crie um endpoint no backend para o frontend consumir e exibir os dados no painel.

Aqui é um exemplo de um resultado em json retornado pela API:
{
    "userId": 1,
    "id": 1,
    "title": "sunt aut facere repellat provident occaecati excepturi optio reprehenderit",
    "body": "quia et suscipit\nsuscipit recusandae consequuntur expedita et cum\nreprehenderit molestiae ut ut quas totam\nnostrum rerum est autem sunt rem eveniet architecto"
}

