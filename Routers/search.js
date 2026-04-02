// SEARCH
const express = require("express");
const router = express.Router();
const searchController = require("../controllers/searchController");


//SEARCH
router.get("/search", searchController.searchSql);

module.exports = router;
