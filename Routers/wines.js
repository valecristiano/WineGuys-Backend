const express = require("express");
const router = express.Router();
const wineController = require("../controllers/wineController");

// INDEX
router.get("/", wineController.index);

// SHOW
router.get("/:slug", wineController.show);

// STORE
router.post("/", wineController.store);

module.exports = router;
