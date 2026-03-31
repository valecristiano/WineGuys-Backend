const express = require("express");
const router = express.Router();
const wineController = require("../controllers/wineController");


// SEARCH
router.get("/search", wineController.searchSql);

module.exports = router;