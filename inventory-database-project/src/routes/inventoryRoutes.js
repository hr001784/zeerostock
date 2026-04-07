const express = require("express");
const { createInventory, getInventory } = require("../controllers/inventoryController");

const router = express.Router();

router.post("/inventory", createInventory);
router.get("/inventory", getInventory);

module.exports = router;
