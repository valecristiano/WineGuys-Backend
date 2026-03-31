const express = require("express");
const router = express.Router();
const wineController = require("../controllers/wineController");

// INDEX - tutti i vini senza categorie
router.get("/", wineController.index);

// INDEX - tutti i vini con categoria promo
router.get("/promo", wineController.indexPromo);

// SHOW
router.get("/:slug", wineController.show);

// STORE
router.post("/", wineController.store);

module.exports = router;
