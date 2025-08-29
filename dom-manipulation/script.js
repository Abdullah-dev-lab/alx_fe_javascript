
let quotes = JSON.parse(localStorage.getItem("quotes")) || [
  { text: "The best way to get started is to quit talking and begin doing.", category: "Motivation" },
  { text: "Life is what happens when you're busy making other plans.", category: "Life" },
  { text: "Success is not final, failure is not fatal: it is the courage to continue that counts.", category: "Success" },
];

let selectedCategory = localStorage.getItem("selectedCategory") || "All"; 

function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
  populateCategoryFilter();
}

function saveSelectedCategory() {
  localStorage.setItem("selectedCategory", selectedCategory);
}

function showRandomQuote() {
  const quoteContainer = document.getElementById("quoteContainer");

  let filteredQuotes = selectedCategory === "All" 
    ? quotes 
    : quotes.filter(q => q.category.toLowerCase() === selectedCategory.toLowerCase());

  if (quotes.length === 0) {
    quoteContainer.innerHTML = "<p>No quotes available. Please add one!</p>";
    return;
  }

  const randomIndex = Math.floor(Math.random() * quotes.length);
  const quote = quotes[randomIndex];

  quoteContainer.innerHTML = `
    <blockquote>
      "${quote.text}"
      <footer>- ${quote.category}</footer>
    </blockquote>
  `;

   sessionStorage.setItem("lastQuote", JSON.stringify(quote));
}

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

  form.appendChild(textInput);
  form.appendChild(categoryInput);
  form.appendChild(submitBtn);

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    const newQuote = {
      text: textInput.value.trim(),
      category: categoryInput.value.trim(),
    };

    if (newQuote.text && newQuote.category) {
      quotes.push(newQuote);

      saveQuotes();

      const quoteContainer = document.getElementById("quoteContainer");
      quoteContainer.innerHTML = `
        <blockquote>
          "${newQuote.text}"
          <footer>- ${newQuote.category}</footer>
        </blockquote>
      `;

       sessionStorage.setItem("lastQuote", JSON.stringify(newQuote));

      alert("Quote added successfully!");
      form.reset();
    } else {
      alert("Please fill out both fields.");
    }
  });

  formContainer.appendChild(form);
}

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
      const importedData = JSON.parse(e.target.result);

      if (Array.isArray(importedData)) {
        importedData.forEach(item => {
          if (item.text && item.category) {
            quotes.push(item);
          }
        });

        saveQuotes();

        alert("Quotes imported successfully!");
        showRandomQuote();
      } else {
        alert("Invalid file format. Expected an array of quotes.");
      }
    } catch (err) {
      alert("Error reading file: " + err.message);
    }
  };

  reader.readAsText(file);
}

function populateCategoryFilter() {
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

ocument.addEventListener("DOMContentLoaded", function () {
  const quoteContainer = document.getElementById("quoteContainer");

  const lastQuote = sessionStorage.getItem("lastQuote");
  if (lastQuote) {
    const parsed = JSON.parse(lastQuote);
    quoteContainer.innerHTML = `
      <blockquote>
        "${parsed.text}"
        <footer>- ${parsed.category}</footer>
      </blockquote>
    `;
  } else {
    showRandomQuote();
  }

  populateCategoryFilter();
});
