const express = require("express");
const router = express.Router();
const wineController = require("../controllers/wineController");

// INDEX - tutti i vini senza categorie
router.get("/", wineController.index);

// INDEX - categoria promo
router.get("/promo", wineController.indexPromo);

// INDEX - categoria premi
router.get("/premiati", wineController.indexPremi);

// INDEX - categoria più ventudi
router.get("/piuvenduti", wineController.indexPiuVenduti);

// INDEX - categoria primavera
router.get("/primavera", wineController.indexPrimavera);

// SHOW
router.get("/:slug", wineController.show);

// STORE
router.post("/", wineController.store);

module.exports = router;
