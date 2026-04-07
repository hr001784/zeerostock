const db = require("../db/connection");

function createInventory(req, res) {
  const { supplier_id, product_name, quantity, price } = req.body;

  if (!supplier_id || !product_name || quantity === undefined || price === undefined) {
    return res.status(400).json({ message: "supplier_id, product_name, quantity and price are required" });
  }

  const qty = Number(quantity);
  const unitPrice = Number(price);
  const supplierId = Number(supplier_id);

  if (!Number.isInteger(supplierId) || supplierId <= 0) {
    return res.status(400).json({ message: "supplier_id must be a valid positive integer" });
  }

  if (!Number.isFinite(qty) || qty < 0) {
    return res.status(400).json({ message: "quantity must be 0 or greater" });
  }

  if (!Number.isFinite(unitPrice) || unitPrice <= 0) {
    return res.status(400).json({ message: "price must be greater than 0" });
  }

  const supplier = db.prepare("SELECT id, name FROM suppliers WHERE id = ?").get(supplierId);
  if (!supplier) {
    return res.status(400).json({ message: "Invalid supplier_id" });
  }

  const stmt = db.prepare(
    "INSERT INTO inventory (supplier_id, product_name, quantity, price) VALUES (?, ?, ?, ?)"
  );
  const result = stmt.run(supplierId, product_name.trim(), qty, unitPrice);

  return res.status(201).json({
    id: result.lastInsertRowid,
    supplier_id: supplierId,
    product_name: product_name.trim(),
    quantity: qty,
    price: unitPrice
  });
}

function getInventory(req, res) {
  const { grouped, supplier_id, min_price, max_price } = req.query;
  const groupedMode = String(grouped || "").toLowerCase() === "true";
  const hasSupplierFilter = supplier_id !== undefined && supplier_id !== "";
  const hasMinPriceFilter = min_price !== undefined && min_price !== "";
  const hasMaxPriceFilter = max_price !== undefined && max_price !== "";

  const supplierId = hasSupplierFilter ? Number(supplier_id) : null;
  const minPrice = hasMinPriceFilter ? Number(min_price) : null;
  const maxPrice = hasMaxPriceFilter ? Number(max_price) : null;

  if (hasSupplierFilter && (!Number.isInteger(supplierId) || supplierId <= 0)) {
    return res.status(400).json({ message: "supplier_id must be a valid positive integer" });
  }

  if ((hasMinPriceFilter && !Number.isFinite(minPrice)) || (hasMaxPriceFilter && !Number.isFinite(maxPrice))) {
    return res.status(400).json({ message: "min_price and max_price must be valid numbers" });
  }

  if (hasMinPriceFilter && hasMaxPriceFilter && minPrice > maxPrice) {
    return res.status(400).json({ message: "Invalid price range: min_price cannot be greater than max_price" });
  }

  if (groupedMode) {
    const whereClauses = [];
    const params = [];
    if (hasSupplierFilter) {
      whereClauses.push("s.id = ?");
      params.push(supplierId);
    }
    if (hasMinPriceFilter) {
      whereClauses.push("i.price >= ?");
      params.push(minPrice);
    }
    if (hasMaxPriceFilter) {
      whereClauses.push("i.price <= ?");
      params.push(maxPrice);
    }
    const whereSql = whereClauses.length ? `WHERE ${whereClauses.join(" AND ")}` : "";

    const groupedRows = db
      .prepare(
        `
        SELECT
          s.id AS supplier_id,
          s.name AS supplier_name,
          s.city AS supplier_city,
          ROUND(SUM(i.quantity * i.price), 2) AS total_inventory_value,
          COUNT(i.id) AS total_products
        FROM suppliers s
        JOIN inventory i ON s.id = i.supplier_id
        ${whereSql}
        GROUP BY s.id, s.name, s.city
        ORDER BY total_inventory_value DESC
        `
      )
      .all(...params);

    return res.json(groupedRows);
  }

  const whereClauses = [];
  const params = [];
  if (hasSupplierFilter) {
    whereClauses.push("i.supplier_id = ?");
    params.push(supplierId);
  }
  if (hasMinPriceFilter) {
    whereClauses.push("i.price >= ?");
    params.push(minPrice);
  }
  if (hasMaxPriceFilter) {
    whereClauses.push("i.price <= ?");
    params.push(maxPrice);
  }
  const whereSql = whereClauses.length ? `WHERE ${whereClauses.join(" AND ")}` : "";

  const rows = db
    .prepare(
      `
      SELECT
        i.id,
        i.supplier_id,
        s.name AS supplier_name,
        i.product_name,
        i.quantity,
        i.price,
        ROUND(i.quantity * i.price, 2) AS item_value
      FROM inventory i
      JOIN suppliers s ON s.id = i.supplier_id
      ${whereSql}
      ORDER BY i.id DESC
      `
    )
    .all(...params);

  return res.json(rows);
}

module.exports = {
  createInventory,
  getInventory
};
