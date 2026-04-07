# Inventory Search Project (Part A)

Beginner-friendly full-stack assignment using Express backend and vanilla frontend.

## Tech Stack

- Backend: Node.js, Express
- Frontend: HTML, CSS, JavaScript
- Data: static JSON

## Features

- `GET /search` API with optional filters:
  - `q` (case-insensitive partial match on `productName`)
  - `category`
  - `minPrice`
  - `maxPrice`
- Combined filtering support
- Validation for invalid price input and invalid price range
- Frontend with:
  - search text box
  - category dropdown
  - min/max price fields
  - result table
  - "No results found" state

## How Search Logic Works

1. Start from full inventory data.
2. Apply `q` filter (case-insensitive `includes`) if provided.
3. Apply exact category filter (case-insensitive) if provided.
4. Apply min and max price filters if provided.
5. Return filtered array.

If no filters are supplied, all inventory rows are returned.

## Performance Improvement Idea

For large datasets:
- move data to a database and add indexes on `category` and `price`
- use pagination
- optionally add debounced search and full-text search indexing

## Run Locally

### 1) Start Backend

```bash
cd backend
npm install
npm start
```

Backend runs on `http://localhost:4000`.

### 2) Start Frontend

Open `frontend/index.html` directly in browser, or serve it with any static server.

If backend URL changes, update `API_BASE_URL` in `frontend/script.js`.

