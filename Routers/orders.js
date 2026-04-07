const express = require("express");
const router = express.Router();
const orderController = require("../controllers/orderController");

// STORE
router.post("/", orderController.postCheckout);

router.post("/validate-coupon", orderController.validateCoupon);

module.exports = router;
