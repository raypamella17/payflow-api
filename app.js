const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Conexão com MongoDB
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("MongoDB conectado com sucesso!");
  })
  .catch((error) => {
    console.error("Erro ao conectar ao MongoDB:", error.message);
  });

// Modelo de pagamento
const paymentSchema = new mongoose.Schema({
  customer: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  method: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    default: "pending",
  },
  message: {
    type: String,
    default: "Pagamento recebido e aguardando processamento.",
  },
  processedAt: {
    type: Date,
    default: null,
  },
  refundedAt: {
    type: Date,
    default: null,
  },
}, {
  timestamps: true,
});

const Payment = mongoose.model("Payment", paymentSchema);

// Processamento assíncrono
function processPayment(paymentId) {
  setTimeout(async () => {
    try {
      const payment = await Payment.findById(paymentId);

      if (!payment || payment.status !== "pending") {
        return;
      }

      const approved = Math.random() >= 0.3;

      payment.status = approved ? "approved" : "rejected";
      payment.processedAt = new Date();
      payment.message = approved
        ? "Pagamento aprovado com sucesso."
        : "Pagamento rejeitado pela operadora.";

      await payment.save();
    } catch (error) {
      console.error("Erro ao processar pagamento:", error.message);
    }
  }, 5000);
}

// Rota inicial
app.get("/", (req, res) => {
  res.json({
    message:
      "PayFlow API - Sistema de pagamentos e processamento assíncrono",
    routes: {
      createPayment: "POST /payments",
      listPayments: "GET /payments",
      getPaymentById: "GET /payments/:id",
      refundPayment: "POST /payments/:id/refund",
    },
  });
});

// Criar pagamento
app.post("/payments", async (req, res) => {
  try {
    const { customer, amount, method } = req.body;

    if (!customer || !amount || !method) {
      return res.status(400).json({
        error: "Os campos customer, amount e method são obrigatórios.",
      });
    }

    if (amount <= 0) {
      return res.status(400).json({
        error: "O valor do pagamento precisa ser maior que zero.",
      });
    }

    const payment = await Payment.create({
      customer,
      amount,
      method,
    });

    processPayment(payment._id);

    return res.status(202).json({
      message:
        "Pagamento criado. O processamento será feito em segundo plano.",
      payment,
    });
  } catch (error) {
    res.status(500).json({
      error: "Erro ao criar pagamento.",
    });
  }
});

// Listar pagamentos
app.get("/payments", async (req, res) => {
  try {
    const payments = await Payment.find().sort({ createdAt: -1 });
    res.json(payments);
  } catch (error) {
    res.status(500).json({
      error: "Erro ao buscar pagamentos.",
    });
  }
});

// Buscar pagamento pelo ID
app.get("/payments/:id", async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);

    if (!payment) {
      return res.status(404).json({
        error: "Pagamento não encontrado.",
      });
    }

    res.json(payment);
  } catch (error) {
    res.status(400).json({
      error: "ID de pagamento inválido.",
    });
  }
});

// Estornar pagamento
app.post("/payments/:id/refund", async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);

    if (!payment) {
      return res.status(404).json({
        error: "Pagamento não encontrado.",
      });
    }

    if (payment.status !== "approved") {
      return res.status(400).json({
        error: "Só é possível estornar pagamentos aprovados.",
      });
    }

    payment.status = "refunded";
    payment.message = "Pagamento estornado com sucesso.";
    payment.refundedAt = new Date();

    await payment.save();

    res.json({
      message: "Estorno realizado com sucesso.",
      payment,
    });
  } catch (error) {
    res.status(400).json({
      error: "ID de pagamento inválido.",
    });
  }
});

app.listen(PORT, () => {
  console.log(`PayFlow API rodando na porta ${PORT}`);
});