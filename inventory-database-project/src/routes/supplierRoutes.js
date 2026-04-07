const express = require("express");
const { createSupplier } = require("../controllers/supplierController");

const router = express.Router();

router.post("/supplier", createSupplier);

module.exports = router;
