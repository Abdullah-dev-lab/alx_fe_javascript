// script.js

let quotes = JSON.parse(localStorage.getItem("quotes")) || [
  { text: "The best way to get started is to quit talking and begin doing.", category: "Motivation" },
  { text: "Life is what happens when you're busy making other plans.", category: "Life" },
];

let selectedCategory = localStorage.getItem("selectedCategory") || "All";

// --- STORAGE HELPERS ---
function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}
function saveSelectedCategory() {
  localStorage.setItem("selectedCategory", selectedCategory);
}

// --- POPULATE CATEGORY DROPDOWN ---
function populateCategories() {
  const filterDropdown = document.getElementById("categoryFilter");
  if (!filterDropdown) return;

  const categories = ["All", ...new Set(quotes.map(q => q.category))];
  filterDropdown.innerHTML = "";
  categories.forEach(cat => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    if (cat === selectedCategory) option.selected = true;
    filterDropdown.appendChild(option);
  });
}

// --- FILTER & DISPLAY QUOTES ---
function filterQuotes() {
  const container = document.getElementById("quoteContainer");

  const filteredQuotes = selectedCategory === "All"
    ? quotes
    : quotes.filter(q => q.category.toLowerCase() === selectedCategory.toLowerCase());

  if (filteredQuotes.length === 0) {
    container.innerHTML = `<p>No quotes available for "${selectedCategory}".</p>`;
    return;
  }

  container.innerHTML = filteredQuotes.map(q => `
    <blockquote>
      "${q.text}"
      <footer>- ${q.category}</footer>
    </blockquote>
  `).join("");
}

// --- RANDOM QUOTE ---
function showRandomQuote() {
  const container = document.getElementById("quoteContainer");
  const filteredQuotes = selectedCategory === "All"
    ? quotes
    : quotes.filter(q => q.category.toLowerCase() === selectedCategory.toLowerCase());

  if (filteredQuotes.length === 0) {
    container.innerHTML = `<p>No quotes for "${selectedCategory}".</p>`;
    return;
  }

  const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
  const quote = filteredQuotes[randomIndex];

  container.innerHTML = `
    <blockquote>
      "${quote.text}"
      <footer>- ${quote.category}</footer>
    </blockquote>
  `;

  sessionStorage.setItem("lastQuote", JSON.stringify(quote));
}

// --- ADD QUOTE FORM ---
function createAddQuoteForm() {
  const formContainer = document.getElementById("formContainer");
  formContainer.innerHTML = "";

  const form = document.createElement("form");

  const textInput = document.createElement("input");
  textInput.type = "text";
  textInput.placeholder = "Enter quote text";
  textInput.required = true;

  const categoryInput = document.createElement("input");
  categoryInput.type = "text";
  categoryInput.placeholder = "Enter quote category";
  categoryInput.required = true;

  const submitBtn = document.createElement("button");
  submitBtn.type = "submit";
  submitBtn.textContent = "Add Quote";

  form.append(textInput, categoryInput, submitBtn);

  form.addEventListener("submit", async function (e) {
    e.preventDefault();

    const newQuote = { text: textInput.value.trim(), category: categoryInput.value.trim() };
    if (!newQuote.text || !newQuote.category) return alert("Please fill out both fields.");

    // --- Save locally ---
    quotes.push(newQuote);
    saveQuotes();
    populateCategories();
    filterQuotes();

    // --- Simulate POST to server ---
    try {
      const res = await fetch("https://jsonplaceholder.typicode.com/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newQuote),
      });
      const data = await res.json();
      console.log("Quote sent to server:", data);
    } catch (err) {
      console.error("Failed to post quote:", err);
    }

    form.reset();
  });

  formContainer.appendChild(form);
}

// --- EXPORT / IMPORT ---
function exportQuotes() {
  const dataStr = JSON.stringify(quotes, null, 2);
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "quotes.json";
  document.body.appendChild(a);
  a.click();

  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
function importQuotes(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();

  reader.onload = function (e) {
    try {
      const imported = JSON.parse(e.target.result);
      if (Array.isArray(imported)) {
        imported.forEach(q => q.text && q.category && quotes.push(q));
        saveQuotes();
        populateCategories();
        filterQuotes();
      } else {
        alert("Invalid JSON format");
      }
    } catch (err) {
      alert("Error: " + err.message);
    }
  };
  reader.readAsText(file);
}

// --- NOTIFICATION UI ---
function showNotification(message, type = "info") {
  const notif = document.getElementById("notification");
  notif.textContent = message;
  notif.className = type;
  notif.style.display = "block";
  setTimeout(() => { notif.style.display = "none"; }, 4000);
}

// --- SERVER SYNC LOGIC ---
async function syncQuotes() {
  try {
    const res = await fetch("https://jsonplaceholder.typicode.com/posts?_limit=5");
    const data = await res.json();

    // Map fake posts to our quote structure
    const serverQuotes = data.map(post => ({
      text: post.title,
      category: "Server",
    }));

    // --- Conflict Detection ---
    let conflicts = [];
    serverQuotes.forEach(serverQ => {
      const localQ = quotes.find(local => local.text === serverQ.text);
      if (!localQ) {
        // New quote from server → add
        quotes.push(serverQ);
      } else if (localQ.category !== serverQ.category) {
        // Conflict: different category for same text
        conflicts.push({ local: localQ, server: serverQ });
        // By default, server wins
        localQ.category = serverQ.category;
      }
    });

    if (conflicts.length > 0) {
      saveQuotes();
      populateCategories();
      filterQuotes();
      showNotification("Conflicts resolved: server data took precedence", "warning");

      // Optionally show manual resolution
      const conflictContainer = document.getElementById("conflictContainer");
      conflictContainer.innerHTML = "<h3>Conflicts Detected:</h3>";
      conflicts.forEach(c => {
        const div = document.createElement("div");
        div.innerHTML = `
          <p><strong>Quote:</strong> "${c.local.text}"</p>
          <p>Local Category: ${c.local.category}</p>
          <p>Server Category: ${c.server.category}</p>
          <button class="resolveBtn">Keep Local</button>
          <hr>
        `;
        div.querySelector(".resolveBtn").addEventListener("click", () => {
          c.local.category = c.local.category; // revert to local
          saveQuotes();
          populateCategories();
          filterQuotes();
          showNotification("Conflict resolved manually (kept local)", "success");
        });
        conflictContainer.appendChild(div);
      });
    } else {
      saveQuotes();
      populateCategories();
      filterQuotes();
      showNotification("Quotes synced with server", "success");
    }

  } catch (err) {
    console.error("Server fetch failed:", err);
    showNotification("Failed to sync with server", "error");
  }
}

// --- INITIALIZATION ---
document.addEventListener("DOMContentLoaded", function () {
  const lastQuote = sessionStorage.getItem("lastQuote");
  if (lastQuote) {
    const q = JSON.parse(lastQuote);
    document.getElementById("quoteContainer").innerHTML = `
      <blockquote>
        "${q.text}"
        <footer>- ${q.category}</footer>
      </blockquote>
    `;
  } else {
    filterQuotes();
  }

  // Buttons
  document.getElementById("randomBtn")?.addEventListener("click", showRandomQuote);
  document.getElementById("addQuoteBtn")?.addEventListener("click", createAddQuoteForm);
  document.getElementById("exportBtn")?.addEventListener("click", exportQuotes);
  document.getElementById("importInput")?.addEventListener("change", importQuotes);
  document.getElementById("categoryFilter")?.addEventListener("change", e => {
    selectedCategory = e.target.value;
    saveSelectedCategory();
    filterQuotes();
  });

  populateCategories();

  // --- Periodic sync every 15s ---
  fetchQuotesFromServer();
  setInterval(syncQuotes, 15000);
});
