const express = require("express");
const router = express.Router();
const orderController = require("../controllers/orderController");

// STORE
router.post("/", orderController.postCheckout);

module.exports = router;
