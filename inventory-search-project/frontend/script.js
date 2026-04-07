const API_BASE_URL =
  window.localStorage.getItem("API_BASE_URL") ||
  (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
    ? "http://localhost:4000"
    : "https://zeerostock-12.onrender.com");

const form = document.getElementById("search-form");
const messageEl = document.getElementById("message");
const resultsBody = document.getElementById("results-body");
const categoryEl = document.getElementById("category");
const sortByEl = document.getElementById("sortBy");
const pageSizeEl = document.getElementById("pageSize");
const clearBtn = document.getElementById("clear-btn");
const totalResultsEl = document.getElementById("total-results");
const priceRangeEl = document.getElementById("price-range");
const prevPageBtn = document.getElementById("prev-page");
const nextPageBtn = document.getElementById("next-page");
const pageInfoEl = document.getElementById("page-info");
const tableWrapEl = document.querySelector(".table-wrap");
const cardsGridEl = document.getElementById("cards-grid");
const tableViewBtn = document.getElementById("table-view-btn");
const cardViewBtn = document.getElementById("card-view-btn");

let currentPage = 1;
let totalPages = 1;
let viewMode = "table";

function setMessage(text, type = "info") {
  messageEl.textContent = text;
  messageEl.className = `message ${type}`;
}

function renderRows(items) {
  resultsBody.innerHTML = "";

  items.forEach((item, index) => {
    const tr = document.createElement("tr");
    tr.className = "row-animate";
    tr.style.animationDelay = `${index * 35}ms`;
    tr.innerHTML = `
      <td>${item.productName}</td>
      <td><span class="category-chip">${item.category}</span></td>
      <td><span class="price-pill">$${Number(item.price).toFixed(2)}</span></td>
      <td><span class="supplier-cell"><span class="supplier-dot"></span>${item.supplier}</span></td>
    `;
    resultsBody.appendChild(tr);
  });
}

function renderCards(items) {
  cardsGridEl.innerHTML = "";
  items.forEach((item, index) => {
    const card = document.createElement("article");
    card.className = "product-card row-animate";
    card.style.animationDelay = `${index * 35}ms`;
    card.innerHTML = `
      <h3 class="product-title">${item.productName}</h3>
      <div class="product-meta">
        <span class="category-chip">${item.category}</span>
      </div>
      <p class="product-meta">Supplier: ${item.supplier}</p>
      <span class="product-price">$${Number(item.price).toFixed(2)}</span>
    `;
    cardsGridEl.appendChild(card);
  });
}

function applyViewMode() {
  const isTable = viewMode === "table";
  tableWrapEl.classList.toggle("hidden", !isTable);
  cardsGridEl.classList.toggle("hidden", isTable);
  tableViewBtn.classList.toggle("active", isTable);
  cardViewBtn.classList.toggle("active", !isTable);
}

function updateSummary(items, total) {
  totalResultsEl.textContent = String(total);

  if (items.length === 0) {
    priceRangeEl.textContent = "-";
    return;
  }

  const prices = items.map((item) => Number(item.price));
  const min = Math.min(...prices).toFixed(2);
  const max = Math.max(...prices).toFixed(2);
  priceRangeEl.textContent = `$${min} - $${max}`;
}

function updatePaginationButtons() {
  pageInfoEl.textContent = `Page ${currentPage} of ${totalPages}`;
  prevPageBtn.disabled = currentPage <= 1;
  nextPageBtn.disabled = currentPage >= totalPages;
}

function getSortParams(sortValue) {
  if (!sortValue) return {};
  const [sortBy, order] = sortValue.split("_");
  return { sortBy, order };
}

async function loadCategories() {
  try {
    const response = await fetch(`${API_BASE_URL}/categories`);
    if (!response.ok) return;
    const categories = await response.json();
    categoryEl.innerHTML = `<option value="">All categories</option>${categories
      .map((c) => `<option value="${c}">${c}</option>`)
      .join("")}`;
  } catch (_error) {
    categoryEl.innerHTML = `<option value="">All categories</option>`;
  }
}

async function runSearch(event, pageOverride = null) {
  if (event) event.preventDefault();
  if (pageOverride !== null) currentPage = pageOverride;

  const q = document.getElementById("q").value.trim();
  const category = categoryEl.value;
  const minPrice = document.getElementById("minPrice").value.trim();
  const maxPrice = document.getElementById("maxPrice").value.trim();
  const pageSize = pageSizeEl.value;
  const sortParts = getSortParams(sortByEl.value);

  const params = new URLSearchParams();
  if (q) params.append("q", q);
  if (category) params.append("category", category);
  if (minPrice) params.append("minPrice", minPrice);
  if (maxPrice) params.append("maxPrice", maxPrice);
  if (sortParts.sortBy) params.append("sortBy", sortParts.sortBy);
  if (sortParts.order) params.append("order", sortParts.order);
  params.append("page", String(currentPage));
  params.append("limit", pageSize);

  try {
    setMessage("Searching...", "info");
    const response = await fetch(`${API_BASE_URL}/search?${params.toString()}`);
    const data = await response.json();

    if (!response.ok) {
      setMessage(data.message || "Search failed", "error");
      resultsBody.innerHTML = "";
      updateSummary([], 0);
      totalPages = 1;
      updatePaginationButtons();
      return;
    }

    const items = data.data || [];
    const total = data.meta?.total || 0;
    totalPages = data.meta?.totalPages || 1;

    if (items.length === 0) {
      setMessage("No results found.", "info");
      resultsBody.innerHTML = "";
      updateSummary([], total);
      updatePaginationButtons();
      return;
    }

    setMessage(`Found ${total} item(s).`, "success");
    renderRows(items);
    renderCards(items);
    updateSummary(items, total);
    updatePaginationButtons();
    applyViewMode();
  } catch (error) {
    setMessage(`Error: ${error.message}`, "error");
  }
}

function clearFilters() {
  form.reset();
  currentPage = 1;
  runSearch();
}

form.addEventListener("submit", runSearch);
clearBtn.addEventListener("click", clearFilters);
pageSizeEl.addEventListener("change", () => runSearch(null, 1));
sortByEl.addEventListener("change", () => runSearch(null, 1));
prevPageBtn.addEventListener("click", () => {
  if (currentPage > 1) runSearch(null, currentPage - 1);
});
nextPageBtn.addEventListener("click", () => {
  if (currentPage < totalPages) runSearch(null, currentPage + 1);
});

window.addEventListener("DOMContentLoaded", async () => {
  await loadCategories();
  applyViewMode();
  runSearch(null, 1);
});

tableViewBtn.addEventListener("click", () => {
  viewMode = "table";
  applyViewMode();
});

cardViewBtn.addEventListener("click", () => {
  viewMode = "cards";
  applyViewMode();
});
