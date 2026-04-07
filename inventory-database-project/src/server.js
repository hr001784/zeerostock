const express = require("express");
const supplierRoutes = require("./routes/supplierRoutes");
const inventoryRoutes = require("./routes/inventoryRoutes");
require("./db/connection");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.use(supplierRoutes);
app.use(inventoryRoutes);

app.listen(PORT, () => {
  console.log(`Part B backend running on http://localhost:${PORT}`);
});
