const express = require("express");
const cors = require("cors");
const { randomUUID } = require("crypto");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

const payments = [];

// Simula o processamento assíncrono do pagamento
function processPayment(paymentId) {
  setTimeout(() => {
    const payment = payments.find((item) => item.id === paymentId);

    if (!payment || payment.status !== "pending") {
      return;
    }

    const approved = Math.random() >= 0.3;

    payment.status = approved ? "approved" : "rejected";
    payment.processedAt = new Date().toISOString();
    payment.message = approved
      ? "Pagamento aprovado com sucesso."
      : "Pagamento rejeitado pela operadora.";
  }, 5000);
}

app.get("/", (req, res) => {
  res.json({
    message: "PayFlow API - Sistema de pagamentos e processamento assíncrono",
    routes: {
      createPayment: "POST /payments",
      listPayments: "GET /payments",
      getPaymentById: "GET /payments/:id",
      refundPayment: "POST /payments/:id/refund"
    }
  });
});

app.post("/payments", (req, res) => {
  const { customer, amount, method } = req.body;

  if (!customer || !amount || !method) {
    return res.status(400).json({
      error: "Os campos customer, amount e method são obrigatórios."
    });
  }

  if (amount <= 0) {
    return res.status(400).json({
      error: "O valor do pagamento precisa ser maior que zero."
    });
  }

  const payment = {
    id: randomUUID(),
    customer,
    amount,
    method,
    status: "pending",
    message: "Pagamento recebido e aguardando processamento.",
    createdAt: new Date().toISOString(),
    processedAt: null
  };

  payments.push(payment);

  processPayment(payment.id);

  return res.status(202).json({
    message: "Pagamento criado. O processamento será feito em segundo plano.",
    payment
  });
});

app.get("/payments", (req, res) => {
  res.json(payments);
});

app.get("/payments/:id", (req, res) => {
  const { id } = req.params;

  const payment = payments.find((item) => item.id === id);

  if (!payment) {
    return res.status(404).json({
      error: "Pagamento não encontrado."
    });
  }

  res.json(payment);
});

app.post("/payments/:id/refund", (req, res) => {
  const { id } = req.params;

  const payment = payments.find((item) => item.id === id);

  if (!payment) {
    return res.status(404).json({
      error: "Pagamento não encontrado."
    });
  }

  if (payment.status !== "approved") {
    return res.status(400).json({
      error: "Só é possível estornar pagamentos aprovados."
    });
  }

  payment.status = "refunded";
  payment.message = "Pagamento estornado com sucesso.";
  payment.refundedAt = new Date().toISOString();

  res.json({
    message: "Estorno realizado com sucesso.",
    payment
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`PayFlow API rodando na porta ${PORT}`);
});