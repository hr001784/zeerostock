const db = require("../db/connection");

function createSupplier(req, res) {
  const { name, city } = req.body;

  if (!name || !city) {
    return res.status(400).json({ message: "name and city are required" });
  }

  const stmt = db.prepare("INSERT INTO suppliers (name, city) VALUES (?, ?)");
  const result = stmt.run(name.trim(), city.trim());

  return res.status(201).json({
    id: result.lastInsertRowid,
    name: name.trim(),
    city: city.trim()
  });
}

module.exports = {
  createSupplier
};
