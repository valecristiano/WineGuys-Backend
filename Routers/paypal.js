const express = require("express");
const router = express.Router();

// importa il controller PayPal
const {
  createOrder,
  captureOrder,
} = require("../controllers/paypalController");

// crea un ordine PayPal - chiamato dal frontend prima di mostrare il bottone
router.post("/create-order", createOrder);

// cattura il pagamento dopo che il cliente ha approvato su PayPal
router.post("/capture-order/:orderID", captureOrder);

module.exports = router;
