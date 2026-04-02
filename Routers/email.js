const express = require("express");
const router = express.Router();
const { sendOrderConfirmation } = require("../utils/mail");

// TEST - manda email di conferma ordine
router.post("/send-confirmation", async (req, res) => {
  try {
    await sendOrderConfirmation(req.body);
    res.json({
      message: "Email inviata con successo!",
    });
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
});

module.exports = router;
