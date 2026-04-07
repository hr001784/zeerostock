# Inventory Database Project (Part B)

Node + Express + SQLite implementation for supplier and inventory APIs.

## Tech Stack

- Node.js
- Express
- SQLite (`better-sqlite3`)

## Database Schema

### `suppliers`
- `id` (primary key)
- `name`
- `city`

### `inventory`
- `id` (primary key)
- `supplier_id` (foreign key -> suppliers.id)
- `product_name`
- `quantity` (must be `>= 0`)
- `price` (must be `> 0`)

## Why SQL (SQLite)?

SQL is a strong fit because supplier-to-inventory is a structured one-to-many relationship and foreign keys enforce valid supplier references cleanly.

## APIs

### `POST /supplier`
Create a supplier.

Example body:
```json
{
  "name": "ABC Traders",
  "city": "Mumbai"
}
```

### `POST /inventory`
Create an inventory item.

Validation:
- supplier must exist
- quantity must be `>= 0`
- price must be `> 0`

Example body:
```json
{
  "supplier_id": 1,
  "product_name": "Office Chair",
  "quantity": 10,
  "price": 120
}
```

### `GET /inventory`
Returns all inventory items with supplier name and per-item value.

### `GET /inventory?grouped=true`
Returns inventory grouped by supplier and sorted by total inventory value (`quantity * price`) descending.

## Optimization Suggestion

Add index on `inventory.supplier_id` (already included in schema) to speed joins and grouped supplier-level queries.

## Run Locally

```bash
npm install
npm start
```

Server runs on `http://localhost:5000`.

## Suggested API Test Flow

1. `POST /supplier` (create 2 suppliers)
2. `POST /inventory` (create multiple items)
3. Try invalid payloads (bad supplier, negative quantity, zero price)
4. `GET /inventory`
5. `GET /inventory?grouped=true`

