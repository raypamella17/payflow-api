# 💳 PayFlow API

API REST para simulação de pagamentos e processamento assíncrono, desenvolvida com Node.js e Express.

## 📌 Sobre o projeto

O PayFlow simula o fluxo de processamento de pagamentos.

Quando um pagamento é criado, ele recebe inicialmente o status `pending`.

O processamento acontece em segundo plano e, após alguns segundos, o pagamento pode mudar para:

- `approved` — pagamento aprovado
- `rejected` — pagamento rejeitado

Pagamentos aprovados também podem ser estornados, alterando o status para `refunded`.

## 🚀 Tecnologias

- Node.js
- Express
- JavaScript
- CORS
- dotenv

## 🔄 Fluxo do pagamento

POST /payments

↓  

pending

↓

Processamento assíncrono

↓

approved ou rejected

↓

refunded (caso seja solicitado um estorno)

## 📍 Rotas

### Verificar a API

GET /

### Criar pagamento

POST /payments

Exemplo:

{
  "customer": "Ray",
  "amount": 150,
  "method": "pix"
}

### Listar pagamentos

GET /payments

### Buscar pagamento por ID

GET /payments/:id

### Estornar pagamento

POST /payments/:id/refund

O estorno só pode ser realizado quando o pagamento estiver com status `approved`.

## ▶️ Como executar

Instale as dependências:

npm install

Inicie a API:

node app.js

A API ficará disponível em:

http://localhost:3000

## 📚 Conceitos demonstrados

- API REST
- Métodos HTTP
- Rotas
- JSON
- Status de pagamentos
- Processamento assíncrono
- Tratamento de erros
- Identificadores únicos