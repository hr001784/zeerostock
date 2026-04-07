const express = require("express");
const cors = require("cors");
const inventory = require("./data/inventory.json");

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.get("/", (_req, res) => {
  res.json({
    message: "Inventory Search API is running",
    endpoints: ["/health", "/categories", "/search"]
  });
});

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.get("/categories", (_req, res) => {
  const categories = [...new Set(inventory.map((item) => item.category))].sort((a, b) =>
    a.localeCompare(b)
  );
  res.json(categories);
});

app.get("/search", (req, res) => {
  const { q, category, minPrice, maxPrice, sortBy, order, page, limit } = req.query;

  const hasMin = minPrice !== undefined && minPrice !== "";
  const hasMax = maxPrice !== undefined && maxPrice !== "";

  const min = hasMin ? Number(minPrice) : null;
  const max = hasMax ? Number(maxPrice) : null;
  const pageNum = page !== undefined && page !== "" ? Number(page) : 1;
  const limitNum = limit !== undefined && limit !== "" ? Number(limit) : null;

  if ((hasMin && Number.isNaN(min)) || (hasMax && Number.isNaN(max))) {
    return res.status(400).json({ message: "Invalid price filter. minPrice/maxPrice must be numbers." });
  }

  if ((page !== undefined && (!Number.isInteger(pageNum) || pageNum <= 0)) ||
      (limit !== undefined && (!Number.isInteger(limitNum) || limitNum <= 0))) {
    return res.status(400).json({ message: "Invalid pagination: page/limit must be positive integers." });
  }

  if (hasMin && hasMax && min > max) {
    return res.status(400).json({ message: "Invalid price range: minPrice cannot be greater than maxPrice." });
  }

  let results = [...inventory];

  if (q && q.trim() !== "") {
    const term = q.trim().toLowerCase();
    results = results.filter((item) => item.productName.toLowerCase().includes(term));
  }

  if (category && category.trim() !== "") {
    const selectedCategory = category.trim().toLowerCase();
    results = results.filter((item) => item.category.toLowerCase() === selectedCategory);
  }

  if (hasMin) {
    results = results.filter((item) => item.price >= min);
  }

  if (hasMax) {
    results = results.filter((item) => item.price <= max);
  }

  if (sortBy) {
    const normalizedSortBy = String(sortBy).toLowerCase();
    const normalizedOrder = String(order || "asc").toLowerCase() === "desc" ? "desc" : "asc";

    if (!["price", "name"].includes(normalizedSortBy)) {
      return res.status(400).json({ message: "Invalid sortBy. Allowed values: price, name." });
    }

    results.sort((a, b) => {
      const baseValue =
        normalizedSortBy === "price"
          ? a.price - b.price
          : a.productName.localeCompare(b.productName);
      return normalizedOrder === "desc" ? -baseValue : baseValue;
    });
  }

  const total = results.length;
  const effectiveLimit = limitNum || total || 1;
  const start = (pageNum - 1) * effectiveLimit;
  const pagedResults = results.slice(start, start + effectiveLimit);

  return res.json({
    meta: {
      total,
      page: pageNum,
      limit: effectiveLimit,
      totalPages: Math.max(1, Math.ceil(total / effectiveLimit))
    },
    data: pagedResults
  });
});

app.listen(PORT, () => {
  console.log(`Part A backend running on http://localhost:${PORT}`);
});
